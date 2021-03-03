const randint = (upperBound: number): number => Math.floor(Math.random() * upperBound);
const range = (upperBound: number): number[] => [...Array(upperBound).keys()];

const sinDeg = (deg: number): number => Math.sin(deg / 180 * Math.PI);
const cosDeg = (deg: number): number => Math.cos(deg / 180 * Math.PI);

export { randint, range, sinDeg, cosDeg };
