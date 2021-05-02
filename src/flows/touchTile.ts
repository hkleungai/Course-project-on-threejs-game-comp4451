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

interface TouchTileInputType {
  camera: Camera;
  scene: Scene;
  moveMouse: Vector3;
}

const touchTile = ({
  camera,
  scene: { children },
  moveMouse,
}: TouchTileInputType): void => {
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
    if (currentTile.material[2] !== meshes.available) {
      currentTile.material[2] = meshes.blank;
    }
  }
  if (newTile.material[2] !== meshes.available) {
    newTile.material[2] = meshes.select;
  }
  currentTile = newTile;
};

export { touchTile };
