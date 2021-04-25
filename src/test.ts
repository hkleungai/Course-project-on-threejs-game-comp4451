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
  isOccupied
} from './utils';
import { GameMap, Tile } from './props/tiles';
import { meshes } from './resources';
import { Barracks, Building } from './props/buildings';
import { BuildingData, UnitData } from './props';
import { Point } from './attr';
import { Infantry, Personnel, Unit } from './props/units';
import { Player } from './player';
import { JsonResourcesType } from './flows';
import { canBuild, canCapture, canDeploy, canFire, canMove, canTrain, Hold } from './command';
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
  gameMap.Units.push(unit);
};

const testCreateBuilding = (scene: Scene, gameMap: GameMap, coords: Point, building: Building, owner: Player) => {
  building.Owner = owner;
  instantiateBuilding(scene, coords, building);
  building.CoOrds = coords;
  gameMap.Buildings.push(building);
};

const testButtonLogic = (gameMap: GameMap, coords: Point, player: Player) => {
  const t = getTile(gameMap, coords);
  if (canBuild(gameMap, t, player)) {
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
      const m = canMove(gameMap, t, player);
      const f = canFire(gameMap, t, player, (unit as Personnel).PrimaryFirearm);
      const c = canCapture(gameMap, t, player);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${m ? '' : 'not'} move`);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${f ? '' : 'not'} fire`);
      console.log(`unit at (${coords.X}, ${coords.Y}) can${c ? '' : 'not'} capture`);
    } else if (b) {
      const r = canTrain(gameMap, t, player);
      const d = canDeploy(gameMap, t, player);
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
  data.gameMap.Commands.push(new Hold(data.gameMap, p, new Point(17, 8), new Point(17, 8)))
};

const executeTests = (scene: Scene, data: JsonResourcesType) => {
  const p = data.gameMap.Players[0];
  testCreateUnit(scene, data.gameMap, new Point(17, 8), new Infantry(data.unitData.PersonnelData['infantry']), p);
  testCreateBuilding(scene, data.gameMap, new Point(18, 7), new Barracks(data.buildingData.UnitBuildingData[0]), p);
  getNeighbors(data.gameMap, new Point(17, 7)).forEach(n => {
    testButtonLogic(data.gameMap, n.CoOrds, p);
  });
  testButtonLogic(data.gameMap, new Point(17, 7), p);
};

export {
  testGetNeiboursAtRange,
  testCreateBuilding,
  testCreateUnit,
  testButtonLogic,
  testCommands,
  executeTests
};
