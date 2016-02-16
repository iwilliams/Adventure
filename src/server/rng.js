// Copied from MDN
export function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function d4() {
    return randomRange(1, 5);
}

export function d6() {
    return randomRange(1, 8);
}

export function d10() {
    return randomRange(1, 11);
}

export function d20() {
    return randomRange(1, 21);
}

export function getRandomElement(collection, exclude = []) {
    let values = collection;
    if(exclude) {
        values = values.filter(elem => {
            return exclude.indexOf(elem) === -1
        });
    }
    return values[randomRange(0, values.length)];
}
