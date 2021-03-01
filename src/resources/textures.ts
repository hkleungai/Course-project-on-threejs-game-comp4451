import { Texture, TextureLoader } from 'three';

const texture_loader = new TextureLoader();

const texture_entries = [
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
].map(texture_key => ([
  texture_key,
  texture_loader.load(`../assets/tiles/${texture_key}.png`),
]));

const textures: {
  [key: string]: Texture
} = Object.fromEntries(texture_entries);

export { textures };
