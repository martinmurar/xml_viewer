export function parseVariant(string) {
    if (string == "") {
        return "";
    }

    const parts = string.split("-");
    let parsed = parts.slice(2).join(" ");
    if (parsed == "") {
        return "";
    }
    return parsed;
}


export function removeAccents(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


export function productParamsToString(p) {
    const params = [];
    if (p.flavor) params.push(p.flavor);
    if (p.size) params.push(p.size);
    if (p.color) params.push(p.color);
    if (p.tablets) params.push(p.tablets);
    if (p.capsules) params.push(p.capsules);
    if (p.mass_grams_g) params.push(p.mass_grams_g);
    return params.join(" | ");
}
