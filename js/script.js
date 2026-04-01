import {AppState, XML_FILE} from "./state.js";
import {mapItemToProduct} from "./mapper.js";
import {renderTable} from "./ui.js";
import {filterTable} from "./filter.js";
import {populateCategories, updateCategoryButtonText, toggleCategoryDropdown, handleCategoryChange} from "./category.js";
import {toggleStockDropdown, handleStockChange} from "./stock.js";



async function initializeApp() {
    const status = document.getElementById("loadingStatus");
    try {
        const response = await fetch(XML_FILE);
        if (!response.ok) throw new Error("Súbor sa nepodarilo načítať.");
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const items = Array.from(xmlDoc.getElementsByTagName("ITEM"));

        AppState.allProducts = items.map(item => mapItemToProduct(item));
        
        populateCategories(AppState.allProducts);
        
        // Initialize all category checkboxes as checked
        document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:not(#allCategoriesCheckbox)').forEach(cb => cb.checked = true);
        document.getElementById("allCategoriesCheckbox").checked = true;
        document.getElementById("allCategoriesCheckbox").indeterminate = false;
        updateCategoryButtonText();
        
        // Initialize stock status
        document.getElementById("allStockRadio").checked = true;
        handleStockChange();
        
        AppState.filteredProducts = AppState.allProducts;
        renderTable(AppState.allProducts);

    } catch (error) {
        status.innerHTML = `<b style="color:red;">Chyba: ${error.message}</b>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    
    document.getElementById("searchInput").addEventListener("keyup", filterTable);
    document.getElementById("categoryDropdownToggle").addEventListener("click", toggleCategoryDropdown);
    document.getElementById("allCategoriesCheckbox").addEventListener("change", handleCategoryChange);
    document.getElementById("stockDropdownToggle").addEventListener("click", toggleStockDropdown);
    
    // Add event listeners for stock radio buttons
    document.querySelectorAll('input[name="stockStatus"]').forEach(radio => {
        radio.addEventListener("change", handleStockChange);
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", (event) => {
        const categoryDropdown = document.querySelector('.dropdown');
        const categoryMenu = document.getElementById("categoryDropdownMenu");
        const stockDropdown = document.querySelectorAll('.dropdown')[1]; // Second dropdown
        const stockMenu = document.getElementById("stockDropdownMenu");
        
        if (!categoryDropdown.contains(event.target)) {
            categoryMenu.style.display = "none";
            document.getElementById("categoryDropdownToggle").querySelector('.arrow').textContent = '▼';
        }
        
        if (!stockDropdown.contains(event.target)) {
            stockMenu.style.display = "none";
            document.getElementById("stockDropdownToggle").querySelector('.arrow').textContent = '▼';
        }
    });
});