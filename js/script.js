import {AppState} from "./state.js";
import {mapItemToProduct} from "./mapper.js";
import {renderTable} from "./ui.js";
import {filterTable} from "./filter.js";
import {populateCategories, updateCategoryButtonText, toggleCategoryDropdown, handleCategoryChange} from "./category.js";
import {toggleStockDropdown, handleStockChange} from "./stock.js";
import {initializeSorting, applySorting} from "./sort.js";



async function processXML(xmlText) {
    const status = document.getElementById("loadingStatus");
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Check for XML parsing errors
        if (xmlDoc.getElementsByTagName('parsererror').length) {
            throw new Error("Invalid XML format");
        }
        
        const items = Array.from(xmlDoc.getElementsByTagName("ITEM"));
        if (items.length === 0) {
            throw new Error("No products found in XML");
        }

        AppState.allProducts = items.map(item => mapItemToProduct(item));
        AppState.sortField = null;
        AppState.sortDirection = 'asc';
        AppState.currentPage = 1;
        
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
        applySorting();
        
        // Show main content and hide drop zone
        document.getElementById("mainContent").style.display = '';
        document.getElementById("drop-zone").style.display = 'none';
        status.innerHTML = '';

    } catch (error) {
        status.innerHTML = `<b style="color:red;">Chyba: ${error.message}</b>`;
    }
}


function initializeDragDrop() {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const mainContent = document.getElementById("mainContent");

    if (!dropZone || !fileInput) return;

    // Prevent default drag and drop behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.backgroundColor = '#f0f0f0';
            dropZone.style.borderColor = '#000';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.style.backgroundColor = '';
            dropZone.style.borderColor = '';
        });
    });

    // Handle dropped files
    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Make drop zone clickable
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
}

function handleFileUpload(file) {
    const status = document.getElementById("loadingStatus");
    
    if (!file.name.toLowerCase().endsWith('.xml')) {
        status.innerHTML = '<b style="color:red;">Please select an XML file</b>';
        return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
        const xmlText = e.target.result;
        await processXML(xmlText);
    };

    reader.onerror = () => {
        status.innerHTML = '<b style="color:red;">Error reading file</b>';
    };

    reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
    initializeDragDrop();
    
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