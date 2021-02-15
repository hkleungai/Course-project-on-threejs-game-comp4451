"use strict";

const randint = upper_bound => Math.floor(Math.random() * upper_bound);
const range = upper_bound => [...Array(upper_bound).keys()];

const sin_deg = deg => Math.sin(deg / 180 * Math.PI);
const cos_deg = deg => Math.cos(deg / 180 * Math.PI);

export { randint, range, sin_deg, cos_deg };
