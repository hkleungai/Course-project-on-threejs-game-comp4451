import {
    Point,
    TerrainModifiers
} from '../attr';
import { Player } from '../player';

enum TileType {
    BORDER = 0,
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

class Tile {
    private _coords : Point;
    private _type : TileType;
    private _terrain_mod : TerrainModifiers;
    private _obstruction : number;
    private _can_construct_buildings : boolean;
    private _height : number;
    private neighbor_offset_odd_x : [number, number][] = [[0, 1], [1, 1], [1, 0], [0, -1], [-1, 0], [-1, 1]];
    private neighbor_offset_even_x : [number, number][] = [[0, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];

    constructor(
        coords : Point, 
        type : TileType, 
        terrain_mod : TerrainModifiers,
        obstruct : number, 
        can_construct : boolean, 
        height : number
        ) {
        this._coords = coords;
        this._type = type;
        this._terrain_mod = terrain_mod;
        this._obstruction = obstruct;
        this._can_construct_buildings = can_construct;
        this._height = height;
    }

    //#region get/setter
    get Coords() : Point { return this._coords; }
    set Coords(value : Point) { this._coords = value; }
    get Type() : TileType { return this._type; }
    set Type(value : TileType) { this._type = value; }
    get Terrainmod() : TerrainModifiers { return this._terrain_mod; }
    set Terrainmod(value : TerrainModifiers) { this._terrain_mod = value; }
    get Obstruction() : number { return this._obstruction; }
    set Obstruction(value : number) { this._obstruction = value; }
    get Canconstructbuildings() : boolean { return this._can_construct_buildings; }
    set Canconstructbuildings(value : boolean) { this._can_construct_buildings = value; }
    get Height() : number { return this._height; }
    set Height(value : number) { this._height = value; }
    //#endregion

    GetNeighbors() : Array<Tile> {
        let neighbors : Array<Tile>;
        if (this.Coords.X % 2 == 1) {
            this.neighbor_offset_odd_x.forEach(pair => {
                let x : number = this.Coords.X + pair[0];
                let y : number = this.Coords.Y + pair[1];
                if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
                    neighbors.push(GameMap[x][y]);
                }
            });
        } else {
            this.neighbor_offset_even_x.forEach(pair => {
                let x : number = this.Coords.X + pair[0];
                let y : number = this.Coords.Y + pair[1];
                if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
                    neighbors.push(GameMap[x][y]);
                }
            });
        }
        return neighbors;
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

    static Load() {
        
    }
    static Save() {
        
    }
}

export {
    TileType,
    Tile,
    GameMap
}