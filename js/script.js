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
        id: getTagValue("ITEM_ID", "N/A"),
        brand: getTagValue("BRAND"),
        name: getTagValue("NAME_COMMERCIAL", "Produkt"),
        price: getTagValue("PRICE_VAT", "0.00"),
        image: getTagValue("IMAGE"),
        url: getTagValue("URL", "#"),
        category: getTagValue("CATEGORY_NAME_LOCAL", "Ostatné"),
        variant: variant,
        stockQuantity: stockQuantity,
        isInStock: availability === "in stock",
        statusText: availability
    };
}


function populateCategories(products) {
    const select = document.getElementById("categorySelect");
    
    const categories = [...new Set(products.map(p => p.category))].sort();

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.innerText = cat;
        select.appendChild(option);
    });
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
                <td><small>${p.id}</small></td>
                <td class="price">${p.price} €</td>
                <td style="color: ${stockColor}; font-weight: bold;">${p.statusText}</td>
                <td class="price">${p.stockQuantity}</td>
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
    const categoryQuery = document.getElementById("categorySelect").value;

    AppState.searchTimeout = setTimeout(() => {
        AppState.filteredProducts = AppState.allProducts.filter(p => {
            const matchesSearch = removeAccents(p.name.toUpperCase()).includes(searchQuery) || 
                                  removeAccents(p.brand.toUpperCase()).includes(searchQuery) ||
                                  removeAccents(p.id.toUpperCase()).includes(searchQuery);

            const matchesCategory = categoryQuery === "" || p.category === categoryQuery;

            return matchesSearch && matchesCategory;
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
        AppState.filteredProducts = AppState.allProducts;
        renderTable(AppState.allProducts);

    } catch (error) {
        status.innerHTML = `<b style="color:red;">Chyba: ${error.message}</b>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    
    document.getElementById("searchInput").addEventListener("keyup", filterTable);
    document.getElementById("categorySelect").addEventListener("change", filterTable);
});