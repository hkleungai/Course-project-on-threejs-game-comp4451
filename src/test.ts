//eslint-disable no-console
import { Scene } from 'three';
import {
  getNeighbors,
  getNeighborsAtRange,
  getMesh,
  instantiateBuilding,
  instantiateUnit,
  hasUnit,
  hasBuilding,
  getTile,
  getUnitAt,
  isOccupied,
  getBuildingAt,
  executePhases
} from './utils';
import { GameMap, Tile } from './props/tiles';
import { meshes } from './resources';
import { Barracks, Building, BuildingStatus } from './props/buildings';
import { BuildingData, UnitData } from './props';
import { lackingResources, Point } from './attr';
import { Infantry, Personnel, Support, Unit, UnitStatus } from './props/units';
import { Player } from './player';
import { JsonResourcesType } from './flows';
import { getMoveTargets, canCapture, getDeployUnits, getFireTargets, getBuildTargets, canTrain, Hold, getFortifyTargets, getDemolishTargets, Move, Fire } from './command';
import { gameMap } from './assets/json';

const testGetNeiboursAtRange = (scene: Scene, map: GameMap, tile: Tile, range: number): void => {
  getNeighborsAtRange(map, tile, range).forEach(t => {
    const tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });
};

const testCreateUnit = (scene: Scene, gameMap: GameMap, coords: Point, unit: Unit, owner: Player) => {
  unit.Owner = owner;
  unit.Carrying.Supplies.Value = unit.Cost.Base.Supplies.Value;
  unit.Carrying.Cartridges.Value = unit.Cost.Base.Cartridges.Value;
  unit.Carrying.Shells.Value = unit.Cost.Base.Shells.Value;
  unit.Carrying.Fuel.Value = unit.Cost.Base.Fuel.Value;
  instantiateUnit(scene, coords, unit);
  unit.Coords = coords;
  unit.Status = UnitStatus.Active;
  gameMap.Units.push(unit);
};

const testCreateBuilding = (scene: Scene, gameMap: GameMap, coords: Point, building: Building, owner: Player) => {
  building.Owner = owner;
  instantiateBuilding(scene, coords, building);
  building.CoOrds = coords;
  building.Status = BuildingStatus.Active;
  building.Level = 1;
  gameMap.Buildings.push(building);
};

const testButtonLogic = (gameMap: GameMap, coords: Point, player: Player) => {
  const t = getTile(gameMap, coords);
  if (getBuildTargets(gameMap, t, player)) {
    console.log(`can construct buildings by selecting tile at (${coords.X}, ${coords.Y})`);
  }
  const o = isOccupied(gameMap, coords);
  console.log(`(${coords.X}, ${coords.Y}) is ${o ? '' : 'not '}occupied`);
  if (o) {   
    const u = hasUnit(gameMap, coords);
    console.log(`(${coords.X}, ${coords.Y}) ${u ? 'has' : 'does not have'} unit`);
    const b = hasBuilding(gameMap, coords);
    console.log(`(${coords.X}, ${coords.Y}) ${b ? 'has' : 'does not have'} building`);

    if (u) {
      const unit = getUnitAt(gameMap, t.CoOrds);
      const m = getMoveTargets(gameMap, t, player) !== undefined;
      const f = getFireTargets(gameMap, t, player, (unit as Personnel).PrimaryFirearm) !== undefined;
      const c = canCapture(gameMap, t, player);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${m ? '' : 'not'} move`);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${f ? '' : 'not'} fire`);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${c ? '' : 'not'} capture`);
    } else if (b) {
      const r = canTrain(gameMap, t, player);
      const d = getDeployUnits(gameMap, t, player) !== undefined;
      console.log(`building at (${coords.X}, ${coords.Y}) can${r ? '' : 'not'} train`);
      console.log(`building at (${coords.X}, ${coords.Y}) can${d ? '' : 'not'} deploy`);
    } else {
      console.log(`something went wrong at (${coords.X}, ${coords.Y}): no units or buildings but is occupied.`);
    }
  } else {
    console.log(`(${coords.X}, ${coords.Y}) has no units or buildings`);
  }
};

const testCommands = (scene: Scene, data: JsonResourcesType) => {
  const p = data.gameMap.Players[0];
  const c1 = new Fire(data.gameMap, p, new Point(17, 8), new Point(20, 8));
  data.gameMap.Commands.push(c1);
  const c2 = new Move(data.gameMap, p, new Point(18, 8), new Point(20, 10));
  data.gameMap.Commands.push(c2);
};

const executeTests = (scene: Scene, data: JsonResourcesType) => {
  const p = data.gameMap.Players[0];
  const a = data.gameMap.Players[1];
  const u = new Infantry(data.unitData.PersonnelData['infantry']);
  testCreateUnit(scene, data.gameMap, new Point(47, 77), u, p);
  u.PrimaryFirearm = data.customData.FirearmData[u.DefaultPrimary.toLowerCase()];
  const u1 = new Support(data.unitData.PersonnelData['support']);
  testCreateUnit(scene, data.gameMap, new Point(18, 8), u1, p);
  u1.PrimaryFirearm = data.customData.FirearmData[u1.DefaultPrimary.toLowerCase()];
  const u2 = new Infantry(data.unitData.PersonnelData['infantry']);
  testCreateUnit(scene, data.gameMap, new Point(20, 8), u2, a);
  u2.PrimaryFirearm = data.customData.FirearmData[u2.DefaultPrimary.toLowerCase()];
  const b1 = new Barracks(data.buildingData.UnitBuildingData['barracks']);
  //testCreateBuilding(scene, data.gameMap, new Point(19, 8), b1, p);
  //testCommands(scene, data);
};

export {
  testGetNeiboursAtRange,
  testCreateBuilding,
  testCreateUnit,
  testButtonLogic,
  testCommands,
  executeTests
};
