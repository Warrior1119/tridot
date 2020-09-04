export function parseFloatSafe(obj) {
    return isNaN(obj) ? 0 : parseFloat(obj);
}