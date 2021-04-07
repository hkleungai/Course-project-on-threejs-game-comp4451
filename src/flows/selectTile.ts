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
import { parseMeshnameToCoords, getTile, getNeighborsAtRange, getMesh } from '../utils';
import { GameMap } from '../props';
import { Point } from '../attr';
import { meshes } from '../resources';

let highlight: Points<BufferGeometry, PointsMaterial>;
let currentTile: Object3D;
const raycaster = new Raycaster();

interface SelectTileInputType {
  camera: Camera;
  gameMap: GameMap;
  leftClickMouse: Vector3;
  scene: Scene;
}

const selectTile = ({
  camera,
  gameMap,
  leftClickMouse,
  scene,
}: SelectTileInputType): void => {
  // Search new-tile
  raycaster.setFromCamera(leftClickMouse, camera);
  const newTile = (
    raycaster.intersectObjects(scene.children)
      .map(({ object }) => object)
      .find(child => child instanceof Mesh && child.isMesh)
  ) as Mesh;
  if (newTile === undefined && currentTile !== undefined) {
    currentTile = undefined;
  }
  if (newTile === currentTile) {
    return;
  }

  // Clean up old tile (if any)
  highlight && scene.remove(highlight);
  if (currentTile?.name) {
    const coords = new Point(...parseMeshnameToCoords(currentTile.name));
    const tileObject = getTile(gameMap, coords);
    getNeighborsAtRange(gameMap, tileObject, 1).forEach(t => {
      const tile = getMesh(scene, t);
      tile.material[2] = meshes.blank;
    });
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

  const coords = new Point(...parseMeshnameToCoords(currentTile.name));
  const tileObject = getTile(gameMap, coords);
  getNeighborsAtRange(gameMap, tileObject, 1).forEach(t => {
    const tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });

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
