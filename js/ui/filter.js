import {AppState} from "../core/state.js";
import {removeAccents} from "../core/utils.js";
import {renderTable} from "./ui.js";
import {applySorting} from "./sort.js";


export async function filterTable() {
    clearTimeout(AppState.searchTimeout);
    
    const searchQuery = removeAccents(document.getElementById("searchInput").value.toUpperCase().trim());
    const selectedCategories = Array.from(document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:checked:not(#allCategoriesCheckbox)')).map(cb => cb.value);
    const selectedStockRadio = document.querySelector('input[name="stockStatus"]:checked');
    const stockQuery = selectedStockRadio ? selectedStockRadio.value : "";

    AppState.searchTimeout = setTimeout(() => {
        AppState.filteredProducts = AppState.allProducts.filter(p => {
            // Split search query into words and check if any word matches
            const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);
            const matchesSearch = searchWords.length === 0 || searchWords.some(word => 
                removeAccents(p.name.toUpperCase()).includes(word) || 
                removeAccents(p.brand.toUpperCase()).includes(word) ||
                removeAccents(p.ean.toUpperCase()).includes(word)
            );
                                  
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