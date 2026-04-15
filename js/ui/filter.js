import {AppState} from "../core/state.js";
import {removeAccents} from "../core/utils.js";
import {renderTable} from "./ui.js";
import {applySorting} from "./sort.js";


const SEARCH_EVERY_WORD = false; // Set to false to search for the entire query as one item

export async function filterTable() {
    clearTimeout(AppState.searchTimeout);
    
    const searchQuery = removeAccents(document.getElementById("searchInput").value.toUpperCase().trim());
    const selectedCategories = Array.from(document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:checked:not(#allCategoriesCheckbox)')).map(cb => cb.value);
    const selectedStockRadio = document.querySelector('input[name="stockStatus"]:checked');
    const stockQuery = selectedStockRadio ? selectedStockRadio.value : "";

    AppState.searchTimeout = setTimeout(() => {
        AppState.filteredProducts = AppState.allProducts.filter(p => {
            let matchesSearch;
            if (SEARCH_EVERY_WORD) {
                // Split search query into words and check if any word matches
                const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);
                matchesSearch = searchWords.length === 0 || searchWords.some(word => 
                    removeAccents(p.name.toUpperCase()).includes(word) || 
                    removeAccents(p.brand.toUpperCase()).includes(word) ||
                    removeAccents(p.ean.toUpperCase()).includes(word) ||
                    removeAccents(p.sku.toUpperCase()).includes(word)
                );
            } else {
                // Search for the entire query as one item
                matchesSearch = searchQuery === "" || 
                    removeAccents(p.name.toUpperCase()).includes(searchQuery) || 
                    removeAccents(p.brand.toUpperCase()).includes(searchQuery) ||
                    removeAccents(p.ean.toUpperCase()).includes(searchQuery);
            }
                                  
            const matchesCategory = selectedCategories.length > 0 && selectedCategories.includes(p.category);

            const matchesStock = stockQuery === "" || 
                                 (stockQuery === "in-stock" && p.isInStock) || 
                                 (stockQuery === "out-of-stock" && !p.isInStock);

            return matchesSearch && matchesCategory && matchesStock;
        });

        AppState.currentPage = 1;
        applySorting();
    }, 250);
}