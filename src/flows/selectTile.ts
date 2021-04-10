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
  getNeighborsAtRange,
  getMesh,
  getUnitAt,
  canMove,
  getNeighbors,
  isOccupied,
  canCapture,
  getBuildingAt,
  canDeploy,
  canTrain,
  Direction
} from '../utils';
import { GameMap } from '../props';
import { Point } from '../attr';
import { meshes } from '../resources';
import { UnitBuilding } from '../props/buildings';

let highlight: Points<BufferGeometry, PointsMaterial>;
let currentTile: Object3D;
let currentCoOrds: Point = new Point(17, 7);
//const raycaster = new Raycaster();

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
  let t = getNeighbors(gameMap, currentCoOrds)[direction];
  const newTile = getMesh(scene, t);
  currentCoOrds = t.CoOrds;

  // Clean up old tile (if any)
  highlight && scene.remove(highlight);
  if (currentTile?.name) {
    const coords = new Point(...parseMeshnameToCoords(currentTile.name));
    const tileObject = getTile(gameMap, coords);
    /*
    getNeighborsAtRange(gameMap, tileObject, 1).forEach(t => {
      const tile = getMesh(scene, t);
      tile.material[2] = meshes.blank;
    });
    */
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
  camera.position.set(center[0], center[1], 10);
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

  let u = getUnitAt(gameMap, coords);
  if (u !== undefined) {
    document.querySelector('.unavailable-action.hold').classList.remove('unavailable-action');
    if (canMove(u) && getNeighbors(gameMap, coords).some(n => !isOccupied(gameMap, n.CoOrds))) {
      document.querySelector('.unavailable-action.move').classList.remove('unavailable-action');
    }
    if (canCapture(gameMap, tileObject, u, gameMap.Players[0])) {
      document.querySelector('.unavailable-action.capture').classList.remove('unavailable-action');
    }
  }

  let b = getBuildingAt(gameMap, coords);
  console.log(b);
  if (b !== undefined) {
    document.querySelector('.unavailable-action.fortify').classList.remove('unavailable-action');
    document.querySelector('.unavailable-action.demolish').classList.remove('unavailable-action');
    console.log(b instanceof UnitBuilding);
    if (canTrain(gameMap, tileObject)) {
      document.querySelector('.unavailable-action.train-manufacture').classList.remove('unavailable-action');
      if (canDeploy(gameMap, tileObject)) {
        document.querySelector('.unavailable-action.deploy').classList.remove('unavailable-action');
      }
    }
  }
  /*
  getNeighborsAtRange(gameMap, tileObject, 1).forEach(t => {
    const tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });
  */
  // TODO: Determine if we have units on top of the currently selected one.
  // Now suppose none present.
  // eslint-disable-next-line no-constant-condition


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
