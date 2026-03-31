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