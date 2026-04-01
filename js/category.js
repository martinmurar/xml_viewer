import { filterTable } from "./filter.js";

export function populateCategories(products) {
    const menu = document.getElementById("categoryDropdownMenu");
    
    // Clear existing items except "All Categories"
    const allCategoriesItem = menu.querySelector('#allCategoriesCheckbox').parentElement;
    menu.innerHTML = '';
    menu.appendChild(allCategoriesItem);
    
    const categories = [...new Set(products.map(p => p.category))].sort();

    categories.forEach(cat => {
        const label = document.createElement("label");
        label.className = "dropdown-item";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = cat;
        checkbox.addEventListener("change", handleCategoryChange);
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + cat));
        menu.appendChild(label);
    });
}

export function updateCategoryButtonText() {
    const toggle = document.getElementById("categoryDropdownToggle");
    const checkboxes = document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:not(#allCategoriesCheckbox)');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
    
    if (document.getElementById("allCategoriesCheckbox").checked || checkedBoxes.length === 0) {
        toggle.innerHTML = 'All Categories <span class="arrow">▼</span>';
    } else if (checkedBoxes.length === 1) {
        toggle.innerHTML = checkedBoxes[0].value + ' <span class="arrow">▼</span>';
    } else {
        toggle.innerHTML = `${checkedBoxes.length} selected <span class="arrow">▼</span>`;
    }
}

export function toggleCategoryDropdown() {
    const menu = document.getElementById("categoryDropdownMenu");
    const toggle = document.getElementById("categoryDropdownToggle");
    
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        toggle.querySelector('.arrow').textContent = '▲';
    } else {
        menu.style.display = "none";
        toggle.querySelector('.arrow').textContent = '▼';
    }
}

export function handleCategoryChange(event) {
    const allCheckbox = document.getElementById("allCategoriesCheckbox");
    const checkboxes = document.querySelectorAll('#categoryDropdownMenu input[type="checkbox"]:not(#allCategoriesCheckbox)');
    
    if (event.target === allCheckbox) {
        // Master checkbox clicked - check/uncheck all items
        const isChecked = allCheckbox.checked;
        checkboxes.forEach(cb => cb.checked = isChecked);
        allCheckbox.indeterminate = false;
    } else {
        // Individual item checkbox clicked - update master checkbox state
        const totalItems = checkboxes.length;
        const checkedItems = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (checkedItems === 0) {
            // No items checked
            allCheckbox.checked = false;
            allCheckbox.indeterminate = false;
        } else if (checkedItems === totalItems) {
            // All items checked
            allCheckbox.checked = true;
            allCheckbox.indeterminate = false;
        } else {
            // Some items checked - show indeterminate state
            allCheckbox.checked = false;
            allCheckbox.indeterminate = true;
        }
    }
    
    updateCategoryButtonText();
    filterTable();
}