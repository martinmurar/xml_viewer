export async function processXML(xmlText) {
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

        const { AppState } = await import("./state.js");
        const { mapItemToProduct } = await import("./mapper.js");
        const { populateCategories, updateCategoryButtonText } = await import("./category.js");
        const { handleStockChange } = await import("./stock.js");
        const { applySorting } = await import("./sort.js");

        AppState.allProducts = items.map(item => mapItemToProduct(item));
        AppState.sortField = null;
        AppState.sortDirection = 'asc';
        AppState.currentPage = 1;
        
        populateCategories(AppState.allProducts);
        
        // Initialize all category checkboxes as checked
        const categoryCheckboxes = document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:not(#allCategoriesCheckbox)');
        const allCategoriesCheckbox = document.getElementById("allCategoriesCheckbox");
        const allStockRadio = document.getElementById("allStockRadio");

        categoryCheckboxes.forEach(cb => cb.checked = true);
        if (allCategoriesCheckbox) {
            allCategoriesCheckbox.checked = true;
            allCategoriesCheckbox.indeterminate = false;
        }

        updateCategoryButtonText();
        
        // Initialize stock status
        if (allStockRadio) {
            allStockRadio.checked = true;
        }
        handleStockChange();
        
        AppState.filteredProducts = AppState.allProducts;
        applySorting();
        
        // Show main content and hide drop zone
        document.getElementById("mainContent").style.display = '';
        document.getElementById("drop-zone").style.display = 'none';
        status.textContent = '';
        status.style.color = '';

    } catch (error) {
        status.textContent = `Chyba: ${error.message}`;
        status.style.color = 'red';
    }
}