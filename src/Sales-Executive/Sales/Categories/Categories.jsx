import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { masterListAPI } from "../../../services/api";
import apiConfigManager from "../../../services/apiConfig";
import Header from "../../header/Header";
import PageNavigate from "../Cart/PageNavigate";
import OciImage from "../../../components/OciImage";
import Spinner from "../../components/Spinner/Spinner";
import "./Categories.css";

const Category = () => {
  const navigate = useNavigate();
  const { brandName } = useParams();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSubcategory, setSearchSubcategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [brandName]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setCategories([]);
      setSubcategories([]);
      setSelectedCategory(null);

      const unitCode = apiConfigManager.getUnitCode();
      if (!unitCode) return;

      const response = await masterListAPI({
        partNumber: null, sortOrder: "ASC", customerCode: unitCode,
        aggregate: null, brand: brandName || null, fuelType: null,
        limit: 0, make: null, masterType: "aggregate",
        model: null, offset: 0, primary: false,
        subAggregate: null, variant: null, year: null,
      });

      const formatted = (response?.data || []).map((item, i) => ({ id: i + 1, name: item.masterName }));
      setCategories(formatted);

      if (formatted.length > 0) {
        setSelectedCategory(formatted[0].name);
        fetchSubcategories(formatted[0].name);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryName) => {
    try {
      setLoadingSubcategories(true);
      setSubcategories([]);

      const unitCode = apiConfigManager.getUnitCode();
      if (!unitCode) return;

      const response = await masterListAPI({
        partNumber: null, sortOrder: "ASC", customerCode: unitCode,
        aggregate: categoryName, brand: brandName || null, fuelType: null,
        limit: 0, make: null, masterType: "subAggregate",
        model: null, offset: 0, primary: false,
        subAggregate: null, variant: null, year: null,
      });

      const formatted = (response?.data || []).map((item, i) => ({ id: i + 1, name: item.masterName }));
      setSubcategories(formatted);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setSearchSubcategory("");
    fetchSubcategories(category.name);
  };

  const handleSubcategoryClick = (subcategory) => {
    const params = new URLSearchParams({
      category: selectedCategory,
      subcategory: subcategory.name,
      ...(brandName && { brand: brandName }),
    });
    navigate(`/product-listing?${params.toString()}`);
  };

  const handleCategoryScroll = (direction) => {
    const container = document.querySelector(".make-items-wrapper");
    if (container) container.scrollLeft += direction === "left" ? -300 : 300;
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const filteredSubcategories = subcategories.filter(s =>
    s.name.toLowerCase().includes(searchSubcategory.toLowerCase())
  );

  return (
    <div className="make-model-page">
      <Header />
      <div className="make-model-container">
        <div className="header-row">
          <PageNavigate />
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Category"
                className="search-input"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
            </div>
          </div>
        </div>

        {brandName && (
          <div className="brand-filter-label">
            Showing categories for: <strong>{brandName}</strong>
          </div>
        )}

        {/* Category strip */}
        <div className="make-section">
          <button className="category-scroll-button category-scroll-left" onClick={() => handleCategoryScroll("left")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11 17L6 12L11 7M18 17L13 12L18 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="make-container">
            <div className="make-items-wrapper">
              {loading ? (
                <Spinner text="Loading categories..." />
              ) : filteredCategories.length === 0 ? (
                <div className="cat-placeholder">No categories found</div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`make-item ${selectedCategory === category.name ? "active" : ""}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="make-image-container">
                      <OciImage partNumber={category.name} folder="categories" className="category-image" alt={category.name} />
                    </div>
                    <div className="make-name">{category.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="category-scroll-button category-scroll-right" onClick={() => handleCategoryScroll("right")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 7L18 12L13 17M6 7L11 12L6 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Subcategory grid */}
        <div className="model-section">
          <div className="model-header-row">
            <h2 className="model-heading">
              {selectedCategory ? `${selectedCategory} — Sub Categories` : "Select a category to view sub categories"}
            </h2>
            <div className="search-container">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by Sub Category"
                  className="search-input"
                  value={searchSubcategory}
                  onChange={(e) => setSearchSubcategory(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="model-grid">
            {loadingSubcategories ? (
              <div className="cat-placeholder" style={{ gridColumn: "1 / -1" }}><Spinner text="Loading sub categories..." /></div>
            ) : filteredSubcategories.length === 0 ? (
              <div className="cat-placeholder" style={{ gridColumn: "1 / -1" }}>
                {selectedCategory
                  ? searchSubcategory ? "No sub categories match your search" : "No sub categories available"
                  : "Select a category first"}
              </div>
            ) : (
              filteredSubcategories.map((subcategory) => (
                <div key={subcategory.id} className="model-item" onClick={() => handleSubcategoryClick(subcategory)}>
                  <div className="model-image-container">
                    <OciImage partNumber={subcategory.name} folder="subcategories" className="subcategory-image" alt={subcategory.name} />
                  </div>
                  <div className="model-name">{subcategory.name}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
