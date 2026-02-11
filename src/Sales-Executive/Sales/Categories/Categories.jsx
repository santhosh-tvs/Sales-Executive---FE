import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../../services/apiservice";
import Header from "../../header/Header";
import PageNavigate from "../Cart/PageNavigate";
import "./Categories.css";

// Cache keys
const CACHE_KEYS = {
  CATEGORIES_DATA: "categories_data",
  SUBCATEGORIES_DATA: "subcategories_data",
  TIMESTAMP: "categories_cache_timestamp",
};

// Cache duration: 24 hours (in milliseconds)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const CNG = () => {
  const navigate = useNavigate();
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchSubcategory, setSearchSubcategory] = useState("");

  // Check if cache is valid
  const isCacheValid = () => {
    const timestamp = sessionStorage.getItem(CACHE_KEYS.TIMESTAMP);
    if (!timestamp) return false;
    const age = Date.now() - parseInt(timestamp, 10);
    return age < CACHE_DURATION;
  };

  // Get cached data
  const getCachedData = (key) => {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Cache read error:", err);
      return null;
    }
  };

  // Set cached data
  const setCachedData = (key, data) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error("Cache write error:", err);
    }
  };

  // Fetch unique categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Check if we have valid cached categories
      if (isCacheValid()) {
        const cachedCategories = getCachedData(CACHE_KEYS.CATEGORIES_DATA);
        if (cachedCategories && cachedCategories.length > 0) {
          console.log("Loading categories from cache - instant load!");
          setCategories(cachedCategories);

          // Auto-select first category
          if (cachedCategories.length > 0) {
            setSelectedCategory(cachedCategories[0].name);
            fetchSubcategories(cachedCategories[0].name);
          }

          setLoading(false);
          return;
        }
      }

      // No cache or expired - fetch from API
      console.log("Fetching categories from API...");

      const requestBody = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: "0046",
        aggregate: null,
        brand: null,
        fuelType: null,
        limit: 0,
        make: null,
        masterType: "aggregate",
        model: null,
        offset: 0,
        primary: false,
        subAggregate: null,
        variant: null,
        year: null
      };

      const response = await apiService.post("/filter", requestBody);

      console.log("API Response:", response);

      // Extract data from response
      const categoriesData = response.data || [];

      console.log("Categories Data:", categoriesData);

      if (categoriesData && categoriesData.length > 0) {
        // Map the masterName from API response to category objects
        const formattedCategories = categoriesData.map((item, index) => ({
          id: index + 1,
          name: item.masterName,
          image: "",
        }));

        console.log("Formatted Categories:", formattedCategories);

        // Cache the categories data
        setCachedData(CACHE_KEYS.CATEGORIES_DATA, formattedCategories);
        sessionStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());

        setCategories(formattedCategories);
        console.log("Categories Data Set and Cached:", formattedCategories);
        
        // Auto-select first category
        if (formattedCategories.length > 0) {
          setSelectedCategory(formattedCategories[0].name);
          fetchSubcategories(formattedCategories[0].name);
        }
      } else {
        console.warn("No categories data found in response");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subcategories for selected category
  const fetchSubcategories = async (categoryName) => {
    try {
      setLoadingSubcategories(true);

      // Check if we have cached subcategories for this category
      const cachedSubcategoriesData = getCachedData(CACHE_KEYS.SUBCATEGORIES_DATA);
      if (cachedSubcategoriesData && cachedSubcategoriesData[categoryName]) {
        console.log(
          `Loading subcategories for ${categoryName} from cache - instant load!`
        );
        setSubcategories(cachedSubcategoriesData[categoryName]);
        setLoadingSubcategories(false);
        return;
      }

      // No cache - fetch from API using filter endpoint with masterType: "subAggregate"
      console.log(`Fetching subcategories for ${categoryName} from API...`);

      const requestBody = {
        partNumber: null,
        sortOrder: "ASC",
        customerCode: "0046",
        aggregate: categoryName,
        brand: null,
        fuelType: null,
        limit: 0,
        make: null,
        masterType: "subAggregate",
        model: null,
        offset: 0,
        primary: false,
        subAggregate: null,
        variant: null,
        year: null
      };

      const response = await apiService.post("/filter", requestBody);
      const subcategoriesData = response.data || [];

      console.log("Subcategories for", categoryName, ":", subcategoriesData);

      if (subcategoriesData && subcategoriesData.length > 0) {
        // Map the masterName from API response to subcategory objects
        const formattedSubcategories = subcategoriesData.map((item, index) => ({
          id: index + 1,
          name: item.masterName,
          image: "",
        }));

        console.log("Formatted Subcategories:", formattedSubcategories);

        // Cache the subcategories data for this category
        const currentCache = getCachedData(CACHE_KEYS.SUBCATEGORIES_DATA) || {};
        currentCache[categoryName] = formattedSubcategories;
        setCachedData(CACHE_KEYS.SUBCATEGORIES_DATA, currentCache);

        setSubcategories(formattedSubcategories);
        console.log("Subcategories Data Set and Cached:", formattedSubcategories);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Handle category selection
  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    fetchSubcategories(category.name);
  };

  // Handle subcategory click - navigate to product listing
  const handleSubcategoryClick = (subcategory) => {
    // Navigate to product listing page with category and subcategory parameters
    navigate(`/product-listing?category=${selectedCategory}&subcategory=${subcategory.name}`);
  };

  const handleCategoryScroll = (direction) => {
    const container = document.querySelector(".make-items-wrapper");
    const scrollAmount = 300;

    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Filter subcategories based on search
  const filteredSubcategories = subcategories.filter((subcategory) =>
    subcategory.name.toLowerCase().includes(searchSubcategory.toLowerCase())
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

        {/* Category Container */}
        <div className="make-section">
          <button
            className="category-scroll-button category-scroll-left"
            onClick={() => handleCategoryScroll("left")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 17L6 12L11 7M18 17L13 12L18 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="make-container">
            <div className="make-items-wrapper">
              {loading ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  No categories available
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`make-item ${
                      selectedCategory === category.name ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="make-image-container">
                      <span className="brand-placeholder">No Image</span>
                    </div>

                    <div className="make-name">{category.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            className="category-scroll-button category-scroll-right"
            onClick={() => handleCategoryScroll("right")}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 7L18 12L13 17M6 7L11 12L6 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Subcategory Container */}
        <div className="model-section">
          <div className="model-header-row">
            <h2 className="model-heading">
              {selectedCategory
                ? `${selectedCategory} - Available Sub Categories`
                : "Select a category to view sub categories"}
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
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  width: "100%",
                  gridColumn: "1 / -1",
                }}
              >
                Loading sub categories...
              </div>
            ) : filteredSubcategories.length === 0 ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  width: "100%",
                  gridColumn: "1 / -1",
                }}
              >
                {selectedCategory
                  ? searchSubcategory
                    ? "No sub categories match your search"
                    : "No sub categories available for this category"
                  : "Please select a category to view sub categories"}
              </div>
            ) : (
              filteredSubcategories.map((subcategory) => (
                <div 
                  key={subcategory.id} 
                  className="model-item"
                  onClick={() => handleSubcategoryClick(subcategory)}
                >
                  <div className="model-image-container">
                    <span className="brand-placeholder">No Image</span>
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

export default CNG;
