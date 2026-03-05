/**
 * Application Constants
 */

// Recommended brands for myTVS Recommended Products section
export const RECOMMENDED_BRANDS = [
  'VALEO',
  'FILTRON',
  'BOSCH',
  'MONROE',
  'DELPHI',
  'MYTVS'
];

/**
 * Check if a brand is in the recommended list
 * @param {string} brand - Brand name to check
 * @returns {boolean} - True if brand is recommended
 */
export const isRecommendedBrand = (brand) => {
  if (!brand) return false;
  return RECOMMENDED_BRANDS.includes(brand.toUpperCase());
};
/**
 * Get brand priority (lower number = higher priority)
 * @param {string} brand - Brand name
 * @returns {number} - Priority index (0 = highest priority)
 */
export const getBrandPriority = (brand) => {
  if (!brand) return 999;
  const index = RECOMMENDED_BRANDS.indexOf(brand.toUpperCase());
  return index === -1 ? 999 : index;
};

/**
 * Sort products by brand priority
 * VALEO products appear first, MYTVS products appear last
 * @param {Array} products - Array of products to sort
 * @returns {Array} - Sorted array of products
 */
export const sortByBrandPriority = (products) => {
  return [...products].sort((a, b) => {
    const priorityA = getBrandPriority(a.brand || a.brandName);
    const priorityB = getBrandPriority(b.brand || b.brandName);
    return priorityA - priorityB;
  });
};
