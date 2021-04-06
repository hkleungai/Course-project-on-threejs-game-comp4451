import { isInteger } from "mathjs";
import { Mesh, Scene } from "three";
import { applyMod, applyModAttr, Point, pointEquals } from "../attr"
import { gameMap } from "../main";
import { Player, playerEquals } from "../player";
import { Cities, GameMap, Tile } from "../props"
import { Building, BuildingType, DefensiveBuilding, Infrastructure, ResourcesBuilding, TransmissionBuilding, UnitBuilding } from "../props/buildings";
import {
    Unit,
    UnitStatus
} from "../props/units"
import { InvalidArgumentException, rangeFrom, rangeFromTo } from "../utils";

const getNeighbors = (map: GameMap, tile: Tile) : Tile[] => {
    const neighbors : Tile[] = [];
    const neighborOffset = tile.CoOrds.X % 2 ? Tile._NeighborOffsetOddX : Tile._NeighborOffsetEvenX;
  
    neighborOffset.forEach(pair => {
      const x = tile.CoOrds.X + pair[0];
      const y = tile.CoOrds.Y + pair[1];
      if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
        neighbors.push(map.Tiles[x][y]);
      }
    });
    return neighbors;
  };
  
const getNeighborsAtRange = (tile: Tile, range: number, exclude_inaccessible: boolean = true) : Tile[] => {
    if (!isInteger(range)) {
        throw new InvalidArgumentException('range', range);
    }

    const neighbors : Tile[] = [];
    const n_FullXRange: number[] = rangeFromTo(Math.floor(tile.CoOrds.Y - range / 2), Math.floor(tile.CoOrds.Y + range / 2)).filter(y => y >= 0 || y < GameMap.Height);
    const n_LeftMostX: number = tile.CoOrds.X - range < 0 ? 0 : tile.CoOrds.X - range;
    const n_YLowerRange: number[] = range === 1 
        ? [tile.CoOrds.Y - range] 
        : rangeFromTo(tile.CoOrds.Y - range, Math.floor(tile.CoOrds.Y - range / 2) - 1).filter(y => y >= 0 || y < GameMap.Height).reverse();
    const n_YUpperRange: number[] = rangeFromTo(Math.floor(tile.CoOrds.Y + range / 2) + 1, tile.CoOrds.Y + range).filter(y => y >= 0 || y < GameMap.Height);

    n_FullXRange.forEach(y =>
        rangeFrom(n_LeftMostX, 2 * range + 1).forEach(x => {
        if (x < GameMap.Width) {
            neighbors.push(gameMap.Tiles[x][y + (range === 1 && tile.CoOrds.X % 2)]);
        }
        })
    );

    let dummy = (tile.CoOrds.X % 2 && range % 2) || !(tile.CoOrds.X % 2 || range % 2);
    n_YLowerRange.forEach((y, i) => 
        rangeFromTo(tile.CoOrds.X - (range - 2 * (i + 1) + +dummy), tile.CoOrds.X + range - 2 * (i + 1) + +dummy)
        .filter(x => x >= 0 || x < GameMap.Width)
        .forEach(x =>
            neighbors.push(gameMap.Tiles[x][y])
        )
    );
    n_YUpperRange.forEach((y, i) => {
        let det = range - 2 * (i + 1) + +(!dummy);
        let arr: number[] = det < 0 
        ? [tile.CoOrds.X]
        : rangeFromTo(tile.CoOrds.X - det, tile.CoOrds.X + det);   
        arr.filter(x => x >= 0 || x < GameMap.Width).forEach(x =>
        neighbors.push(gameMap.Tiles[x][y])
        );
        });  
    let raw: Tile[] = neighbors.filter(n => n !== undefined);
    return [...new Set(exclude_inaccessible ? raw.filter(t => t.Height < 4) : raw)];
};

const getTile = (coords: Point): Tile => {
    return gameMap[coords.X][coords.Y];
}

const getUnitAt = (coords: Point): Unit => {
    return gameMap.Units.find(u => pointEquals(u.Coords, coords));
}

const getBuildingAt = (coords: Point): Building => {
    return gameMap.Buildings.find(b => pointEquals(b.CoOrds, coords));
}

const getBuildingsOfSameType = (type: BuildingType): Building[] => {
    switch (type) {
        case 'unit':
            return gameMap.Buildings.filter(b => b instanceof UnitBuilding);
        case 'resources':
            return gameMap.Buildings.filter(b => b instanceof ResourcesBuilding);
        case 'infra':
            return gameMap.Buildings.filter(b => b instanceof Infrastructure);
        case 'transmit':
            return gameMap.Buildings.filter(b => b instanceof TransmissionBuilding);
        case 'defensive':
            return gameMap.Buildings.filter(b => b instanceof DefensiveBuilding);
    }
}

const filterFriendlyBuildings = (buildings: Building[], self: Player) => {
    return buildings.filter(b => playerEquals(b.Owner, self));
}

const isOccupied = (coords: Point): boolean => {
    return getUnitAt(coords) !== undefined || 
        (getBuildingAt(coords) !== undefined && 
        !(getBuildingAt(coords) instanceof UnitBuilding));
}

const tileExistsInArray = (arr: Tile[], t: Tile): boolean => {
    return arr.filter(tile => pointEquals(t.CoOrds, tile.CoOrds)).length > 0;
}

const isCity = (coords: Point): boolean => {
    return getTile(coords) instanceof Cities;
}

const isFriendlyCity = (coords: Point, self: Player): boolean => {
    return (isCity(coords) && (getTile(coords) as Cities).Owner === self);
}

const hasFriendlyUnit = (coords: Point, self: Player): boolean => {
    return getUnitAt(coords).Owner === self;
}

const hasFriendlyBuilding = (coords: Point, self: Player): boolean => {
    return getBuildingAt(coords).Owner === self;
}

const getRequiredSupplies = (path: Point[], unit: Unit): number => {
    let supplies: number = 0;
    path.forEach(p => {
        supplies += applyMod(getTile(p).TerrainMod.Supplies, 
                    applyModAttr(unit.Consumption.Supplies))
    });
    return supplies;
}

const getUnitsWithStatus = (status: UnitStatus): Unit[] => {
    return gameMap.Units.filter(u => u.Status === status);
}

const getUnitsWithStatusInUnitBuilding = (
    status: UnitStatus,
    ground: UnitBuilding,
    getDeployQueue: boolean = false): Unit[] => {
    return getDeployQueue 
        ? ground.TrainingQueue.filter(u => u.Status === status)
        : ground.ReadyToDeploy.filter(u => u.Status === status);
}

const deployUnit = (scene: Scene, unit: Unit, coords: Point) => {
    if (unit.Status !== UnitStatus.CanBeDeployed) {
        return; // TODO add exception maybe
    }


}

const executeMovePhase = (map: GameMap) => {

}

const consumeSupplies = (unit: Unit) => {
    
}

const flee = (unit: Unit) => {

}

const removeDestroyed = () => {

}

const deductTrainingTime = () => {
    getUnitsWithStatus(UnitStatus.InQueue).forEach(u => {
        u.TrainingTimeRemaining -= 1;
        if (u.TrainingTimeRemaining <= 0) {
            u.Status = UnitStatus.CanBeDeployed;
        }
    });
}

const updateTrainingGroundsQueues = () => {
    
}

export {
  deployUnit,
  getNeighbors,
  getNeighborsAtRange,
  getTile,
  getUnitAt,
  getUnitsWithStatus,
  getUnitsWithStatusInUnitBuilding,
  getBuildingAt,
  getBuildingsOfSameType,
  filterFriendlyBuildings,
  isOccupied,
  tileExistsInArray,
  isCity,
  isFriendlyCity,
  hasFriendlyUnit,
  hasFriendlyBuilding,
  getRequiredSupplies
}
