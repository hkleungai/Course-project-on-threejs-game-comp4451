import {
  Tile,
  TileType, // eslint-disable-line @typescript-eslint/no-unused-vars
} from './tiles';
import {
  TerrainModifiers, // eslint-disable-line @typescript-eslint/no-unused-vars
  ModifierType, // eslint-disable-line @typescript-eslint/no-unused-vars
  Modifier, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../attr';
import {
  KeyValuePair, // eslint-disable-line @typescript-eslint/no-unused-vars
  Dictionary, // eslint-disable-line @typescript-eslint/no-unused-vars
} from '../utils/helpers';
import { tileDataJson } from "../assets/json";

class TileData {
  public Data : Tile[] = [];

  Load(): void {
    this.Data = tileDataJson.Data;
  }
}

export {
  //TERRAIN_MODS,
  TileData
};
