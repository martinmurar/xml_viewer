import {AppState, ITEMS_PER_PAGE} from "./state.js";

export function renderTable(products) {
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

export function renderPaginationControls(totalItems) {
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
