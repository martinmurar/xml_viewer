import {AppState} from "./state.js";
import {removeAccents} from "./utils.js";
import {renderTable} from "./ui.js";
import {applySorting} from "./sort.js";


export async function filterTable() {
    clearTimeout(AppState.searchTimeout);
    
    const searchQuery = removeAccents(document.getElementById("searchInput").value.toUpperCase());
    const selectedCategories = Array.from(document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:checked:not(#allCategoriesCheckbox)')).map(cb => cb.value);
    const selectedStockRadio = document.querySelector('input[name="stockStatus"]:checked');
    const stockQuery = selectedStockRadio ? selectedStockRadio.value : "";

    AppState.searchTimeout = setTimeout(() => {
        AppState.filteredProducts = AppState.allProducts.filter(p => {
            const matchesSearch = removeAccents(p.name.toUpperCase()).includes(searchQuery) || 
                                  removeAccents(p.brand.toUpperCase()).includes(searchQuery) ||
                                  removeAccents(p.ean.toUpperCase()).includes(searchQuery);
                                  
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