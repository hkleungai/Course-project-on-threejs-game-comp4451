import {
  BufferGeometry,
  Camera,
  Object3D,
  Mesh,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  Vector3,
} from 'three';
import { highlightTile, highlightTargets } from './';
import {
  parseMeshnameToCoords,
  getTile,
  getMesh,
  getUnitAt,
  getNeighbors,
  getBuildingAt,
  Direction,
  makeActionButtonAvailable,
  getCityAt,
  makeTrainButtonAvailable,
  makeConstructButtonAvailable,
  makeDeployButtonAvailable
} from '../utils';
import { BuildingData, GameMap, Tile, UnitData } from '../props';
import { Point } from '../attr';
import {
  canCapture,
  canTrain,
  getDeployTargets,
  getDeployUnits,
  getMoveTargets,
  getFortifyTargets,
  getDemolishTargets,
  getBuildTargets,
  addCommand,
  Command,
  Hold,
  Move,
  getFireTargets,
  getTrainUnits,
  Fire,
  Deploy,
  Build,
  Train,
  addRepeatableCommand,
  Capture,
  Fortify,
  Demolish,
  getConstructBuildings,
} from '../command';
import { unhighlightTargets } from './highlightTile';
import { meshes } from '../resources';
import { Assault, Engineer, Infantry, Militia, Mountain, Personnel, Support, Unit } from '../props/units';
import { JsonResourcesType } from './loadResourcesFromJsons';
import { Barracks, Building } from '../props/buildings';

type TargetType = 'none' | 'move' | 'fire' | 'build' | 'fortify' | 'demolish' | 'deploy';

let highlight: Points<BufferGeometry, PointsMaterial>;
let currentTile: Object3D;
let currentCoOrds: Point = new Point(17, 7);
let source: Tile;
let targetType: TargetType = 'none';
let targetName: string;
let targets: Tile[] = [];

interface SelectTileInputType {
  camera: Camera;
  direction?: Direction,
  scene: Scene;
  confirmSelection?: boolean;
  data: JsonResourcesType
}

const selectTile = ({
  camera,
  direction,
  scene,
  data = undefined,
  confirmSelection = false
}: SelectTileInputType): void => {
  const player = data.gameMap.Players[0]; // for AI player just get all available commands to choose from, for each unit
  //#region helper functions
  const selectTarget = (type: TargetType, unit?: Unit) => {
    targetType = type;
    switch (type) {
      case 'move':
        targets = getMoveTargets(data.gameMap, tileObject, player);
        break;
      case 'fire':
        targets = getFireTargets(data.gameMap, tileObject, player, (unit as Personnel).PrimaryFirearm)
        .map(t => getTile(data.gameMap, t.Coords));
        break;
      case 'build':
        targets = getBuildTargets(data.gameMap, tileObject, player);
        break;
      case 'fortify':
        targets = getFortifyTargets(data.gameMap, tileObject, player).map(b => getTile(data.gameMap, b.CoOrds));
        break;
      case 'demolish':
        targets = getDemolishTargets(data.gameMap, tileObject, player).map(b => getTile(data.gameMap, b.CoOrds));
        break;
      case 'deploy':
        targets = getDeployTargets(data.gameMap, tileObject, player);
        break;
    }
    if (source === undefined) {
      highlightTargets(scene, targets);
      source = tileObject;
      alert('Please select a target');
    }
  };
  const getCommand = (type: TargetType, target_name?: string): Command => {
    switch (type) {
      case 'move':
        return new Move(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
      case 'fire':
        return new Fire(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
      case 'deploy':
        return new Deploy(scene, data.gameMap, player, source.CoOrds, tileObject.CoOrds, data.customData, target_name);
      case 'build':
        return new Build(scene, data.gameMap, player, source.CoOrds, tileObject.CoOrds, getBuildingFromName(target_name, data.buildingData));
      case 'fortify':
        return new Fortify(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
      case 'demolish':
        return new Demolish(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
    }
  };
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
  const getBuildingFromName = (name: string, data: BuildingData): Building => {
    switch (name) {
      case 'barracks':
        return new Barracks(data.UnitBuildingData[name]);
    }
  };
  //#endregion
  const t = getNeighbors(data.gameMap, currentCoOrds, false, false)[direction] ?? getTile(data.gameMap, currentCoOrds);
  const newTile = getMesh(scene, t);
  currentCoOrds = t.CoOrds;

  // Clean up old tile (if any)
  highlight && scene.remove(highlight);
  if (currentTile?.name) {
    const coords = new Point(...parseMeshnameToCoords(currentTile.name));
    const tileObject = getTile(data.gameMap, coords);
  }

  // Do something on current tile
  currentTile = newTile;

  const center = currentTile.position.toArray();
  highlight = highlightTile({
    center,
    diameterX: GameMap.HexScreenSize.x,
    diameterY: GameMap.HexScreenSize.y,
    scene
  });
  // focus camera on selected tile
  camera.position.set(center[0], center[1], camera.position.z);
  camera.lookAt(center[0], center[1], 0);

  const coords = new Point(...parseMeshnameToCoords(currentTile.name));
  const tileObject = getTile(data.gameMap, coords);

  //#region reset all to unavailable
  document.querySelectorAll('.action-sublist').forEach(n => 
    Array.from(n.children).forEach(e => {
      if (!e.classList.contains('unavailable-action')) {
        e.classList.toggle('unavailable-action');
      }
    }
  ));
  document.querySelectorAll('.train-list').forEach(n => 
    Array.from(n.children).forEach(e => {
      if (!e.classList.contains('unavailable-action')) {
        e.classList.toggle('unavailable-action');
      }
    }
  ));
  //#endregion
  
  if (confirmSelection && source !== undefined) {
    if ((currentTile as Mesh).material[2] === meshes.available) {
      const c = getCommand(targetType, targetName);
      if (c instanceof Build || c instanceof Deploy) {
        addRepeatableCommand(data.gameMap, c);
      } else {
        addCommand(data.gameMap, getUnitAt(data.gameMap, source.CoOrds), c);
      }
      unhighlightTargets(scene, targets);
      source = undefined;
      confirmSelection = false;
      targetType = 'none';
    } else {
      alert('Not a valid target');
      return;
    }
  }
  
  const unit = getUnitAt(data.gameMap, coords);
  if (unit !== undefined && unit.Owner === player) {
    makeActionButtonAvailable('hold');
    getMoveTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('move');
    if (getBuildTargets(data.gameMap, tileObject, player)) {
      makeActionButtonAvailable('construct');
      getBuildTargets(data.gameMap, tileObject, player) && getConstructBuildings(player, data.buildingData).forEach(b =>
        makeConstructButtonAvailable(b.Name.toLowerCase())
      );
    }
    getFortifyTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('fortify');
    getDemolishTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('demolish');
    canCapture(data.gameMap, tileObject, player) && makeActionButtonAvailable('capture');
  }

  const building = getBuildingAt(data.gameMap, coords);
  if (building !== undefined) {
    if (canTrain(data.gameMap, tileObject, player)) {
      makeActionButtonAvailable('train');
      getTrainUnits(player, data.unitData).forEach(u => 
        makeTrainButtonAvailable(u.Name.toLowerCase())
      );
      if (getDeployUnits(data.gameMap, tileObject, player)) {
        makeActionButtonAvailable('deploy');
        getDeployUnits(data.gameMap, tileObject, player).forEach(u => 
          makeDeployButtonAvailable(u.Name.toLowerCase()))
      }
    }
  }

  const cities = getCityAt(data.gameMap, coords);
  if (cities !== undefined && cities.Owner === player) {
    getBuildTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('construct');
    getConstructBuildings(player, data.buildingData).forEach(b =>
      makeConstructButtonAvailable(b.Name.toLowerCase())
    );
  }

  if (true) {
    Array.from(document.querySelectorAll(`ul.action-sublist`)[0].children).forEach((e: HTMLElement) => {
      switch (e.className) {
        case 'hold':
          e.onclick = () => addCommand(data.gameMap, unit, new Hold(data.gameMap, player, tileObject.CoOrds, tileObject.CoOrds));
          break;
        case 'move':
          e.onclick = () => selectTarget('move');
          break;
        case 'fire':
          e.onclick = () => selectTarget('fire');
          break;
        case 'capture':
          e.onclick = () => addCommand(data.gameMap, unit, new Capture(data.gameMap, player, tileObject.CoOrds, tileObject.CoOrds));
      }
    });
    Array.from(document.querySelectorAll(`ul.action-sublist`)[1].children).forEach((e: HTMLElement) => {
      switch (e.className.replace('with-submenu', '').trim()) {
        case 'train':
          Array.from(document.querySelector(`ul.train-list`).children).forEach((ee: HTMLElement) => {
            ee.onclick = () => 
              addRepeatableCommand(data.gameMap, 
                         new Train(scene,
                                   data.gameMap, 
                                   player,
                                   tileObject.CoOrds,
                                   tileObject.CoOrds,
                                   getUnitFromName(ee.className.toLowerCase(), data.unitData)
                                  )
                                  );
          });
          break;
        case 'construct':
          Array.from(document.querySelector(`ul.building-list`).children).forEach((ee: HTMLElement) => {
            ee.onclick = () => { 
              targetName = ee.className;
              selectTarget('build');
            };
          });
          break;
        case 'fortify':
          e.onclick = () => selectTarget('fortify');
          break;
        case 'demolish':
          e.onclick = () => selectTarget('demolish');
          break;
        case 'deploy':
          Array.from(document.querySelector(`ul.deploy-list`).children).forEach((ee: HTMLElement) => {
            ee.onclick = () => { 
              targetName = ee.className;
              selectTarget('deploy');
            };
          });
          break;
      }
    });
  }
};

export { selectTile };
