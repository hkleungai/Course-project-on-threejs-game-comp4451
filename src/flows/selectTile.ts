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
  makeTrainButtonAvailable
} from '../utils';
import { GameMap, Tile } from '../props';
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
} from '../command';
import { unhighlightTargets } from './highlightTile';
import { meshes } from '../resources';
import { Personnel, Unit } from '../props/units';
import { JsonResourcesType } from './loadResourcesFromJsons';

type TargetType = 'none' | 'move' | 'fire' | 'build' | 'fortify' | 'demolish' | 'deploy';

let highlight: Points<BufferGeometry, PointsMaterial>;
let currentTile: Object3D;
let currentCoOrds: Point = new Point(17, 7);
let source: Tile;
let targetType: TargetType = 'none';
let targetName: string;

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
  //#region helper functions
  const selectTarget = (type: TargetType, unit?: Unit) => {
    let targets: Tile[] = [];
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
      case 'deploy':
        targets = getDeployTargets(data.gameMap, tileObject, player);
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
        return new Deploy(data.gameMap, player, source.CoOrds, tileObject.CoOrds, data.customData);
      case 'build':
        return new Build(data.gameMap, player, source.CoOrds, tileObject.CoOrds, data.buildingData[target_name]);
      case 'fortify':
        return new Fortify(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
      case 'demolish':
        return new Demolish(data.gameMap, player, source.CoOrds, tileObject.CoOrds);
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
  
  const player = data.gameMap.Players[0]; // for AI player just get all available commands to choose from, for each unit
  if (confirmSelection && source !== undefined) {
    if ((currentTile as Mesh).material[2] === meshes.available) {
      console.log(source.CoOrds);
      console.log(getUnitAt(data.gameMap, source.CoOrds));
      addCommand(data.gameMap, getUnitAt(data.gameMap, source.CoOrds), getCommand(targetType, targetName));
      unhighlightTargets(scene, getMoveTargets(data.gameMap, source, player));
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
    getBuildTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('construct');
    canCapture(data.gameMap, tileObject, player) && makeActionButtonAvailable('capture');
  }

  const building = getBuildingAt(data.gameMap, coords);
  if (building !== undefined) {
    getFortifyTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('fortify');
    getDemolishTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('demolish');
    if (canTrain(data.gameMap, tileObject, player)) {
      makeActionButtonAvailable('train');
      getTrainUnits(player, data.unitData).forEach(u => 
        makeTrainButtonAvailable(u.Name.toLowerCase())
      );
    }
    getDeployUnits(data.gameMap, tileObject, player) && getDeployTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('deploy');
  }

  const cities = getCityAt(data.gameMap, coords);
  if (cities !== undefined && cities.Owner === player) {
    getBuildTargets(data.gameMap, tileObject, player) && makeActionButtonAvailable('construct');
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
      switch (e.className) {
        case 'train':
          Array.from(e.children).forEach((ee: HTMLElement) => {
            ee.onclick = () => 
              addRepeatableCommand(data.gameMap, 
                         new Train(data.gameMap, 
                                   player,
                                   tileObject.CoOrds,
                                   tileObject.CoOrds,
                                   Object.assign(
                                     {},
                                     data.unitData.PersonnelData[ee.className]
                                    )
                                  )
                                  );
          });
          break;
        case 'build':
          Array.from(e.children).forEach((ee: HTMLElement) => {
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
          // TODO
          break;
      }
    });
  }
};

export { selectTile };
