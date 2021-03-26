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
  'rocks',
  'suburb_blue',
  'suburb_green',
  'suburb_red',
  'suburb_yellow',
  'city_blue',
  'city_green',
  'city_red',
  'city_yellow',
  'metropolis_blue',
  'metropolis_green',
  'metropolis_red',
  'metropolis_yellow',
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));
const textures = Object.fromEntries(textureEntries);
textureEntries.forEach(([, textureMap]) => { textureMap.flipY = false; });

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
  infantries,
  militias,
};
