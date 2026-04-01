import { filterTable } from "./filter.js";

export function toggleStockDropdown() {
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

export function handleStockChange() {
    const selectedRadio = document.querySelector('input[name="stockStatus"]:checked');
    const toggle = document.getElementById("stockDropdownToggle");
    
    if (selectedRadio) {
        const label = selectedRadio.parentElement.textContent.trim();
        toggle.innerHTML = label + ' <span class="arrow">▼</span>';
    }
    
    filterTable();
}