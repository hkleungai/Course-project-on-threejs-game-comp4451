import {
  Box3,
  // BufferGeometry,
  // Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  // Points,
  // PointsMaterial,
  Scene,
  Texture,
  Vector3,
  Vector3Tuple,
} from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import {
  // Hexagon,
  randint,
  range,
  sinDeg,
  cosDeg,
} from '../utils';
import {
  // infantries,
  // militias
  meshes,
  textures,
} from '../resources';
import { GameMap } from '../props';

interface LoadTilesGlbInputTypes {
  scene: Scene;
  gameMap: GameMap;
}

type loadFlag = 'tile' | 'unit' | 'building';

const loadTilesGlb = ({ scene, gameMap }: LoadTilesGlbInputTypes): void => {
  const loader = new GLTFLoader();
  const texturesEntries = Object.entries(textures);
  const unit: { x?: number, y?: number } = {};
  // const unit = new Vector3(null, null, null);

  // const markChildVertices = (center: Vector3Tuple) => {
  //   const dotGeometry = new BufferGeometry();
  //   const vertices = new Hexagon({ center, diameterX: unit.x, diameterY: unit.y }).vertices.flat();
  //   dotGeometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
  //   const dotMaterial = new PointsMaterial( { color: 0x888888 , size: 0.5 } );
  //   const dot = new Points( dotGeometry, dotMaterial );
  //   scene.add( dot );
  // };

  const setMeshChildPosition = (child: Object3D, row: number, column: number, flag: loadFlag) => {
    const initialPosition = new Vector3(-21, 8.5);
    if (unit.x === undefined || unit.y === undefined) {
      const box = new Box3().setFromObject(child);
      const dummyVector = new Vector3();
      unit.x = box.getSize(dummyVector).x;
      unit.y = box.getSize(dummyVector).y;
    }

    const childCenter: Vector3Tuple = [
      initialPosition.x + unit.y * column * cosDeg(30),
      initialPosition.y - unit.x * cosDeg(30) * row - ((column % 2) * unit.x * sinDeg(60) / 2),
      initialPosition.z
    ];

    child.position.set(
      childCenter[0],
      childCenter[1],
      childCenter[2] + +(flag !== 'tile') * 0.1
    );

    // markChildVertices(childCenter);
  };

  const traverseGlbScene = (
    row: number,
    column: number,
    entries: [string, Texture][],
    flag: loadFlag,
    gameMap?: GameMap,
  ) => (child: Object3D) => {
    if (child instanceof Mesh && child.isMesh) {
      setMeshChildPosition(child, row, column, flag);

      child.geometry.clearGroups();
      range(flag === 'tile' ? 3 : 2).forEach(materialIndex => {
        child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
      });
      const [name, map] = gameMap === undefined
        ? entries[randint(entries.length)]
        : entries[gameMap.Tiles[column][row].Type];
      child.material = [
        flag === 'tile' ? meshes.plains : undefined,
        new MeshBasicMaterial({ name, map, transparent: true }),
        meshes.blank
      ].filter(Boolean);

      child.name = JSON.stringify({ row, column });

      scene.add(child);
    }
  };

  const glbOnLoad = (
    row: number,
    column: number,
    entries: [string, Texture][],
    flag: loadFlag,
    gameMap?: GameMap
  ) => ({ scene }: GLTF) => {
    scene.traverse(traverseGlbScene(row, column, entries, flag, gameMap));
  };

  const loadGlbForEachRowAndColumn = (row: number, column: number, gameMap?: GameMap) => {
    const { error: consoleError } = console;
    loader.load('./assets/raw.glb', glbOnLoad(row, column, texturesEntries, 'tile', gameMap), undefined, consoleError);
  };

  range(GameMap.Width).forEach(column => {
    range(GameMap.Height).forEach(row => {
      loadGlbForEachRowAndColumn(row, column, gameMap);
    });
  });
};

export { loadTilesGlb };
