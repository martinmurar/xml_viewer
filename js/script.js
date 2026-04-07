import {AppState, XML_FILE} from "./state.js";
import {mapItemToProduct} from "./mapper.js";
import {filterTable} from "./filter.js";
import {populateCategories, updateCategoryButtonText, toggleCategoryDropdown, handleCategoryChange} from "./category.js";
import {toggleStockDropdown, handleStockChange} from "./stock.js";
import {initializeSorting, applySorting} from "./sort.js";
import {processXML} from "./xmlProcessor.js";
import {initializeDragDrop} from "./dragdrop.js";


const LOAD_LOCAL_XML = true; // Set to false to enable drag-and-drop loading


function loadLocalXML() {
        fetch(XML_FILE)
        .then(response => response.text())
        .then(xmlText => processXML(xmlText))
        .catch(error => {
            const status = document.getElementById("loadingStatus");
            status.textContent = `Loading error: ${error.message}`;
            status.style.color = 'red';
        });
}


document.addEventListener("DOMContentLoaded", () => {
    if (LOAD_LOCAL_XML) {
        // Hide drop zone completely when loading local XML
        document.getElementById("drop-zone").style.display = 'none';
        loadLocalXML();
    } else {
        initializeDragDrop();
    }
    
    document.getElementById("searchInput").addEventListener("keyup", filterTable);
    document.getElementById("categoryDropdownToggle").addEventListener("click", toggleCategoryDropdown);
    document.getElementById("allCategoriesCheckbox").addEventListener("change", handleCategoryChange);
    document.getElementById("stockDropdownToggle").addEventListener("click", toggleStockDropdown);
    
    // Add event listeners for stock radio buttons
    document.querySelectorAll('input[name="stockStatus"]').forEach(radio => {
        radio.addEventListener("change", handleStockChange);
    });

    // Initialize sorting
    initializeSorting();
    
    // Reset sorting button if it exists
    const resetBtn = document.getElementById("resetSortBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            AppState.sortField = null;
            AppState.sortDirection = 'asc';
            AppState.currentPage = 1;
            applySorting();
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener("click", (event) => {
        const categoryToggle = document.getElementById("categoryDropdownToggle");
        const categoryDropdown = categoryToggle?.closest('.dropdown');
        const categoryMenu = document.getElementById("categoryDropdownMenu");

        const stockToggle = document.getElementById("stockDropdownToggle");
        const stockDropdown = stockToggle?.closest('.dropdown');
        const stockMenu = document.getElementById("stockDropdownMenu");
        
        if (categoryDropdown && !categoryDropdown.contains(event.target)) {
            categoryMenu.style.display = "none";
            categoryToggle.querySelector('.arrow').textContent = '▼';
        }
        
        if (stockDropdown && !stockDropdown.contains(event.target)) {
            stockMenu.style.display = "none";
            stockToggle.querySelector('.arrow').textContent = '▼';
        }
    });
});