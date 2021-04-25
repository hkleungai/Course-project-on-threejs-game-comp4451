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
import { highlightTile } from './';
import {
  parseMeshnameToCoords,
  getTile,
  getMesh,
  getUnitAt,
  getNeighbors,
  getBuildingAt,
  Direction,
  makeActionButtonAvailable
} from '../utils';
import { GameMap } from '../props';
import { Point } from '../attr';
import {
  canMove,
  canFire,
  canSabotage,
  canCapture,
  canTrain,
  canDeploy,
  canBuild,
  canFortify,
  canDemolish
} from '../command';

let highlight: Points<BufferGeometry, PointsMaterial>;
let currentTile: Object3D;
let currentCoOrds: Point = new Point(17, 7);

interface SelectTileInputType {
  camera: Camera;
  gameMap: GameMap;
  direction: Direction,
  scene: Scene;
}

const selectTile = ({
  camera,
  gameMap,
  direction,
  scene,
}: SelectTileInputType): void => {
  const t = getNeighbors(gameMap, currentCoOrds, false, false)[direction];
  if (t === undefined) {
    return;
  }
  const newTile = getMesh(scene, t);
  currentCoOrds = t.CoOrds;

  // Clean up old tile (if any)
  highlight && scene.remove(highlight);
  if (currentTile?.name) {
    const coords = new Point(...parseMeshnameToCoords(currentTile.name));
    const tileObject = getTile(gameMap, coords);
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
  const tileObject = getTile(gameMap, coords);
  // reset all to unavailable
  document.querySelectorAll('.action-sublist').forEach(n => 
    Array.from(n.children).forEach(e => {
      if (!e.classList.contains('unavailable-action')) {
        e.classList.toggle('unavailable-action');
      }
    }
  ));
  const player = gameMap.Players[0]; // use human player first so far, change later
  const unit = getUnitAt(gameMap, coords);
  if (unit !== undefined) {
    makeActionButtonAvailable('hold');
    canMove(gameMap, tileObject, player) && makeActionButtonAvailable('move');
    canCapture(gameMap, tileObject, player) && makeActionButtonAvailable('capture');
  }

  const building = getBuildingAt(gameMap, coords);
  if (building !== undefined) {
    makeActionButtonAvailable('fortify');
    makeActionButtonAvailable('demolish');
    if (canTrain(gameMap, tileObject, player)) {
      makeActionButtonAvailable('train');
      canDeploy(gameMap, tileObject, player) && makeActionButtonAvailable('deploy');
    }
  }

  if (true) {
    const availableavailableActionDivs = document.querySelectorAll("[class*=available-action]");
    availableavailableActionDivs.forEach((availableActionDiv: HTMLElement) => {
      // eslint-disable-next-line no-alert
      availableActionDiv.onclick = () => alert('This tile does not contain a valid unit. Try another one!');
    });
    // Maybe toggle some actions and change the actions' availability
    const unavailableavailableActionDivs = document.querySelectorAll("[class*=unavailable-action]");
    unavailableavailableActionDivs.forEach((unavailableActionDiv: HTMLElement) => {
      // eslint-disable-next-line no-alert
      unavailableActionDiv.onclick = () => alert('This action is not available');
    });
  }
};

export { selectTile };
