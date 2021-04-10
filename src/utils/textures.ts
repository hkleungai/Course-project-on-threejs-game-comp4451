import { Texture } from 'three';
import {
  textures,
  suburbs,
  cities,
  metropolises,
  barracks,
  militias,
  infantries,
  assaults,
  mountains,
  supports,
  engineers
} from '../resources';
import { Cities, Tile, TileType } from '../props';
import { PlayerColor } from '../player';

import { InvalidArgumentException, } from './';
import { Building } from '../props/buildings';
import { Unit } from '../props/units';

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

const getUnitEntries = (unit: Unit): { [k: string]: Texture } => {
  switch (unit.Name) {
    case "militia":
      return militias;
    case "infantry":
      return infantries;
    case "assault":
      return assaults;
    case "mountain":
      return mountains;
    case "support":
      return supports;
    case "engineer":
      return engineers;
    default:
      break;
  }
};

const getBuildingEntries = (building: Building): { [k: string]: Texture } => {
  switch (building.Name) {
    case "barracks":
      return barracks;
    default:
      console.log('oops');
      break;
  }
};

export {
  getTileTexture,
  getCitiesTextures,
  getCitiesTexturesWithColor,
  getBuildingEntries,
  getUnitEntries
};
