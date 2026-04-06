export const XML_FILE = "assets/data/xml_sk.xml";
export const ITEMS_PER_PAGE = 100;

export const AppState = {
    allProducts: [],
    filteredProducts: [],
    sortedProducts: [],
    searchTimeout: null,
    currentPage: 1,
    sortField: null, // 'name', 'price', 'quantity'
    sortDirection: 'asc' // 'asc' or 'desc'
};