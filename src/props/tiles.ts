import {
  Attribute,
  Modifier, // eslint-disable-line @typescript-eslint/no-unused-vars
  ModifierType, // eslint-disable-line @typescript-eslint/no-unused-vars
  Point,
  Resources,
  TerrainModifiers
} from '../attr';
import { Prop } from './prop';
import { Player } from '../player';
import { Unit } from './units';
import {
  gameMap,
  mapDataJson
} from '../assets/json';
import { isInteger } from 'mathjs';
import { InvalidArgumentException, rangeFrom, rangeFromTo } from '../utils';
import { Building } from './buildings';

enum TileType {
  BOUNDARY = 0,
  PLAINS = 1,
  GRASSLAND = 2,
  FOREST = 3,
  JUNGLE = 4,
  STREAM = 5,
  RIVER = 6,
  SWAMP = 7,
  DESERT = 8,
  HILLOCK = 9,
  HILLS = 10,
  MOUNTAIN = 11,
  ROCKS = 12,
  SUBURB = 13,
  CITY = 14,
  METROPOLIS = 15
}

class Tile extends Prop {
  public Name : string;
  public CoOrds : Point;
  public Type : TileType;
  public TerrainMod : TerrainModifiers;
  public Obstruction : number;
  public AllowConstruction : boolean;
  public Height : number;
  public static readonly _NeighborOffsetOddX : [number, number][] = [[0, 1], [1, 1], [1, 0], [0, -1], [-1, 0], [-1, 1]];
  public static readonly _NeighborOffsetEvenX : [number, number][] = [[0, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];

  constructor(tile?: Partial<Tile>) {
    super();
    this.Name = tile.Name;
    this.CoOrds = tile.CoOrds;
    this.Type = tile.Type;
    this.TerrainMod = tile.TerrainMod;
    this.Obstruction = tile.Obstruction;
    this.AllowConstruction = tile.AllowConstruction;
    this.Height = tile.Height;
  }
}
class Cities extends Tile {
  public Owner : Player;
  public Population : number;
  public ConstructionRange : Attribute;
  public Production : Resources;
  public Durability : Attribute;
  public Morale : Attribute;

  constructor(city?: Partial<Cities>) {
    super(city);
    this.Owner = city.Owner;
    this.Population = city.Population;
    this.ConstructionRange = city.ConstructionRange;
    this.Production = city.Production;
    this.Durability = city.Durability;
    this.Morale = city.Morale;
  }
}

class GameMap {
  private static _height : number;
  private static _width : number;
  private _tiles : Tile[][] = [];
  private _players : Player[] = [];
  private _units : Unit[] = [];
  private _buildings : Building[] = [];

  static get Height() : number { return GameMap._height; }
  static get Width() : number { return GameMap._width; }
  get Tiles() : Tile[][] { return this._tiles; }
  get Players() : Player[] { return this._players; }
  get Units() : Unit[] { return this._units; }
  get Buildings() : Building[] { return this._buildings; }

  public Load(): void {
    GameMap._width = mapDataJson.Width;
    GameMap._height = mapDataJson.Height;
    this._players = mapDataJson.Players;
    this._tiles = JSON.parse(JSON.stringify(gameMap));
  }

  public addUnit(unit: Unit): void {
    this._units.push(unit);
  }

  public addBuilding(building: Building): void {
    this._buildings.push(building);
  }
}

export {
  TileType,
  Tile,
  Cities,
  GameMap
};
