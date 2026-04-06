import { AppState } from "./state.js";
import { renderTable } from "./ui.js";
import { removeAccents } from "./utils.js";

export function initializeSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable');

    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortField = header.dataset.sort;

            // If clicking the same field, cycle through: asc -> desc -> null (default)
            if (AppState.sortField === sortField) {
                if (AppState.sortDirection === 'asc') {
                    AppState.sortDirection = 'desc';
                } else if (AppState.sortDirection === 'desc') {
                    // Reset to default sorting
                    AppState.sortField = null;
                    AppState.sortDirection = 'asc';
                }
            } else {
                // New field, start with ascending
                AppState.sortField = sortField;
                AppState.sortDirection = 'asc';
            }

            // Reset to page 1 when sorting
            AppState.currentPage = 1;

            // Apply sorting and re-render
            applySorting();
            updateSortIndicators();
        });
    });
}

export function applySorting() {
    if (AppState.sortField) {
        AppState.sortedProducts = sortProducts(AppState.filteredProducts, AppState.sortField, AppState.sortDirection);
    } else {
        AppState.sortedProducts = [...AppState.filteredProducts];
    }
    
    renderTable(AppState.sortedProducts);
}

function updateSortIndicators() {
    // Clear all indicators
    document.querySelectorAll('.sort-indicator').forEach(indicator => {
        indicator.textContent = '';
        indicator.classList.remove('active');
    });

    if (AppState.sortField) {
        const header = document.querySelector(`[data-sort="${AppState.sortField}"]`);
        if (header) {
            const indicator = header.querySelector('.sort-indicator');
            indicator.textContent = AppState.sortDirection === 'asc' ? '↑' : '↓';
            indicator.classList.add('active');
        }
    }
}


function sortProducts(products, sortField, sortDirection) {
    if (!sortField) return [...products]; // Return copy if no sorting

    return [...products].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
            case 'name':
                aValue = removeAccents(a.name.toLowerCase());
                bValue = removeAccents(b.name.toLowerCase());
                break;
            case 'price':
                aValue = parseFloat(a.price) || 0;
                bValue = parseFloat(b.price) || 0;
                break;
            case 'quantity':
                aValue = a.stockQuantity;
                bValue = b.stockQuantity;
                break;
            default:
                return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}