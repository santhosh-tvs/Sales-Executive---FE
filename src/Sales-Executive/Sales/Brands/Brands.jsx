import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import PageNavigate from '../Cart/PageNavigate';
import './Brands.css';

const Brands = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Brand data without icons - ready for actual brand images
  const brands = [
    { id: 1, name: 'HELLA', category: 'Lighting' },
    { id: 2, name: 'LUK', category: 'Clutch' },
    { id: 3, name: 'BOSCH', category: 'Auto Parts' },
    { id: 4, name: 'Continental', category: 'Tires' },
    { id: 5, name: 'SACHS', category: 'Suspension' },
    { id: 6, name: 'LEMFÖRDER', category: 'Chassis' },
    { id: 7, name: 'LIQUI MOLY', category: 'Lubricants' },
    { id: 8, name: 'Valeo', category: 'Electrical' },
    { id: 9, name: 'DANA', category: 'Drivetrain' },
    { id: 10, name: 'INA', category: 'Bearings' },
    { id: 11, name: 'Finnolex', category: 'Cables' },
    { id: 12, name: 'JK Pioneer', category: 'Industrial' },
    { id: 13, name: 'SCHAEFFLER', category: 'Motion' },
    { id: 14, name: 'SPICER', category: 'Driveline' },
    { id: 15, name: 'LUMAX', category: 'Lighting' },
    { id: 16, name: 'SKF', category: 'Bearings' },
    { id: 17, name: 'Autokol', category: 'Fasteners' },
    { id: 18, name: 'myTVS', category: 'Two Wheeler' },
    { id: 19, name: 'Delphi Technologies', category: 'Technology' },
    { id: 20, name: 'CHAMPION', category: 'Spark Plugs' },
    { id: 21, name: '3M', category: 'Adhesives' },
    { id: 22, name: 'PHC', category: 'Brake Parts' },
    { id: 23, name: 'elofic', category: 'Electronics' },
    { id: 24, name: 'BEHR', category: 'Thermal' },
    { id: 25, name: 'MAHLE', category: 'Engine Parts' },
    { id: 26, name: 'MFC', category: 'Manufacturing' },
    { id: 27, name: 'Castrol', category: 'Lubricants' },
    { id: 28, name: 'EXEDY', category: 'Clutch' },
    { id: 29, name: 'DENSO', category: 'Auto Parts' },
    { id: 30, name: 'NGK', category: 'Ignition' },
    { id: 31, name: 'Rane', category: 'Brake Systems' },
    { id: 32, name: 'SMIC', category: 'Manufacturing' },
    { id: 33, name: 'GOODYEAR', category: 'Tires' }
  ];

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
                    <span className="brand-placeholder">No Image</span>
                  </div>
                  <div className="brand-name">{brand.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands;