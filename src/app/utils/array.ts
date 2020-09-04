export function splitBy<T = any>(
    input: T[],
    keySelector: (item: T) => string
) {
    let result = [] as T[][];
    const values = input
        .map(item => keySelector(item))
        .filter((value, index, self) => self.indexOf(value) === index);
    values.forEach(value => {
        const smallerArray = input.filter(
            item => keySelector(item) == value
        );
        result.push(smallerArray);
    });
    return result;
}

export function chunks<T = any>(array: T[], size: number) {
    const result = [] as T[][];
    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    return result;
}

export function array2map<T = any, TValue = any>(
    array: T[],
    keySelector: (item: T) => string,
    valueSelector?: (item: T) => TValue
): {[key: string]: any} {
    return array.reduce((result, item) => {
        result[keySelector(item)] = valueSelector ? valueSelector(item) : item;
        return result;
    }, {} as any);
}
