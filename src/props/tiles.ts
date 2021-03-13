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
    this.CoOrds = tile.CoOrds;
    this.Type = tile.Type;
    this.TerrainMod = tile.TerrainMod;
    this.Obstruction = tile.Obstruction;
    this.AllowConstruction = tile.AllowConstruction;
    this.Height = tile.Height;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNeighbors = (tile : Tile) : Tile[] => {
  const neighbors : Tile[] = [];
  const neighborOffset = tile.CoOrds.X % 2 ? Tile._NeighborOffsetOddX : Tile._NeighborOffsetEvenX;
  neighborOffset.forEach(pair => {
    const x = tile.CoOrds.X + pair[0];
    const y = tile.CoOrds.Y + pair[1];
    if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
      neighbors.push(GameMap[x][y]);
    }
  });
  return neighbors;
};

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
  private static readonly Tiles : Tile[][];
  private static readonly Players : Player[];

  constructor(height : number, width : number) {
    GameMap._height = height;
    GameMap._width = width;
  }
  static get Height() : number { return GameMap._height; }
  static get Width() : number { return GameMap._width; }

  static Load(): void {
    // TODO
  }
  static Save(): void {
    // TODO
  }
}

export {
  TileType,
  Tile,
  Cities,
  GameMap
};
