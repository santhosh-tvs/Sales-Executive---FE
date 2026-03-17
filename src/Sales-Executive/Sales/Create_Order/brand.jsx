import React, { useState, useEffect } from "react";
import Header from "../../";
import "../../../styles/home-components/Brands.css";
import searchIcon from "../../../assets/Icons/MagnifyingGlass.png";
import { masterListAPI } from "../../../services/api";
import apiConfigManager from "../../../services/apiConfig";
import OciImage from "../../../components/OciImage";

const HomeBrands = () => {
  console.log('🏠 HomeBrands component rendered');
  
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch brands from master list API on component mount
  useEffect(() => {
    console.log('🔄 HomeBrands useEffect triggered');
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    console.log('📡 fetchBrands called');
    setLoading(true);
    setError(null);
    
    try {
      // Initialize API config if not already done
      if (!apiConfigManager.isInitialized()) {
        console.log('⚠️ API config not initialized, fetching...');
        await apiConfigManager.fetchAndInitialize();
      }

      // Get unit_code from apiConfigManager (set from view customer API)
      const unitCode = apiConfigManager.getUnitCode();
      
      if (!unitCode) {
        throw new Error('Unit code not found. Please select a customer first.');
      }
      
      console.log('👤 Using unit code:', unitCode);

      const requestBody = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: unitCode, // Using unit_code instead of customer_code
        aggregate: null,
        brand: null,
        fuelType: null,
        limit: 240,
        make: null,
        masterType: "brand",
        model: null,
        offset: 0,
        primary: false,
        subAggregate: null,
        variant: null,
        year: null
      };
      
      console.log('📤 Calling masterListAPI with:', requestBody);
      const response = await masterListAPI(requestBody);
      console.log('📥 masterListAPI response:', response);
      
      if (response && response.success && response.data) {
        console.log('✅ Brands data received:', response.data.length, 'brands');
        
        // Transform API response to match component structure
        const transformedBrands = response.data.map((brand, index) => ({
          id: index + 1,
          name: brand.masterName,
        }));
        
        console.log('🔄 Transformed brands:', transformedBrands.slice(0, 3));
        setBrands(transformedBrands);
      } else {
        console.error('❌ Invalid response from masterListAPI');
        setError('Failed to load brands');
      }
    } catch (err) {
      console.error('❌ Error in fetchBrands:', err);
      setError('Error loading brands. Please try again.');
    } finally {
      console.log('🏁 fetchBrands completed, setting loading to false');
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Header />

      <div className="home-brand">
        <div className="home-brand-header">
          <h3>Brands</h3>
          <div className="home-brand-search-box">
            <input
              type="text"
              placeholder="Search Brand"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <img src={searchIcon} alt="Search" />
          </div>
        </div>

        {loading ? (
          <div className="home-brand-loading">
            <p>Loading brands...</p>
          </div>
        ) : error ? (
          <div className="home-brand-error">
            <p>{error}</p>
            <button onClick={fetchBrands}>Retry</button>
          </div>
        ) : (
          <div className="home-brand-grid">
            {filteredBrands.length === 0 ? (
              <div className="home-brand-no-results">
                <p>No brands found for "{search}"</p>
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div key={brand.id} className="home-brand-card">
                  <OciImage
                    partNumber={brand.name}
                    folder="brand"
                    className="home-brand-image"
                    alt={brand.name}
                  />
                  <div className="home-brand-name">{brand.name}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBrands;
