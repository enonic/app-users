export function forceArray<T>(data: T|T[]): T[] {
    if (data) {
        if (Array.isArray(data)) {
            return data;
        }
        return [data];
    }
    return [];
}
