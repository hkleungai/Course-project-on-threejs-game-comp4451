import {
  Box3,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Scene,
  Texture,
  Vector3,
  Vector3Tuple,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {
  range,
  sinDeg,
  cosDeg,
  getCityAt,
  getTileTexture,
  getCitiesTexturesWithColor,
} from '../utils';
import { meshes } from '../resources';
import { GameMap } from '../props';
import { Point } from '../attr';

interface LoadTilesFromGlbInputTypes {
  scene: Scene;
  gameMap?: GameMap;
}

const loadTilesFromGlb = ({ scene, gameMap }: LoadTilesFromGlbInputTypes): void => {
  if (gameMap === undefined) {
    return;
  }

  const loader = new GLTFLoader();
  const unit: { x?: number, y?: number } = {};

  const setMeshChildPosition = (child: Object3D, y: number, x: number) => {
    if (unit.x === undefined || unit.y === undefined) {
      const box = new Box3().setFromObject(child);
      const dummyVector = new Vector3();
      GameMap.HexScreenSize = box.getSize(dummyVector);
      unit.x = box.getSize(dummyVector).x;
      unit.y = box.getSize(dummyVector).y;
    }

    const childCenter: Vector3Tuple = [
      unit.y * x * cosDeg(30),
      unit.x * cosDeg(30) * y + ((x % 2) * unit.x * sinDeg(60) / 2),
      0
    ];

    child.position.set(
      childCenter[0],
      childCenter[1],
      childCenter[2]
    );
  };

  const traverseGlbScene = (
    y: number,
    x: number,
    gameMap: GameMap,
  ) => (child: Object3D) => {
    const tilename = `(${x}, ${y})`;
    const meshname = `${tilename}_${Date.now().toString()}`;
    gameMap.Tiles[x][y].Name = tilename;
    gameMap.Tiles[x][y].MeshName = meshname;

    if (child instanceof Mesh && child.isMesh) {
      setMeshChildPosition(child, y, x);

      child.geometry.clearGroups();
      range(3).forEach(materialIndex => {
        child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
      });

      const t = gameMap.Tiles[x][y];
      const c = getCityAt(gameMap, new Point(x, y));
      const tex: Texture = c !== undefined
        ? getCitiesTexturesWithColor(c)
        : getTileTexture(t);
      child.material = [
        meshes.plains,
        new MeshBasicMaterial({ map: tex, transparent: true }),
        meshes.blank
      ].filter(Boolean);

      child.name = meshname;
      scene.add(child);
    }
  };

  const glbOnLoad = (
    y: number,
    x: number,
    gameMap: GameMap
  ) => ({ scene }: GLTF) => {
    scene.traverse(traverseGlbScene(y, x, gameMap));
  };

  const loadGlbForEachRowAndColumn = (y: number, x: number, gameMap: GameMap) => {
    const { error: consoleError } = console;
    loader.load('./assets/background.glb', glbOnLoad(y, x, gameMap), undefined, consoleError);
  };

  range(GameMap.Width).forEach(x => {
    range(GameMap.Height).forEach(y => {
      loadGlbForEachRowAndColumn(y, x, gameMap);
    });
  });
};

export { loadTilesFromGlb };
