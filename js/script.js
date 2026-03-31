import {parseVariant, removeAccents} from "./utils.js";

const XML_FILE = "assets/data/xml_sk.xml";
const ITEMS_PER_PAGE = 100;

const AppState = {
    allProducts: [],
    filteredProducts: [],
    searchTimeout: null,
    currentPage: 1
};

function mapItemToProduct(item) {
    const getTagValue = (tagName, fallback = "") => 
        item.getElementsByTagName(tagName)[0]?.textContent || fallback;

    const availability = getTagValue("AVAILABILITY", "unknown").toLowerCase();

    const stockQtyStr = getTagValue("STOCK_QUANTITY", "0");
    const stockQuantity = parseInt(stockQtyStr, 10) || 0;

    const variantStr = getTagValue("PRODUCTNO", "");
    const variant = parseVariant(variantStr);

    return {
        brand: getTagValue("BRAND"),
        name: getTagValue("NAME_COMMERCIAL", "Produkt"),
        price: getTagValue("PRICE_VAT", "0.00"),
        image: getTagValue("IMAGE"),
        url: getTagValue("URL", "#"),
        category: getTagValue("CATEGORY_NAME_LOCAL", "Ostatné"),
        ean: getTagValue("EAN"),
        variant: variant,
        stockQuantity: stockQuantity,
        isInStock: availability === "in stock",
        statusText: availability
    };
}


function populateCategories(products) {
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

function toggleCategoryDropdown() {
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

function handleCategoryChange(event) {
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

function toggleStockDropdown() {
    const menu = document.getElementById("stockDropdownMenu");
    const toggle = document.getElementById("stockDropdownToggle");
    
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
        toggle.querySelector('.arrow').textContent = '▲';
    } else {
        menu.style.display = "none";
        toggle.querySelector('.arrow').textContent = '▼';
    }
}

function handleStockChange() {
    const selectedRadio = document.querySelector('input[name="stockStatus"]:checked');
    const toggle = document.getElementById("stockDropdownToggle");
    
    if (selectedRadio) {
        const label = selectedRadio.parentElement.textContent.trim();
        toggle.innerHTML = label + ' <span class="arrow">▼</span>';
    }
    
    filterTable();
}

function updateCategoryButtonText() {
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

function renderPaginationControls(totalItems) {
    const controls = document.getElementById("paginationControls");
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    controls.innerHTML = "";

    if (totalPages <= 1) return;

    // Back
    const prevBtn = document.createElement("button");
    prevBtn.innerText = "Previous";
    prevBtn.disabled = AppState.currentPage === 1;
    prevBtn.onclick = () => { AppState.currentPage--; renderTable(AppState.filteredProducts); window.scrollTo(0,0); };
    controls.appendChild(prevBtn);

    // current
    const pageInfo = document.createElement("span");
    pageInfo.innerText = ` Page ${AppState.currentPage} of ${totalPages} `;
    pageInfo.style.alignSelf = "center";
    controls.appendChild(pageInfo);

    // forward
    const nextBtn = document.createElement("button");
    nextBtn.innerText = "Next";
    nextBtn.disabled = AppState.currentPage === totalPages;
    nextBtn.onclick = () => { AppState.currentPage++; renderTable(AppState.filteredProducts); window.scrollTo(0,0); };
    controls.appendChild(nextBtn);
}


function renderTable(products) {
    const tbody = document.querySelector("#productTable tbody");
    const status = document.getElementById("loadingStatus");
    
    const startIndex = (AppState.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = products.slice(startIndex, endIndex);

    const rowsHtml = pageItems.map(p => {
        const stockColor = p.isInStock ? "green" : "orange";
        return `
            <tr>
                <td><img src="${p.image}" class="img-thumb" loading="lazy"></td>
                <td class="product-name">
                    <small style="color: #888;">${p.brand} | ${p.category}</small><br>
                    <a href="${p.url}" target="_blank" style="text-decoration:none; color:black;"><strong>${p.name + " " + p.variant}</strong></a>
                </td>
                <td>${p.ean}</td>
                <td class="price">${p.price} €</td>
                <td style="color: ${stockColor}; font-weight: bold;">${p.statusText}</td>
                <td>${p.stockQuantity}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rowsHtml;
    status.innerText = `${products.length} products found. Displaying ${pageItems.length} items.`;
    renderPaginationControls(products.length);
}


async function filterTable() {
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
        renderTable(AppState.filteredProducts);
    }, 250);
}


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