import { parseVariant } from "./utils.js";

export function mapItemToProduct(item) {
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