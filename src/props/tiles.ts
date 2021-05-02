import { Vector3 } from 'three';
import {
  Attribute,
  Point,
  Resources,
  TerrainModifiers
} from '../attr';
import { Prop } from './prop';
import { Player } from '../player';
import { Unit } from './units';
import {
  gameMap,
  mapCities,
  mapDataJson,
  playerDataJson
} from '../assets/json';
import { Building } from './buildings';
import { Command } from '../command';
import { range } from '../utils';

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
  MOUNTAINS = 11,
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

/* eslint-disable camelcase */
class WeightedCubeTile {
  public CubeCoords: number[];
  public BaseCost: number; // base cost for this tile: unit supplies/fule consumption
  public Weight: number; // tile mod
  public Cost: number; // cost for reaching this tile so far
  public DistanceToGoal: number; // remaining distance to goal
  public DistanceSoFar: number; // distance travelled so far
  public Parent: WeightedCubeTile;
  // a "just-right" estimate of total cost
  // IMPORTANT: sometimes wrong path is returned using underestimate, yet to find out why
  get CostDistance(): number { return this.Cost + this.DistanceToGoal * this.BaseCost * 2; }

  constructor(parent: WeightedCubeTile, cube: number[], base: number, mod: number, cost: number, d_goal: number, d_sofar: number) {
    this.Parent = parent;
    this.CubeCoords = cube;
    this.BaseCost = base;
    this.Weight = mod;
    this.Cost = cost;
    this.DistanceToGoal = d_goal;
    this.DistanceSoFar = d_sofar;
  }
}
/* eslint-enable camelcase */

const cubeTileEquals = (t1: WeightedCubeTile, t2: WeightedCubeTile): boolean => {
  return range(3).every(i => t1.CubeCoords[i] === t2.CubeCoords[i]);
};

class GameMap {
  private static _height : number;
  private static _width : number;
  private _tiles : Tile[][] = [];
  private _cities : Cities[] = [];
  private _players : Player[] = [];
  private _units : Unit[] = [];
  private _buildings : Building[] = [];
  private _commands : Command[] = [];
  private _roundnum = 1;
  private static _hexScreenSize: Vector3;

  static get Height() : number { return GameMap._height; }
  static get Width() : number { return GameMap._width; }
  get Tiles() : Tile[][] { return this._tiles; }
  set Tiles(tiles: Tile[][]) { this._tiles = tiles; }
  get Cities() : Cities[] { return this._cities; }
  set Cities(cities: Cities[]) { this._cities = cities; }
  get Players() : Player[] { return this._players; }
  get Units() : Unit[] { return this._units; }
  set Units(units: Unit[]) { this._units = units; }
  get Buildings() : Building[] { return this._buildings; }
  set Buildings(buildings: Building[]) { this._buildings = buildings; }
  get Commands() : Command[] { return this._commands; }
  set Commands(commands: Command[]) { this._commands = commands; }
  get RoundNum() : number { return this._roundnum; }
  set RoundNum(round: number) { this._roundnum = round; }
  static get HexScreenSize() : Vector3 { return GameMap._hexScreenSize; }
  static set HexScreenSize(hexScreenSize: Vector3) { GameMap._hexScreenSize = hexScreenSize; }

  public Load(): void {
    GameMap._width = mapDataJson.Width;
    GameMap._height = mapDataJson.Height;
    this._players = playerDataJson;
    this._tiles = JSON.parse(JSON.stringify(gameMap));
    this._cities = mapCities;
    this._cities[0].Owner = this._players[0];
    this._cities[1].Owner = this._players[1];
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
  WeightedCubeTile,
  cubeTileEquals,
  Cities,
  GameMap
};
