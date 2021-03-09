import {
  Box3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene,
  Vector3,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {
  randint,
  range,
  sinDeg,
  cosDeg,
} from '../utils';
import { textures } from '../resources';

interface LoadTilesGlbInputTypes {
  scene: Scene;
  tileChildrenEntries: { [key: string]: { [innerKey: string]: number } };
}

const loadTilesGlb = ({
  scene, tileChildrenEntries
}: LoadTilesGlbInputTypes): void => {
  // A 'simple' zig-zag layout
  const loader = new GLTFLoader();
  const texturesEntries = Object.entries(textures);
  const initialPosition = new Vector3(-21, 8.5);
  const unit: { x?: number, y?: number } = {};

  const setUnit = (child: Object3D) => {
    if (unit.x === undefined || unit.y === undefined) {
      const box = new Box3().setFromObject(child);
      const dummyVector = new Vector3();
      unit.x = box.getSize(dummyVector).x;
      unit.y = box.getSize(dummyVector).y;
    }
  };

  const traverseGlbScene = (row: number, column: number) => (child: Object3D) => {
    if (child instanceof Mesh && child.isMesh) {
      setUnit(child);

      child.geometry.clearGroups();
      range(3).forEach(materialIndex => {
        child.geometry.addGroup(0, Infinity, materialIndex);
      });

      child.material = [
        new MeshBasicMaterial({
          map: textures.plains,
          transparent: true
        }),
        new MeshBasicMaterial({
          map: texturesEntries[randint(texturesEntries.length)][1],
          transparent: true
        })
      ];

      child.position.set(
        initialPosition.x + unit.y * column * cosDeg(30),
        initialPosition.y - unit.x * cosDeg(30) * row - ((column % 2) * unit.x * sinDeg(60) / 2),
        initialPosition.z
      );

      scene.add(child);

      tileChildrenEntries[
        `${child.position.x}, ${child.position.y}`
      ] = { row, column };
    }
  };

  const glbOnLoad = (row: number, column: number) => ({ scene }: GLTF) => {
    scene.traverse(traverseGlbScene(row, column));
  };

  const loadGlbForEachRowAndColumn = (row: number, column: number) => {
    // eslint-disable-next-line no-console
    loader.load('./assets/raw.glb', glbOnLoad(row, column), undefined, console.error);
  };

  range(25).forEach(column => {
    range(10).forEach(row => {
      loadGlbForEachRowAndColumn(row, column);
    });
  });
};

export { loadTilesGlb };