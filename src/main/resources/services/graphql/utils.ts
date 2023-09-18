export function toArray(object) {
    if (!object) {
        return [];
    }
    if (object.constructor === Array) {
        return object;
    }
    return [object];
}

export function toInt(number, defaultValue) {
    return number == null ? defaultValue.intValue() : number.intValue();
}
