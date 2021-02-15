"use strict";

const textures_promise = async () => {
  const {
    THREE_BUILD
  } = await import('../utils/constants.js');
  const {
    TextureLoader
  } = await import(THREE_BUILD);

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

  const textures = Object.fromEntries(texture_entries);

  return textures;
};

export { textures_promise };
