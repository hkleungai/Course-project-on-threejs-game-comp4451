import { Texture } from 'three';
import {
  textures,
  suburbs,
  cities,
  metropolises
} from '../resources';
import { Cities, Tile, TileType } from '../props';
import { PlayerColor } from '../player';

import { InvalidArgumentException, } from './';

const getTileTexture = (tile: Tile): Texture => {
  const type = TileType[tile.Type].toLowerCase();
  return textures[type];
};

const getCitiesTextures = (type: TileType): { [k: string]: Texture } => {
  switch (type) {
    case TileType.SUBURB:
      return suburbs;
    case TileType.CITY:
      return cities;
    case TileType.METROPOLIS:
      return metropolises;
    default:
      throw new InvalidArgumentException('tile.Type', type);
  }
};

const getCitiesTexturesWithColor = (city: Cities): Texture => {
  const type = TileType[city.Type].toLowerCase();
  const color = PlayerColor[city.Owner.Color].toLowerCase();
  return getCitiesTextures(city.Type)[`${type}_${color}`];
};

export {
  getTileTexture,
  getCitiesTextures,
  getCitiesTexturesWithColor,
};
