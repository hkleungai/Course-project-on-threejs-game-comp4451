import {
  Camera,
  Mesh,
  Raycaster,
  Scene,
  Vector3
} from 'three';
import { meshes } from '../resources';

let currentTile: Mesh;
const raycaster = new Raycaster();

interface TouchTileViaRaycasterInputType {
  camera: Camera;
  scene: Scene;
  moveMouse: Vector3;
}

const touchTileViaRaycaster = ({
  camera,
  scene: { children },
  moveMouse,
}: TouchTileViaRaycasterInputType): void => {
  raycaster.setFromCamera(moveMouse, camera);

  const newTile = (
    raycaster.intersectObjects(children)
      .map(({ object }) => object)
      .find(child => child instanceof Mesh && child.isMesh)
  ) as Mesh;

  if (newTile === undefined && currentTile !== undefined) {
    currentTile.material[2] = meshes.blank;
    currentTile = undefined;
  }
  if (newTile === currentTile) {
    return;
  }
  if (currentTile) {
    currentTile.material[2] = meshes.blank;
  }
  newTile.material[2] = meshes.select;
  currentTile = newTile;
};

export { touchTileViaRaycaster };
