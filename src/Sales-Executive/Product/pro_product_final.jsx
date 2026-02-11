import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../header/Header';
import FilterNavigation from './filter_Navigation';
import ProFilter from './pro_filter';
import ProProduct from './pro_product';
import '../../../styles/customer/productss/pro_product_final.css';

const API_BASE_URL = 'http://localhost:5000/api';

console.log('==========================================');
console.log('🎯 PRO_PRODUCT_FINAL.JSX LOADED');
console.log('==========================================');

const ProProductFinal = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 500; // Fetch 500 items per batch for optimal performance
  const observer = useRef();
  const loadingRef = useRef(false);
  const initialLoadDone = useRef(false);

  console.log('🏁 ProProductFinal component rendering...');
  console.log('🔍 Current products count:', products.length);

  // Initialize filters from URL parameters
  const getInitialFilters = () => {
    const urlMake = searchParams.get('make');
    const urlModel = searchParams.get('model');
    const urlYear = searchParams.get('year');
    const urlVariant = searchParams.get('variant');

    return {
      brand: [],
      make: urlMake ? [urlMake] : [],
      model: urlModel ? [urlModel] : [],
      variant: urlVariant ? [urlVariant] : [],
      fuelType: [],
      year: urlYear ? [urlYear] : [],
      category: [],
      subCategory: [],
      price: { min: 0, max: 10000 }
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());

  // Debug: Log initial state
  console.log('🎬 ProProductFinal mounted, initial filters:', JSON.stringify(filters, null, 2));

  // Fetch products from API based on filters
  const fetchProducts = async (filterParams, currentOffset = 0, append = false) => {
    console.log('🔍 fetchProducts called with:', { filterParams, currentOffset, append });
    
    // Prevent duplicate API calls
    if (loadingRef.current) {
      console.log('⚠️ Already loading, skipping...');
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const requestBody = {
        brandPriority: null,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
        sortOrder: "ASC",
        fieldOrder: null,
        customerCode: "0046",
        partNumber: null,
        model: filterParams.model.length > 0 ? filterParams.model[0] : null,
        brand: filterParams.brand.length > 0 ? filterParams.brand[0] : null,
        subAggregate: filterParams.subCategory.length > 0 ? filterParams.subCategory[0] : null,
        aggregate: filterParams.category.length > 0 ? filterParams.category[0] : null,
        make: filterParams.make.length > 0 ? filterParams.make[0] : null,
        variant: filterParams.variant.length > 0 ? filterParams.variant[0] : null,
        fuelType: filterParams.fuelType.length > 0 ? filterParams.fuelType[0] : null,
        vehicle: null,
        year: filterParams.year.length > 0 ? parseInt(filterParams.year[0]) || filterParams.year[0] : null
      };

      console.log('📤 Sending API request with body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post(`${API_BASE_URL}/parts-list`, requestBody);

      console.log('📥 API Response received:', {
        success: response.data.success,
        count: response.data.count,
        dataLength: response.data.data?.length,
        data: response.data.data
      });

      if (response.data.success) {
        const totalAvailable = response.data.count || 0;
        setTotalCount(totalAvailable);
        
        const productsData = response.data.data.map((item, index) => ({
          id: `${item.partNumber || 'unknown'}-${currentOffset}-${index}-${Date.now()}`,
          productImage: "", // No image in API response
          brand: item.brandName || "N/A",
          inStock: true, // Default to true, API doesn't provide stock status
          eta: "1-2 Days", // Default ETA
          productName: item.itemDescription || "No Description",
          price: item.listPrice || "0.00",
          originalPrice: item.mrp || null,
          isInWishlist: false,
          partNumber: item.partNumber,
          aggregate: item.aggregate,
          subAggregate: item.subAggregate,
          hsnCode: item.hsnCode,
          taxpercent: item.taxpercent
        }));

        if (append) {
          const newProducts = [...products, ...productsData];
          setProducts(newProducts);
          console.log('✅ Appended products, new total:', newProducts.length, '/', totalAvailable);
          
          // Check if we've loaded all products based on total count
          setHasMore(newProducts.length < totalAvailable);
        } else {
          setProducts(productsData);
          console.log('✅ Set products (replaced):', productsData.length, '/', totalAvailable);
          
          // Check if there are more products to load
          setHasMore(productsData.length < totalAvailable);
        }
        
        setOffset(currentOffset + productsData.length);
        
        const currentTotal = append ? products.length + productsData.length : productsData.length;
        console.log(`✅ Loaded ${productsData.length} products (offset: ${currentOffset}, loaded: ${currentTotal}/${totalAvailable})`);
        
        // Auto-fetch next batch if there are more products
        if (currentTotal < totalAvailable && !append) {
          console.log('🔄 Auto-fetching next batch...');
          setTimeout(() => {
            fetchProducts(filterParams, currentTotal, true);
          }, 100);
        }
        console.log('📊 Product details:', productsData.map(p => ({ id: p.id, brand: p.brand, name: p.productName })));
      } else {
        console.error('Failed to fetch products:', response.data.message);
        if (!append) {
          setProducts([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (!append) {
        setProducts([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (hasMore && !loadingRef.current) {
      fetchProducts(filters, offset, true);
    }
  }, [filters, offset, hasMore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intersection observer callback for last product
  const lastProductRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMoreProducts]);

  // Fetch products when filters change (reset to first page)
  useEffect(() => {
    console.log('🔄 useEffect triggered - filters changed:', JSON.stringify(filters, null, 2));
    
    // Check if we have at least one filter selected (excluding price)
    const hasActiveFilters = Object.keys(filters).some(key => {
      if (key === 'price') return false;
      return Array.isArray(filters[key]) && filters[key].length > 0;
    });
    
    console.log('📋 Has active filters:', hasActiveFilters);
    
    // Only fetch if we have active filters
    if (!hasActiveFilters) {
      console.log('⏸️ No filters selected, skipping fetch');
      setProducts([]);
      return;
    }
    
    // Always fetch products when filters change
    console.log('🚀 Starting product fetch...');
    
    // Reset loading ref and pagination
    loadingRef.current = false; // Reset the loading ref before fetching
    setOffset(0);
    setHasMore(true);
    setProducts([]);
    fetchProducts(filters, 0, false);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (newFilters) => {
    console.log('🔔 handleFilterChange called with:', JSON.stringify(newFilters, null, 2));
    setFilters(newFilters);
    console.log('✅ Filters state updated in parent');
  };

  // Handle clicking on filter breadcrumb - clear clicked filter and all subsequent filters
  const handleFilterBreadcrumbClick = (clickedIndex) => {
    const filterOrder = ['brand', 'make', 'model', 'year', 'variant', 'fuelType', 'category', 'subCategory'];
    const updatedFilters = { ...filters };

    // Clear the clicked filter and all filters that come after it
    for (let i = clickedIndex; i < filterOrder.length; i++) {
      updatedFilters[filterOrder[i]] = [];
    }

    setFilters(updatedFilters);
    console.log('Filter breadcrumb clicked, cleared filters:', updatedFilters);
  };

  const handleAddToCart = (productId) => {
    console.log(`Product ${productId} added to cart`);
    alert('Product added to cart successfully!');
  };

  const handleToggleWishlist = (productId, isFavorite) => {
    console.log(`Product ${productId} ${isFavorite ? 'added to' : 'removed from'} wishlist`);
  };

  return (
    <>
      {/* Header Section */}
      <Header />
      
      <div className="pro-product-final-container">
        {/* Left Side - Filter Section */}
        <aside className="pro-filter-sidebar">
          <ProFilter onFilterChange={handleFilterChange} externalFilters={filters} />
        </aside>

      {/* Right Side - Products Grid */}
      <main className="pro-products-main">
        {/* Filter Navigation */}
        <FilterNavigation filters={filters} onFilterClick={handleFilterBreadcrumbClick} />
        
        {loading && products.length === 0 ? (
          <div className="products-loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="products-no-data">No products found. Please adjust your filters.</div>
        ) : (
          <>
            <div className="pro-products-grid">
              {products.map((product, index) => {
                // Attach ref to the last product for infinite scroll
                if (products.length === index + 1) {
                  return (
                    <div ref={lastProductRef} key={product.id}>
                      <ProProduct
                        productImage={product.productImage}
                        brand={product.brand}
                        inStock={product.inStock}
                        eta={product.eta}
                        productName={product.productName}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        isInWishlist={product.isInWishlist}
                        onAddToCart={() => handleAddToCart(product.id)}
                        onToggleWishlist={(isFavorite) => handleToggleWishlist(product.id, isFavorite)}
                      />
                    </div>
                  );
                }
                return (
                  <ProProduct
                    key={product.id}
                    productImage={product.productImage}
                    brand={product.brand}
                    inStock={product.inStock}
                    eta={product.eta}
                    productName={product.productName}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    isInWishlist={product.isInWishlist}
                    onAddToCart={() => handleAddToCart(product.id)}
                    onToggleWishlist={(isFavorite) => handleToggleWishlist(product.id, isFavorite)}
                  />
                );
              })}
            </div>
            {loading && products.length > 0 && (
              <div className="products-loading-more">Loading more products...</div>
            )}
          </>
        )}
      </main>
    </div>
    </>
  );
};

export default ProProductFinal;
