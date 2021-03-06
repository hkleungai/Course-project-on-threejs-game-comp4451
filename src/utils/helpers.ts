const randint = (upperBound: number): number => Math.floor(Math.random() * upperBound);
const range = (upperBound: number): number[] => [...Array(upperBound).keys()];

const sinDeg = (deg: number): number => Math.sin(deg / 180 * Math.PI);
const cosDeg = (deg: number): number => Math.cos(deg / 180 * Math.PI);

class KeyValuePair<T, U> {
  private _key : T;
  private _value : U;

  constructor(key : T, value : U) {
    this._key = key;
    this._value = value;
  }
  get Key() : T { return this._key; }
  get Value() : U { return this._value; }
}

class Dictionary<T, U> {
  private _entries : KeyValuePair<T, U>[] = [];

  constructor(...entries : KeyValuePair<T, U>[]) {
    this.AddAll(entries);
  }
  get Entries() : KeyValuePair<T, U>[] { return this._entries; }
  get Keys() : T[] {
    const keys: T[] = [];
    this._entries.forEach((e) => keys.push(e.Key));
    return keys;
  }
  get Values() : U[] {
    const values: U[] = [];
    this._entries.forEach((e) => values.push(e.Value));
    return values;
  }

  Get(key : T) : U {
    return this.ContainsKey(key)
      ? this._entries.find(e => e.Key === key).Value
      : null;
  }
  Add(entry : KeyValuePair<T, U>): void { this._entries.push(entry); }
  AddAll(entries : KeyValuePair<T, U>[]): void { entries.forEach((e) => this.Add(e)); }
  Remove(key : T): void {
    if (this.ContainsKey(key)) {
      this._entries.splice(this.IndexOf(key), 1);
    }
  }
  ContainsKey(key : T) : boolean {
    return this._entries.findIndex(e => e.Key === key) > 0;
  }
  IndexOf(key : T) : number {
    return this._entries.findIndex(e => e.Key === key);
  }
}

export { randint, range, sinDeg, cosDeg, KeyValuePair, Dictionary };
