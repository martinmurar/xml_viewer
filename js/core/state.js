// export const XML_FILE = "assets/data/xml_sk.xml";
export const XML_FILE = "assets/data/xml_sk_feed_10426.xml";
export const ITEMS_PER_PAGE = 100;

export const AppState = {
    allProducts: [],
    filteredProducts: [],
    sortedProducts: [],
    searchTimeout: null,
    currentPage: 1,
    sortField: null, // 'name', 'price', 'stock', 'quantity'
    sortDirection: 'asc' // 'asc' or 'desc'
};