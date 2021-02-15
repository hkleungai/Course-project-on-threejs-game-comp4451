"use strict";

const randint = upper_bound => Math.floor(Math.random() * upper_bound);
const range = upper_bound => [...Array(upper_bound).keys()];

export { randint, range };
