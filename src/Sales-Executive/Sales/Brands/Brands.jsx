import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import { masterListAPI } from '../../../services/api';
import OciImage from '../../../components/OciImage';
import './Brands.css';

const Brands = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch brands from master list API on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // DIAGNOSTIC: Check localStorage API config
      const apiConfigRaw = localStorage.getItem('api_config');
      if (apiConfigRaw) {
        const apiConfigParsed = JSON.parse(apiConfigRaw);
        const masterListConfig = apiConfigParsed.find(api => api.api_name.toLowerCase() === 'master list');
        
        if (masterListConfig) {
          console.log('🔍 DIAGNOSTIC: Master List config from localStorage:');
          console.log('   Username:', masterListConfig.username ? `${masterListConfig.username.substring(0, 15)}...` : 'MISSING');
          console.log('   Password:', masterListConfig.password ? `${masterListConfig.password.substring(0, 15)}...` : 'MISSING');
          console.log('   Username has colon (encrypted?):', masterListConfig.username ? masterListConfig.username.includes(':') : 'N/A');
          console.log('   Password has colon (encrypted?):', masterListConfig.password ? masterListConfig.password.includes(':') : 'N/A');
          
          if (masterListConfig.username && masterListConfig.username.includes(':')) {
            console.error('🚨 CRITICAL: Username is still ENCRYPTED in localStorage!');
            console.error('   This means decryption failed during login.');
            console.error('   Please log out and log in again.');
          }
          
          if (masterListConfig.password && masterListConfig.password.includes(':')) {
            console.error('🚨 CRITICAL: Password is still ENCRYPTED in localStorage!');
            console.error('   This means decryption failed during login.');
            console.error('   Please log out and log in again.');
          }
        }
      }
      
      // Check if API config is initialized
      const user = JSON.parse(localStorage.getItem('user'));
      const customerCode = user?.customer_code || '0046';

      // Check if apiConfigManager is initialized
      const apiConfig = localStorage.getItem('api_config');
      if (!apiConfig) {
        console.error('❌ API configuration not found. Please log in again.');
        setError('API configuration not found. Please log in again.');
        setLoading(false);
        return;
      }

      const requestBody = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: customerCode,
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

      console.log('🔍 Fetching brands from master list API:', requestBody);
      
      const response = await masterListAPI(requestBody);
      
      if (response && response.success && response.data) {
        console.log('✅ Brands fetched successfully:', response.data.length);
        
        // Transform API response to match component structure
        const transformedBrands = response.data.map((brand, index) => ({
          id: index + 1,
          name: brand.masterName,
          category: 'Auto Parts' // Default category since API doesn't provide it
        }));
        
        setBrands(transformedBrands);
      } else {
        console.error('❌ Failed to fetch brands:', response);
        setError('Failed to load brands. The external API may be unavailable.');
      }
    } catch (err) {
      console.error('❌ Error fetching brands:', err);
      
      // Check if it's a 401 error
      if (err.response && err.response.status === 401) {
        setError('Authentication failed. Your API credentials may have expired. Please log in again.');
      } else {
        setError('Error loading brands. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      brand.name.toLowerCase().includes(searchLower) ||
      brand.category.toLowerCase().includes(searchLower)
    );
  });

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    console.log('Selected brand:', brand);
    // Navigate to categories page
    navigate(`/categories/${brand.name}`);
  };

  return (
    <div className="brands-page">
      <Header />
      <div className="brands-container">
        <div className="header-row">
          <PageNavigate />
          
          {/* Search Section */}
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Brand"
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="brands-section">
          <h2 className="brands-heading">Select a Brand</h2>
          
          {loading ? (
            <div className="loading-message">
              <p>Loading brands...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchBrands} className="retry-button">Retry</button>
            </div>
          ) : (
            <div className="brands-grid">
              {filteredBrands.length === 0 ? (
                <div className="no-results">
                  <p>No brands found for "{searchTerm}"</p>
                </div>
              ) : (
                filteredBrands.map((brand) => (
                  <div 
                    key={brand.id} 
                    className="brand-item"
                    onClick={() => handleBrandSelect(brand)}
                  >
                    <div className="brand-image-container">
                      <OciImage
                        partNumber={brand.name}
                        folder="brand"
                        className="brand-image"
                        alt={brand.name}
                      />
                    </div>
                    <div className="brand-name">{brand.name}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Brands;