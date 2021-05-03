import { isInteger, random, randomInt } from "mathjs";
import { Mesh, MeshBasicMaterial, Scene } from "three";
import { gameMap } from "../assets/json";
import { applyMod, applyModAttr, geqAttr, Point, pointEquals, produceResources, Resources } from "../attr";
import { Build, canCapture, Capture, Deploy, Fire, getDeployTargets, getFireTargets, getMoveTargets, Hold, Move, Train } from "../command";
import { JsonResourcesType } from "../flows";
import { Player, playerEquals } from "../player";
import { BuildingData, Cities, cubeTileEquals, GameMap, Prop, Tile, UnitData, WeightedCubeTile } from "../props";
import { Barracks, Building, BuildingStatus, BuildingType, DefensiveBuilding, Infrastructure, ResourcesBuilding, TransmissionBuilding, UnitBuilding } from "../props/buildings";
import {
  Artillery,
  Assault,
  Engineer,
  Infantry,
  Militia,
  Mountain,
  Personnel,
  Support,
  Unit,
  UnitStatus
} from "../props/units";
import { Firearm, Gun } from "../researches";
import {
  InvalidArgumentException,
  parseCoordsToScreenPoint,
  getCitiesTexturesWithColor,
  rangeFrom,
  rangeFromTo,
} from "./";

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
  const y: number = cube_coords[2] + (cube_coords[0] - (cube_coords[0] % 2)) / 2;
  return new Point(cube_coords[0], y);
};
const getHexDistance = (c1: Point, c2: Point): number => {
  const cc1: number[] = convertToCudeCoOrds(c1);
  const cc2: number[] = convertToCudeCoOrds(c2);
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
const getNeighbors = (map: GameMap, coords: Point, exclude_inaccessible = true, exclude_undefined = true): Tile[] => {
  const neighbors : Tile[] = [];
  const neighborOffset = coords.X % 2 ? Tile._NeighborOffsetOddX : Tile._NeighborOffsetEvenX;

  neighborOffset.forEach(pair => {
    const x = coords.X + pair[0];
    const y = coords.Y + pair[1];
    if (x < GameMap.Width && x >= 0 && y < GameMap.Height && y >= 0) {
      neighbors.push(map.Tiles[x][y]);
    } else if (!exclude_undefined) {
      neighbors.push(undefined);
    }
  });
  return exclude_inaccessible ? neighbors.filter(t => isAccessible(t)) : neighbors;
};
const getNeighborsAtRange = (gameMap: GameMap, tile: Tile, range: number, exclude_inaccessible = true) : Tile[] => {
  if (!isInteger(range)) {
    throw new InvalidArgumentException('range', range);
  }
  if (range <= 0) {
    return [];
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

  const dummy = (tile.CoOrds.X % 2 && range % 2) || !(tile.CoOrds.X % 2 || range % 2);
  n_YLowerRange.forEach((y, i) =>
    rangeFromTo(tile.CoOrds.X - (range - 2 * (i + 1) + +dummy), tile.CoOrds.X + range - 2 * (i + 1) + +dummy)
    .filter(x => x >= 0 || x < GameMap.Width)
    .forEach(x =>
      neighbors.push(gameMap.Tiles[x][y])
    )
  );
  n_YUpperRange.forEach((y, i) => {
    const det = range - 2 * (i + 1) + +(!dummy);
    const arr: number[] = det < 0
    ? [tile.CoOrds.X]
    : rangeFromTo(tile.CoOrds.X - det, tile.CoOrds.X + det);
    arr.filter(x => x >= 0 || x < GameMap.Width).forEach(x =>
    neighbors.push(gameMap.Tiles[x][y])
    );
    });
  const raw: Tile[] = neighbors.filter(n => n !== undefined);
  return [...new Set(exclude_inaccessible ? raw.filter(t => isAccessible(t)) : raw)];
};
const getNeighborsWithCubeCoords = (
  gameMap: GameMap,
  cube_tile_so_far: WeightedCubeTile,
  end: WeightedCubeTile): WeightedCubeTile[] => {
  const neighbors : WeightedCubeTile[] = [];

  const hex_neighbors = getNeighbors(gameMap, convertToOffestCoOrds(cube_tile_so_far.CubeCoords));
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
const hasConstructibleNeighbours = (gameMap: GameMap, coords: Point): boolean => {
  return getNeighbors(gameMap, coords).some(n => !isOccupied(gameMap, n.CoOrds) && n.AllowConstruction);
}
const getConstructibleNeighbours = (gameMap: GameMap, coords: Point, range = 1): Tile[] => {
  return (range === 1 ? 
    getNeighbors(gameMap, coords) : 
    getNeighborsAtRange(gameMap, getTile(gameMap, coords), range))
    .filter(n => !isOccupied(gameMap, n.CoOrds) && n.AllowConstruction);
}
const getFortifyableNeighbours = (gameMap: GameMap, coords: Point, range = 1): Building[] => {
  return (range === 1 ?
    getNeighbors(gameMap, coords) :
    getNeighborsAtRange(gameMap, getTile(gameMap, coords), range))
    .map(n => getBuildingAt(gameMap, n.CoOrds))
    .filter(b => b !== undefined 
      && b.Status === BuildingStatus.Active
      && b.Level >= 1 
      && b.Level < b.MaxLevel);
}
const getDemolishableNeighbours = (gameMap: GameMap, coords: Point, range = 1): Building[] => {
  return (range === 1 ?
    getNeighbors(gameMap, coords) :
    getNeighborsAtRange(gameMap, getTile(gameMap, coords), range))
    .map(n => getBuildingAt(gameMap, n.CoOrds))
    .filter(b => b !== undefined
      && b.Status === BuildingStatus.Active
      && b.Level >= 1);
}
//#endregion

//path-finding
const getPath = (gameMap: GameMap, t1: Tile, t2: Tile, unit: Unit): Tile[] => {
  const active: WeightedCubeTile[] = [];
  const visited: WeightedCubeTile[] = [];
  const path: Tile[] = [];

  const start = new WeightedCubeTile(
    undefined,
    convertToCudeCoOrds(t1.CoOrds),
    applyModAttr(unit.Consumption.Supplies),
    t1.TerrainMod.Supplies.Value / 100 + 1,
    0,
    getHexDistance(t1.CoOrds, t2.CoOrds),
    0);
  const end = new WeightedCubeTile(
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
      // trace back parents to get the path
      while (check.Parent !== undefined) {
        const t = getTile(gameMap, convertToOffestCoOrds(check.CubeCoords));
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
        const exist = active.find(a => cubeTileEquals(a, n));
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
const getCityByPlayer = (gameMap: GameMap, player: Player): Cities => {
  return gameMap.Cities.find(c => playerEquals(c.Owner, player));
};
const isAccessible = (tile: Tile): boolean => {
  return tile.Height < 4 && tile.Height >= 0 && isWithinBoundary(tile.CoOrds);
};
const isWithinBoundary = (coords: Point): boolean => {
  return coords.X < GameMap.Width && coords.X >= 0 && coords.Y < GameMap.Height && coords.Y >= 0;
};
const isOccupied = (gameMap: GameMap, coords: Point): boolean => {
  return getUnitAt(gameMap, coords) !== undefined ||
    getBuildingAt(gameMap, coords) !== undefined;
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
const hasHostileUnit = (gameMap: GameMap, coords: Point, self: Player): boolean => {
  return getUnitAt(gameMap, coords)?.Owner !== self;
};
const hasEnoughCartridges = (unit: Unit, firearm: Firearm, suppress = false): boolean => {
  return geqAttr(unit.Carrying.Cartridges, suppress ? firearm.ConsumptionSuppress.Cartridges : firearm.ConsumptionNormal.Cartridges);
};
const hasEnoughShells = (unit: Unit, weapon: Firearm | Gun, suppress = false): boolean => {
  return geqAttr(
    unit.Carrying.Shells, 
    weapon instanceof Firearm 
      ? (suppress
          ? (weapon as Firearm).ConsumptionSuppress.Shells
          : (weapon as Firearm).ConsumptionNormal.Shells)
      : (weapon as Gun).ShellConsumption
  );
}
// for weapons that consume fuel, so far firearms only
const hasEnoughFuel = (unit: Unit, firearm: Firearm, suppress = false): boolean => {
  return geqAttr(unit.Carrying.Fuel, suppress ? firearm.ConsumptionSuppress.Fuel : firearm.ConsumptionNormal.Fuel);
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

//#region AI
const AITurn = (scene: Scene, data: JsonResourcesType) => {
  const gameMap = data.gameMap;
  const unitData = data.unitData;
  const ai = gameMap.Players[1];
  const ai_city = getPlayersCities(gameMap, ai);
  const player_city = getPlayersCities(gameMap, gameMap.Players[0]);
  const barracks = gameMap.Buildings.filter(b => playerEquals(b.Owner, ai) && b instanceof Barracks).map(b => b as Barracks);
  const units: string[] = Object.keys(data.unitData.PersonnelData);
  const own_units = gameMap.Units.filter(u => playerEquals(ai, u.Owner) && u.Status === UnitStatus.Active);

  const getUnitFromName = (name: string, data: UnitData): Unit => {
    switch (name) {
      case 'militia':
        return new Militia(data.PersonnelData[name]);
      case 'infantry':
        return new Infantry(data.PersonnelData[name]);
      case 'assault':
        return new Assault(data.PersonnelData[name]);
      case 'support':
        return new Support(data.PersonnelData[name]);
      case 'mountain':
        return new Mountain(data.PersonnelData[name]);
      case 'engineer':
        return new Engineer(data.PersonnelData[name]);
    }
  };

  if (barracks.length === 0) {
    const b_targets = getConstructibleNeighbours(gameMap, ai_city[0].CoOrds, applyModAttr(ai_city[0].ConstructionRange));
    const rand_b = b_targets[randomInt(0, b_targets.length)];
    gameMap.Commands.push(new Build(scene, gameMap, ai, rand_b.CoOrds, rand_b.CoOrds, new Barracks(data.buildingData.UnitBuildingData['barracks'])));
    return;
  }

  const active_barracks = barracks.filter(b => b.Status === BuildingStatus.Active);
  if (active_barracks.length === 0) {
    return;
  }

  const t_target = active_barracks[randomInt(0, active_barracks.length)];
  const u_target = units[randomInt(0, units.length)];
  gameMap.Commands.push(new Train(scene, gameMap, ai, t_target.CoOrds, t_target.CoOrds, getUnitFromName(u_target, unitData)));

  const deploy_target = active_barracks.filter(b => b.ReadyToDeploy.length !== 0);
  if (deploy_target.length === 0) {
     return;
  }
  const deploy_barrack = deploy_target[randomInt(0, deploy_target.length)];
  const ready_queue = deploy_barrack.ReadyToDeploy;
  const deploy_unit = ready_queue[randomInt(0, ready_queue.length)];
  const deploy_tiles = getDeployTargets(gameMap, getTile(gameMap, deploy_barrack.CoOrds), ai);
  const deploy_tile = deploy_tiles[randomInt(0, deploy_tiles.length)];
  gameMap.Commands.push(new Deploy(scene, gameMap, ai, deploy_barrack.CoOrds, deploy_tile.CoOrds, data.customData, deploy_unit.Name))

  if (own_units.length === 0) {
    return;
  }
  own_units.forEach(o => {
    const ot = getTile(gameMap, o.Coords)
    const fire_targets = getFireTargets(gameMap, ot, ai, (o as Personnel).PrimaryFirearm);
    const move_targets = getMoveTargets(gameMap, ot, ai);
    
    if (canCapture(gameMap, ot, ai)) {
      gameMap.Commands.push(new Capture(gameMap, ai, ot.CoOrds, ot.CoOrds));
    } else if (fire_targets.length !== 0) {
      const f_target = fire_targets[randomInt(0, fire_targets.length)];
      gameMap.Commands.push(new Fire(gameMap, ai, ot.CoOrds, f_target.Coords));
    } else if (move_targets.length !== 0) {
      const m_target = move_targets.sort((a, b) => 
        getHexDistance(a.CoOrds, player_city[0].CoOrds) - 
        getHexDistance(b.CoOrds, player_city[0].CoOrds));
      gameMap.Commands.push(new Move(gameMap, ai, ot.CoOrds, m_target[0].CoOrds));
    }
  })
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

const calculateMorale = (gameMap: GameMap) => {
  gameMap.Units.filter(u => u.Carrying.Supplies.Value <= 0).forEach(u => {
    u.Morale.Value -= 10; // -10 for now, can vary with different types of units later
    if (u.Morale.Value < 0) {
      u.Morale.Value = 0;
    }
  });
};
const flee = (unit: Unit) => {
  if (unit.Morale.Value === 0) {
    if (random(0, 1) <= 0.1) { // 0.1 for now, can vary with different types of units later
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
    .forEach(b => scene.remove(scene.getObjectByName(b.MeshName)));
  gameMap.Units = gameMap.Units.filter(u => u.Status !== UnitStatus.Destroyed);
  gameMap.Buildings = gameMap.Buildings.filter(b => b.Status !== BuildingStatus.Destroyed);
};
const updateTrainingTime = (gameMap: GameMap): void => {
  getUnitsWithStatus(gameMap, UnitStatus.InQueue).forEach(u => {
    u.TrainingTimeRemaining -= 1;
    if (u.TrainingTimeRemaining <= 0 && u.Status !== UnitStatus.Active) {
      u.TrainingTimeRemaining = 0;
      u.Status = UnitStatus.CanBeDeployed;
      if (playerEquals(u.Owner, gameMap.Players[0])) {
        gameMap.RoundLog.push(`${u.Name} trained at ${u.TrainingGround.Name} (${u.TrainingGround.CoOrds.X}, ${u.TrainingGround.CoOrds.Y}) is ready to be deployed.`);
      }
      u.TrainingGround.TrainingQueue.splice(u.TrainingGround.TrainingQueue.indexOf(u), 1);
      u.TrainingGround.ReadyToDeploy.push(u);
    }
  });
};
const updateTrainingGroundsQueues = (gameMap: GameMap): void => {
  gameMap.Buildings.filter(b => b instanceof UnitBuilding).forEach(b => {
    const ub = b as UnitBuilding;
    if (ub.TrainingQueue.length === 0) {
      return;
    }
    ub.CurrentQueueTime = ub.TrainingQueue[ub.TrainingQueue.length - 1].TrainingTimeRemaining ?? 0;
  });
};
const updateUnitPositions = (scene: Scene, gameMap: GameMap) => {
  gameMap.Units
    .filter(u => u.Status === UnitStatus.Active)
    .forEach(u => {
      const pos = parseCoordsToScreenPoint(u.Coords);
      getMesh(scene, u)?.position.set(pos.x, pos.y, pos.z);
    });
};
const updateConstructionTime = (gameMap: GameMap): void => {
  gameMap.Buildings.filter(b => b.Status === BuildingStatus.UnderConstruction).forEach(b => {
    b.ConstructionTimeRemaining -= 1;
    if (b.ConstructionTimeRemaining <= 0) {
      b.ConstructionTimeRemaining = 0;
      b.Status = BuildingStatus.Active;
      if (playerEquals(b.Owner, gameMap.Players[0])) {
        gameMap.RoundLog.push(`Construction of ${b.Name} at (${b.CoOrds.X}, ${b.CoOrds.Y}) has finished.`)
      }
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
    gameMap.RoundLog.push(`${u.Name} at (${u.Coords.X}, ${u.Coords.Y}) was destroyed!`);
    u.Status = UnitStatus.Destroyed;
  });
  gameMap.Buildings.filter(b => b.Durability.Value <= 0 || b.Level === 0).forEach(b => {
    gameMap.RoundLog.push(`${b.Name} at (${b.CoOrds.X}, ${b.CoOrds.Y}) was destroyed!`);
    b.Status = BuildingStatus.Destroyed;
  });
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
  const eliminated: Player[] = [];
  gameMap.Players.forEach(p => {
    if (getPlayersCities(gameMap, p).length === 0) {
      eliminated.push(p);
    }
  });
  if (eliminated.length !== 0) {
    const remaining_players = gameMap.Players.filter(p => !eliminated.includes(p));
    if (remaining_players.length === 1) {
      return remaining_players[0];
    } else if (remaining_players.length === 0) { // all players' cities are destroyed in the same round
      const numUnits: number[] = [];
      gameMap.Players.forEach(p => numUnits.push(getNumUnits(gameMap, p)));
      const player_index_with_most_units = numUnits.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
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
  gameMap.Units.forEach(u => u.IsCommandSet = false);
};

const executePhases = (scene: Scene, data: JsonResourcesType) => {
  AITurn(scene, data);
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
  gameMap.Commands.filter(c => !(c instanceof Move) && !(c instanceof Fire)).forEach(c => c.Execute());
  calculateMorale(gameMap);
  gameMap.Units.forEach(u => flee(u));
  updateConstructionTime(gameMap);
  updateTrainingGroundsQueues(gameMap);
  updateTrainingTime(gameMap);
  updateDestroyed(gameMap);
  updateCities(scene, gameMap);
  clearCommands(gameMap);
  removeDestroyed(scene, gameMap);
  const p = getWinner(gameMap);
  if (p !== undefined) {
    alert(`${p.Name} won!!`);
    // TODO return to main menu
  }
  updateUnitPositions(scene, gameMap);
  gameMap.Players.forEach(p => produceResources(p.Resources, getCityByPlayer(gameMap, p).Production));
  updateResources(gameMap.Players[0].Resources);
  while (gameMap.RoundLog.length > 0) {
    alert(gameMap.RoundLog.pop());
  }
  alert(`Round ${gameMap.RoundNum} ended. Now is round ${gameMap.RoundNum + 1}`);
  gameMap.RoundNum += 1;
  console.log(gameMap.Buildings);
};

export {
  convertToCudeCoOrds,
  convertToOffestCoOrds,
  getHexDistance,
  getHexDistanceWithCubeCoords,
  getNeighbors,
  getNeighborsAtRange,
  hasEmptyNeigbors,
  hasConstructibleNeighbours,
  getConstructibleNeighbours,
  getFortifyableNeighbours,
  getDemolishableNeighbours,
  getPath,
  getTile,
  getPlayersCities,
  hasUnit,
  getUnitAt,
  getUnitsWithStatus,
  getCityAt,
  getCityByPlayer,
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
  hasHostileUnit,
  hasEnoughCartridges,
  hasEnoughShells,
  hasEnoughFuel,
  hasFriendlyBuilding,
  getRequiredSupplies,
  removeDestroyed,
  calculateMorale,
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
