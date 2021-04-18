import { isInteger, random } from "mathjs";
import { Mesh, MeshBasicMaterial, Scene } from "three";
import { gameMap } from "../assets/json";
import { applyMod, applyModAttr, geqAttr, Point, pointEquals, Resources } from "../attr";
import { Fire, Hold, Move } from "../command";
import { ResourcesOutputType } from "../flows";
import { Player, playerEquals } from "../player";
import { BuildingData, Cities, cubeTileEquals, GameMap, Prop, Tile, WeightedCubeTile } from "../props";
import { Barracks, Building, BuildingStatus, BuildingType, DefensiveBuilding, Infrastructure, ResourcesBuilding, TransmissionBuilding, UnitBuilding } from "../props/buildings";
import {
  Infantry,
  Personnel,
  Unit,
  UnitStatus
} from "../props/units";
import { testButtonLogic, testCreateUnit, testCreateBuilding } from "../test";
import {
  InvalidArgumentException,
  parseCoordsToScreenPoint,
  getCitiesTexturesWithColor,
  rangeFrom,
  rangeFromTo,
} from "./";
import { instantiateUnit } from "./loadUnitFromGlb";

//TODO may move to util later for this region
//#region coords-util
const convertToCudeCoOrds = (coords: Point): number[] => {
  const z: number = coords.Y - (coords.X - (coords.X % 2)) / 2;
  const y: number = -coords.X - z;
  return [coords.X, y, z];
};
const convertToOffestCoOrds = (cube_coords: number[]): Point => {
  if (cube_coords.length !== 3) {
    throw new InvalidArgumentException('cube_coords', cube_coords);
  }
  let y: number = cube_coords[2] + (cube_coords[0] - (cube_coords[0] % 2)) / 2;
  return new Point(cube_coords[0], y);
};
const getHexDistance = (c1: Point, c2: Point): number => {
  let cc1: number[] = convertToCudeCoOrds(c1);
  let cc2: number[] = convertToCudeCoOrds(c2);
  return Math.max(
    Math.abs(cc1[0] - cc2[0]),
    Math.abs(cc1[1] - cc2[1]),
    Math.abs(cc1[2] - cc2[2]));
};
const getHexDistanceWithCubeCoords = (c1: number[], c2: number[]): number => {
  return Math.max(
    Math.abs(c1[0] - c2[0]),
    Math.abs(c1[1] - c2[1]),
    Math.abs(c1[2] - c2[2]));
};
//#endregion

//#region getNeibors
const getNeighbors = (map: GameMap, coords: Point, exclude_inaccessible = true): Tile[] => {
  const neighbors : Tile[] = [];
  const neighborOffset = coords.X % 2 ? Tile._NeighborOffsetOddX : Tile._NeighborOffsetEvenX;

  neighborOffset.forEach(pair => {
    const x = coords.X + pair[0];
    const y = coords.Y + pair[1];
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
const getNeighborsWithCubeCoords = (
  gameMap: GameMap,
  cube_tile_so_far: WeightedCubeTile,
  end: WeightedCubeTile): WeightedCubeTile[] => {
  const neighbors : WeightedCubeTile[] = [];

  let hex_neighbors = getNeighbors(gameMap, convertToOffestCoOrds(cube_tile_so_far.CubeCoords));
  hex_neighbors.forEach(h =>
    neighbors.push(
      new WeightedCubeTile(
        cube_tile_so_far,
        convertToCudeCoOrds(h.CoOrds),
        end.BaseCost,
        h.TerrainMod.Supplies.Value / 100 + 1,
        cube_tile_so_far.Cost + end.BaseCost * (h.TerrainMod.Supplies.Value / 100 + 1),
        getHexDistanceWithCubeCoords(convertToCudeCoOrds(h.CoOrds), end.CubeCoords),
        cube_tile_so_far.DistanceSoFar + 1
      )
    )
  );
  return neighbors;
};
const hasEmptyNeigbors = (gameMap: GameMap, coords: Point): boolean => {
  return getNeighbors(gameMap, coords).some(n => !isOccupied(gameMap, n.CoOrds));
};
const hasConstructibleNegibours = (gameMap: GameMap, coords: Point) => {
  return getNeighbors(gameMap, coords).some(n => !isOccupied(gameMap, n.CoOrds) && n.AllowConstruction);
}
//#endregion

//path-finding
const getPath = (gameMap: GameMap, t1: Tile, t2: Tile, unit: Unit): Tile[] => {
  let active: WeightedCubeTile[] = [];
  let visited: WeightedCubeTile[] = [];
  let path: Tile[] = [];

  let start = new WeightedCubeTile(
    undefined,
    convertToCudeCoOrds(t1.CoOrds),
    applyModAttr(unit.Consumption.Supplies),
    t1.TerrainMod.Supplies.Value / 100 + 1,
    0,
    getHexDistance(t1.CoOrds, t2.CoOrds),
    0);
  let end = new WeightedCubeTile(
    undefined,
    convertToCudeCoOrds(t2.CoOrds),
    applyModAttr(unit.Consumption.Supplies),
    t2.TerrainMod.Supplies.Value / 100 + 1,
    0,
    0,
    0); // last 3 parameters aren't important for end;

  active.push(start);
  while (active.length !== 0) {
    let check = active.sort((a, b) => a.CostDistance - b.CostDistance)[0];
    if (cubeTileEquals(check, end)) {
      console.log('reached destination');
      // trace back parents to get the path
      while (check.Parent !== undefined) {
        let t = getTile(gameMap, convertToOffestCoOrds(check.CubeCoords));
        path.push(t);
        check = check.Parent;
      }
      return path;
    }
    visited.push(check);
    active.splice(active.indexOf(check), 1);

    getNeighborsWithCubeCoords(gameMap, check, end).forEach(n => {
      if (visited.some(v => cubeTileEquals(v, n))) { //visited, skip
        return;
      }
      if (active.some(a => cubeTileEquals(a, n))) { // in the active list
        let exist = active.find(a => cubeTileEquals(a, n));
        if (exist.CostDistance > check.CostDistance) { // check if it is better than current tile (aka. check)
          active.splice(active.indexOf(exist), 1);
          active.push(n);
        }
      } else { // new tile, haven't visited
        active.push(n);
      }
    });
  }
  console.log('no path found');
  return path;
};

//#region tiles-related
const getTile = (gameMap: GameMap, coords: Point): Tile => {
  return gameMap.Tiles[coords.X][coords.Y];
};
const getPlayersCities = (gameMap: GameMap, self: Player): Cities[] => {
  return gameMap.Cities.filter(c => playerEquals(c.Owner, self));
};
const getCityAt = (gameMap: GameMap, coords: Point): Cities => {
  return gameMap.Cities.find(c => pointEquals(c.CoOrds, coords));
};
const isAccessible = (tile: Tile): boolean => {
  return tile.Height < 4 && tile.Height >= 0 && isWithinBoundary(tile.CoOrds);
};
const isWithinBoundary = (coords: Point): boolean => {
  return coords.X < GameMap.Width && coords.X >= 0 && coords.Y < GameMap.Height && coords.Y >= 0;
};
const isOccupied = (gameMap: GameMap, coords: Point): boolean => {
  return getUnitAt(gameMap, coords) !== undefined ||
    (getBuildingAt(gameMap, coords) !== undefined &&
    !(getBuildingAt(gameMap, coords) instanceof UnitBuilding));
};
const tileExistsInArray = (arr: Tile[], t: Tile): boolean => {
  return arr.filter(tile => pointEquals(t.CoOrds, tile.CoOrds)).length > 0;
};
const isCity = (gameMap: GameMap, coords: Point): boolean => {
  return getCityAt(gameMap, coords) !== undefined;
};
const isFriendlyCity = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return (isCity(gameMap, coords) && (getCityAt(gameMap, coords)?.Owner === self));
};
//#endregion

//#region unit-related
const hasUnit = (gameMap: GameMap, coords: Point): boolean => {
  return getUnitAt(gameMap, coords) !== undefined;
};
const getUnitAt = (gameMap: GameMap, coords: Point): Unit => {
  return gameMap.Units.find(u => pointEquals(u.Coords, coords));
};
const getNumUnits = (gameMap: GameMap, self: Player): number => {
  return gameMap.Units.filter(u => playerEquals(u.Owner, self)).length;
};
const hasFriendlyUnit = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return getUnitAt(gameMap, coords)?.Owner === self;
};
const getUnitsWithStatus = (gameMap: GameMap, status: UnitStatus): Unit[] => {
  return gameMap.Units.filter(u => u.Status === status);
};
const getUnitsWithStatusInUnitBuilding = (
  status: UnitStatus,
  ground: UnitBuilding,
  getDeployQueue = false): Unit[] => {
  return getDeployQueue
    ? ground.TrainingQueue.filter(u => u.Status === status)
    : ground.ReadyToDeploy.filter(u => u.Status === status);
};
//#endregion

//#region building-related
const hasBuilding = (gameMap: GameMap, coords: Point): boolean => {
  return getBuildingAt(gameMap, coords) !== undefined;
};
const getBuildingAt = (gameMap: GameMap, coords: Point): Building => {
  return gameMap.Buildings.find(b => pointEquals(b.CoOrds, coords));
};
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
};
const filterFriendlyBuildings = (buildings: Building[], self: Player) => {
  return buildings.filter(b => playerEquals(b.Owner, self));
};
const hasFriendlyBuilding = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return getBuildingAt(gameMap, coords)?.Owner === self;
};
//#endregion

const getRequiredSupplies = (path: Tile[], unit: Unit): number => {
  let supplies = 0;
  path.forEach(p => {
    supplies += applyMod(p.TerrainMod.Supplies,
          applyModAttr(unit.Consumption.Supplies))
  });
  return supplies;
};

//TODO may move to select Tile instead
//#region logic for determining commands available
const canMove = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    let unit = getUnitAt(gameMap, tile.CoOrds);
    return unit.Carrying.Supplies.Value > 0 && hasEmptyNeigbors(gameMap, unit.Coords);    
  }
  return false;
  //TODO add check fuel for vehicles and suppression later
};
const canFire = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    let unit = getUnitAt(gameMap, tile.CoOrds);
    return geqAttr(unit.Carrying.Cartridges, unit.Consumption.Cartridges);
    //TODO add check for shells and suppression later
  }
  return false;
};
const canCapture = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasUnit(gameMap, tile.CoOrds)) {
    let unit = getUnitAt(gameMap, tile.CoOrds);
    if (unit instanceof Personnel) {
      if (isCity(gameMap, tile.CoOrds)) {
        let city: Cities = getCityAt(gameMap, tile.CoOrds);
        if (city.Owner === self) {
          return city.Morale.Value < 100;
        } 
        return true;
      }
    }
  }
  return false;
};
const canBuild = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return hasConstructibleNegibours(gameMap, tile.CoOrds);
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    let city = getCityAt(gameMap, tile.CoOrds);
    let ok = false;
    getNeighborsAtRange(gameMap, city, applyModAttr(city.ConstructionRange)).forEach(n => {
      if (n.AllowConstruction && !isOccupied(gameMap, n.CoOrds)) {
        ok = true;
        return;
      }
    });
    return ok;
  }
  return false;
};
const canTrain = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    let b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding) {
      let ub: UnitBuilding = b as UnitBuilding;
      return ub.TrainingQueue.length < applyModAttr(ub.QueueCapacity);
    } 
  }
  return false;
};
const canDeploy = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    let b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding) {
      let ub: UnitBuilding = b as UnitBuilding;
      return ub.ReadyToDeploy.length > 0;
    }
  }
  return false;
};
//#endregion

const flee = (unit: Unit) => {
  if (unit.Morale.Value === 0) {
    if (random(0, 1) <= 0.1) {
      unit.Status = UnitStatus.Destroyed;
    }
  }
};
const getMesh = (scene: Scene, prop: Prop): Mesh => {
  return scene.getObjectByName(prop.MeshName) as Mesh;
};
const removeDestroyed = (scene: Scene, gameMap: GameMap): void => {
  gameMap.Units.filter(u => u.Status === UnitStatus.Destroyed).forEach(u => {
    scene.remove(getMesh(scene, u));
  });
  gameMap.Buildings
    .filter(b => b.Status === BuildingStatus.Destroyed)
    .forEach(b => scene.remove(scene.getObjectByName(b.Name)));
  gameMap.Units = gameMap.Units.filter(u => u.Status !== UnitStatus.Destroyed);
  gameMap.Buildings = gameMap.Buildings.filter(b => b.Status !== BuildingStatus.Destroyed);
};
const updateTrainingTime = (gameMap: GameMap): void => {
  getUnitsWithStatus(gameMap, UnitStatus.InQueue).forEach(u => {
    u.TrainingTimeRemaining -= 1;
    if (u.TrainingTimeRemaining <= 0) {
      u.Status = UnitStatus.CanBeDeployed;
      u.TrainingGround.TrainingQueue.splice(u.TrainingGround.TrainingQueue.indexOf(u), 1);
      u.TrainingGround.ReadyToDeploy.push(u);
    }
  });
};
const updateTrainingGroundsQueues = (gameMap: GameMap): void => {
  gameMap.Buildings.filter(b => b instanceof UnitBuilding).forEach(b => {
    let ub = b as UnitBuilding;
    if (ub.TrainingQueue.length === 0) {
      return;
    }
    ub.CurrentQueueTime = ub.TrainingQueue[ub.TrainingQueue.length - 1].TrainingTimeRemaining ?? 0;
  });
};
const updateUnitPositions = (scene: Scene, gameMap: GameMap) => {
  gameMap.Units.forEach(u => {
    let pos = parseCoordsToScreenPoint(u.Coords);
    getMesh(scene, u).position.set(pos.x, pos.y, pos.z);
  })
};
const updateConstructionTime = (gameMap: GameMap): void => {
  gameMap.Buildings.filter(b => b.Status === BuildingStatus.UnderConstruction).forEach(b => {
    b.ConstructionTimeRemaining -= 1;
    if (b.ConstructionTimeRemaining <= 0) {
      b.Status = BuildingStatus.Active;
    }
  });
};
const updateResources = (r: Resources) => {
  document.querySelector('.player-resource-value.money-value').innerHTML = r.Money.Value.toString();
  document.querySelector('.player-resource-value.steel-value').innerHTML = r.Steel.Value.toString();
  document.querySelector('.player-resource-value.supplies-value').innerHTML = r.Supplies.Value.toString();
  document.querySelector('.player-resource-value.cartridges-value').innerHTML = r.Cartridges.Value.toString();
  document.querySelector('.player-resource-value.manpower-value').innerHTML = r.Manpower.Value.toString();
};
const updateDestroyed = (gameMap: GameMap): void => {
  gameMap.Units.filter(u => u.Defense.Strength.Value <= 0).forEach(u => {
    u.Status = UnitStatus.Destroyed;
  });
  gameMap.Buildings.filter(b => b.Durability.Value <= 0).forEach(b => {
    b.Status = BuildingStatus.Destroyed;
  });
  // TODO add logic for city destroyed
};
const updateCities = (scene: Scene, gameMap: GameMap): void => {
  gameMap.Cities.forEach(c => {
    getMesh(scene, getTile(gameMap, c.CoOrds)).material[1] = new MeshBasicMaterial({
      map: getCitiesTexturesWithColor(c),
      transparent: true
    });
  });
};
const getWinner = (gameMap: GameMap): Player => {
  let eliminated: Player[] = [];
  gameMap.Players.forEach(p => {
    if (getPlayersCities(gameMap, p).length === 0) {
      eliminated.push(p);
    }
  });
  if (eliminated.length !== 0) {
    let remaining_players = gameMap.Players.filter(p => !eliminated.includes(p));
    if (remaining_players.length === 1) {
      return remaining_players[0];
    } else if (remaining_players.length === 0) { // all players' cities are destroyed in the same round
      let numUnits: number[] = [];
      gameMap.Players.forEach(p => numUnits.push(getNumUnits(gameMap, p)));
      let player_index_with_most_units = numUnits.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
      return gameMap.Players[player_index_with_most_units];
      // TODO can consider more cases but it's already very rare
      // to have same num units && all players' cities are destroyed in the same round
    }
    gameMap.Units = gameMap.Units.filter(u => remaining_players.includes(u.Owner));
    gameMap.Buildings = gameMap.Buildings.filter(b => remaining_players.includes(b.Owner));
  }
  return undefined;
};
const clearCommands = (gameMap: GameMap) => {
  gameMap.Commands = [];
};

const executePhases = (scene: Scene, data: ResourcesOutputType) => {
  data.gameMap.Commands.filter(h => h instanceof Hold).forEach(h => h.Execute());
  executeFirePhase(data.gameMap);
  executeMovePhase(data.gameMap);
  executeMiscPhase(scene, data.gameMap);
};

const executeMovePhase = (gameMap: GameMap) => {
  gameMap.Commands.filter(c => c instanceof Move).forEach(m => m.Execute());
};
const executeFirePhase = (gameMap: GameMap) => {
  gameMap.Commands.filter(c => c instanceof Fire).forEach(f => f.Execute());
};
const executeMiscPhase = (scene: Scene, gameMap: GameMap) => {
  gameMap.Units.forEach(u => flee(u));
  updateConstructionTime(gameMap);
  updateTrainingGroundsQueues(gameMap);
  updateTrainingTime(gameMap);
  updateDestroyed(gameMap);
  updateCities(scene, gameMap);
  clearCommands(gameMap);
  removeDestroyed(scene, gameMap);
  let p = getWinner(gameMap);
  if (p !== undefined) {
    alert(`${p.Name} won!!`);
    // TODO return to main menu
  }
  updateUnitPositions(scene, gameMap);
  alert(`Round ${gameMap.RoundNum} ended. Now is round ${gameMap.RoundNum + 1}`);
  gameMap.RoundNum += 1;
};

export {
  convertToCudeCoOrds,
  convertToOffestCoOrds,
  getHexDistance,
  getHexDistanceWithCubeCoords,
  getNeighbors,
  getNeighborsAtRange,
  hasEmptyNeigbors,
  hasConstructibleNegibours,
  getPath,
  getTile,
  getPlayersCities,
  hasUnit,
  getUnitAt,
  getUnitsWithStatus,
  getCityAt,
  getNumUnits,
  getUnitsWithStatusInUnitBuilding,
  hasBuilding,
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
  canBuild,
  canTrain,
  canDeploy,
  flee,
  getMesh,
  updateConstructionTime,
  updateTrainingGroundsQueues,
  updateTrainingTime,
  updateDestroyed,
  updateCities,
  updateResources,
  clearCommands,
  getWinner,
  executePhases
};
