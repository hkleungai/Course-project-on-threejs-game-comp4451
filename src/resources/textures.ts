import {
  MeshBasicMaterial,
  Texture,
  TextureLoader
} from 'three';

const textureLoader = new TextureLoader();

const textureEntries: [string, Texture][] = [
  'boundary',
  'plains',
  'grassland',
  'forest',
  'jungle',
  'stream',
  'river',
  'swamp',
  'desert',
  'hillock',
  'hills',
  'mountains',
  'rocks'
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));
const textures = Object.fromEntries(textureEntries);
textureEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
// TODO refactor entries with color to color only, load ${type}_${color}
const suburbEntries: [string, Texture][] = [
  'suburb_blue',
  'suburb_green',
  'suburb_red',
  'suburb_yellow'
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));
const suburbs = Object.fromEntries(suburbEntries);
suburbEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });

const cityEntries: [string, Texture][] = [
  'city_blue',
  'city_green',
  'city_red',
  'city_yellow'
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));
const cities = Object.fromEntries(cityEntries);
cityEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });

const metropolisEntries: [string, Texture][] = [
  'metropolis_blue',
  'metropolis_green',
  'metropolis_red',
  'metropolis_yellow'
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));
const metropolises = Object.fromEntries(metropolisEntries);
metropolisEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });

const meshEntries: [string, MeshBasicMaterial][] = [
  'available',
  'blank',
  'plains',
  'select',
].map(name => ([
  name,
  new MeshBasicMaterial({
    name,
    map: textureLoader.load(`../assets/tiles/${name}.png`),
    transparent: true
  })
]));
const meshes = Object.fromEntries(meshEntries);

const engineerEntries: [string, Texture][] = [
  'engineer_red',
  'engineer_blue',
  'engineer_yellow',
  'engineer_green'
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
engineerEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const engineers = Object.fromEntries(engineerEntries);

const mountainEntries: [string, Texture][] = [
  'mountain_red',
  'mountain_blue',
  'mountain_yellow',
  'mountain_green'
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
mountainEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const mountains = Object.fromEntries(mountainEntries);

const supportEntries: [string, Texture][] = [
  'support_red',
  'support_blue',
  'support_yellow',
  'support_green'
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
supportEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const supports = Object.fromEntries(supportEntries);

const assaultEntries: [string, Texture][] = [
  'assault_red',
  'assault_blue',
  'assault_yellow',
  'assault_green',
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
assaultEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const assaults = Object.fromEntries(assaultEntries);

const infantryEntries: [string, Texture][] = [
  'infantry_red',
  'infantry_blue',
  'infantry_yellow',
  'infantry_green',
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
infantryEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const infantries = Object.fromEntries(infantryEntries);

const militiaEntries: [string, Texture][] = [
  'militia_red',
  'militia_blue',
  'militia_yellow',
  'militia_green',
].map(unitKey => ([
  unitKey,
  textureLoader.load(`../assets/units/${unitKey}.png`),
]));
militiaEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });
const militias = Object.fromEntries(militiaEntries);

export {
  meshes,
  textures,
  suburbs,
  cities,
  metropolises,
  engineers,
  mountains,
  supports,
  assaults,
  infantries,
  militias,
};
