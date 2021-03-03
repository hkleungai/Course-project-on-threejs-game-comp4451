import { Texture, TextureLoader } from 'three';

const textureLoader = new TextureLoader();

const textureEntries = [
  'boundary',
  'city_blue',
  'city_green',
  'city_red',
  'city_yellow',
  'desert',
  'forest',
  'grassland',
  'hills',
  'jungle',
  'metropolis_blue',
  'metropolis_green',
  'metropolis_red',
  'metropolis_yellow',
  'mountains',
  'plains',
  'ridge',
  'river',
  'rocks',
  'stream',
  'suburb_blue',
  'suburb_green',
  'suburb_red',
  'suburb_yellow',
  'swamp',
].map(textureKey => ([
  textureKey,
  textureLoader.load(`../assets/tiles/${textureKey}.png`),
]));

const textures : {
  [key: string]: Texture
} = Object.fromEntries(textureEntries);

export { textures };
