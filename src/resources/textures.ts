import {
  MeshBasicMaterial,
  Texture,
  TextureLoader
} from 'three';

const textureLoader = new TextureLoader();

const textureEntries = [
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

const textures: { [key: string]: Texture } = Object.fromEntries(textureEntries);

const MeshEntries = [
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

const meshes: { [key: string]: MeshBasicMaterial } = Object.fromEntries(MeshEntries);

export {
  meshes,
  textures,
};
