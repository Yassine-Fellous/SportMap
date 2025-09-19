// Frontend/src/config/performance.js
export const PERFORMANCE_CONFIG = {
  // Pagination
  ITEMS_PER_PAGE: 50,
  VIRTUAL_LIST_OVERSCAN: 5,
  
  // Debounce
  SEARCH_DEBOUNCE: 300,
  FILTER_DEBOUNCE: 150,
  
  // Cache
  QUERY_STALE_TIME: 5 * 60 * 1000,
  QUERY_CACHE_TIME: 10 * 60 * 1000,
  
  // Mapbox
  MAP_MAX_ZOOM: 18,
  MAP_MIN_ZOOM: 10,
  CLUSTER_RADIUS: 50
};