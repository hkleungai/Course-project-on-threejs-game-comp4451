import { isInteger, random } from "mathjs";
import { Mesh, Object3D, Scene } from "three";
import { applyMod, applyModAttr, geqAttr, Point, pointEquals } from "../attr";
import { Player, playerEquals } from "../player";
import { Cities, GameMap, Tile } from "../props"
import { Building, BuildingStatus, BuildingType, DefensiveBuilding, Infrastructure, ResourcesBuilding, TransmissionBuilding, UnitBuilding } from "../props/buildings";
import {
  Personnel,
  Unit,
  UnitStatus
} from "../props/units"
import { InvalidArgumentException, rangeFrom, rangeFromTo } from "../utils";
import { instantiateUnit } from "./loadUnitFromGlb";

const convertToCudeCoOrds = (coords: Point): number[] => {
  let z: number = coords.Y - (coords.X - (coords.X % 2)) / 2;
  let y: number = -coords.X - z;
  return [coords.X, y, z];
}

const convertToOffestCoOrds = (cube_coords: number[]): Point => {
  if (cube_coords.length !== 3) {
    throw new InvalidArgumentException('cube_coords', cube_coords);
  }
  let y: number = cube_coords[2] + (cube_coords[0] - (cube_coords[0] % 2)) / 2;
  return new Point(cube_coords[0], y);
}

const getHexDistance = (c1: Point, c2: Point): number => {
  let cc1: number[] = convertToCudeCoOrds(c1);
  let cc2: number[] = convertToCudeCoOrds(c2);
  return Math.max(
    Math.abs(cc1[0] - cc2[0]),
    Math.abs(cc1[1] - cc2[1]),
    Math.abs(cc1[2] - cc2[2]));
}

const getNeighbors = (map: GameMap, tile: Tile, exclude_inaccessible = true): Tile[] => {
  const neighbors : Tile[] = [];
  const neighborOffset = tile.CoOrds.X % 2 ? Tile._NeighborOffsetOddX : Tile._NeighborOffsetEvenX;

  neighborOffset.forEach(pair => {
    const x = tile.CoOrds.X + pair[0];
    const y = tile.CoOrds.Y + pair[1];
    if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
    neighbors.push(map.Tiles[x][y]);
    }
  });
  return exclude_inaccessible ? neighbors.filter(t => isAccessible(t)) : neighbors;
  };

const getNeighborsAtRange = (gameMap: GameMap, tile: Tile, range: number, exclude_inaccessible = true) : Tile[] => {
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
  return [...new Set(exclude_inaccessible ? raw.filter(t => isAccessible(t)) : raw)];
};

const getPath = (t1: Tile, t2: Tile): Tile[] => {
  let active: Tile[] = [];
  let visited: Tile[] = [];
  let path: Tile[] = [];

  active.push(t1);
  while (active.length !== 0) {
    let check: Tile;
  }
  return path;
}

const getTile = (gameMap: GameMap, coords: Point): Tile => {
  return gameMap[coords.X][coords.Y];
}

const getUnitAt = (gameMap: GameMap, coords: Point): Unit => {
  return gameMap.Units.find(u => pointEquals(u.Coords, coords));
}

const getBuildingAt = (gameMap: GameMap, coords: Point): Building => {
  return gameMap.Buildings.find(b => pointEquals(b.CoOrds, coords));
}

const getBuildingsOfSameType = (gameMap: GameMap, type: BuildingType): Building[] => {
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

const isAccessible = (tile: Tile): boolean => {
  return tile.Height < 4 && tile.Height >= 0 && isWithinBoundary(tile.CoOrds);
}

const isWithinBoundary = (coords: Point): boolean => {
  return coords.X < GameMap.Width && coords.X >= 0 && coords.Y < GameMap.Height && coords.Y >= 0;
}

const isOccupied = (gameMap: GameMap, coords: Point): boolean => {
  return getUnitAt(gameMap, coords) !== undefined ||
    (getBuildingAt(gameMap, coords) !== undefined &&
    !(getBuildingAt(gameMap, coords) instanceof UnitBuilding));
}

const tileExistsInArray = (arr: Tile[], t: Tile): boolean => {
  return arr.filter(tile => pointEquals(t.CoOrds, tile.CoOrds)).length > 0;
}

const isCity = (gameMap: GameMap, coords: Point): boolean => {
  return getTile(gameMap, coords) instanceof Cities;
}

const isFriendlyCity = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return (isCity(gameMap, coords) && (getTile(gameMap, coords) as Cities).Owner === self);
}

const hasFriendlyUnit = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return getUnitAt(gameMap, coords).Owner === self;
}

const hasFriendlyBuilding = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return getBuildingAt(gameMap, coords).Owner === self;
}

const getRequiredSupplies = (gameMap: GameMap, path: Point[], unit: Unit): number => {
  let supplies = 0;
  path.forEach(p => {
    supplies += applyMod(getTile(gameMap, p).TerrainMod.Supplies,
          applyModAttr(unit.Consumption.Supplies))
  });
  return supplies;
}

const getUnitsWithStatus = (gameMap: GameMap, status: UnitStatus): Unit[] => {
  return gameMap.Units.filter(u => u.Status === status);
}

const getUnitsWithStatusInUnitBuilding = (
  status: UnitStatus,
  ground: UnitBuilding,
  getDeployQueue = false): Unit[] => {
  return getDeployQueue
    ? ground.TrainingQueue.filter(u => u.Status === status)
    : ground.ReadyToDeploy.filter(u => u.Status === status);
}

///region logic for determining commands available
const canMove = (unit: Unit): boolean => {
  return unit.Carrying.Supplies.Value > 0;
  //TODO add check fuel for vehicles and suppression later
}

const canFire = (unit: Unit): boolean => {
  return geqAttr(unit.Carrying.Cartridges, unit.Consumption.Cartridges);
  //TODO add check for shells and suppression later
}

const canCapture = (gameMap: GameMap, tile: Tile, unit: Unit): boolean => {
  return unit instanceof Personnel && !isFriendlyCity(gameMap, tile.CoOrds, unit.Owner);
}

const canTrain = (gameMap: GameMap, tile: Tile): boolean => {
  let b: Building = getBuildingAt(gameMap, tile.CoOrds);
  if (b instanceof UnitBuilding) {
    let ub: UnitBuilding = b as UnitBuilding;
    return ub.TrainingQueue.length < applyModAttr(ub.QueueCapacity);
  } else {
    return false;
  }
}

const canDeploy = (gameMap: GameMap, tile: Tile):boolean => {
  let b: Building = getBuildingAt(gameMap, tile.CoOrds);
  if (b instanceof UnitBuilding) {
    let ub: UnitBuilding = b as UnitBuilding;
    return ub.ReadyToDeploy.length > 0;
  } else {
    return false;
  }
}

///endregion

const executeMovePhase = (map: GameMap) => {
  //TODO
}

const consumeSupplies = (unit: Unit) => {
  //TODO
}

const flee = (unit: Unit) => {
  if (unit.Morale.Value === 0) {
    if (random(0, 1) <= 0.1) {
      unit.Status = UnitStatus.Destroyed;
    }
  }
}

const removeDestroyed = (scene: Scene, gameMap: GameMap) => {
  gameMap.Units.filter(u => u.Status === UnitStatus.Destroyed).forEach(u => {
    console.log(u.MeshName);
    console.log(scene.getObjectByName(u.MeshName));
    console.log(scene);
    let o: Mesh = <Mesh>(scene.getObjectByName(u.MeshName));
    scene.remove(o);
  });
  gameMap.Buildings.filter(b => b.Status === BuildingStatus.Destroyed)
                   .forEach(b => scene.remove(scene.getObjectByName(b.Name)));
  gameMap.Units = gameMap.Units.filter(u => u.Status !== UnitStatus.Destroyed);
  gameMap.Buildings = gameMap.Buildings.filter(b => b.Status !== BuildingStatus.Destroyed);
  
}

const deductTrainingTime = (gameMap: GameMap) => {
  getUnitsWithStatus(gameMap, UnitStatus.InQueue).forEach(u => {
    u.TrainingTimeRemaining -= 1;
    if (u.TrainingTimeRemaining <= 0) {
      u.Status = UnitStatus.CanBeDeployed;
    }
  });
}

const updateTrainingGroundsQueues = () => {
  // TODO
}

export {
  convertToCudeCoOrds,
  convertToOffestCoOrds,
  getHexDistance,
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
  isAccessible,
  isWithinBoundary,
  tileExistsInArray,
  isCity,
  isFriendlyCity,
  hasFriendlyUnit,
  hasFriendlyBuilding,
  getRequiredSupplies,
  removeDestroyed,
  canMove,
  canFire,
  canCapture,
  canTrain,
  canDeploy
}
