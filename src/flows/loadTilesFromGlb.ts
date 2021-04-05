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
let hexScreenSize: Vector3;

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

  const setMeshChildPosition = (child: Object3D, y: number, x: number, flag: loadFlag) => {
    if (unit.x === undefined || unit.y === undefined) {
      const box = new Box3().setFromObject(child);
      const dummyVector = new Vector3();
      hexScreenSize = box.getSize(dummyVector);
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
      childCenter[2] + +(flag !== 'tile') * 0.1
    );

    // markChildVertices(childCenter);
  };

  const traverseGlbScene = (
    y: number,
    x: number,
    entries: [string, Texture][],
    flag: loadFlag,
    gameMap?: GameMap,
  ) => (child: Object3D) => {
    if (child instanceof Mesh && child.isMesh) {
      setMeshChildPosition(child, y, x, flag);

      child.geometry.clearGroups();
      range(flag === 'tile' ? 3 : 2).forEach(materialIndex => {
        child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
      });
      const [name, map] = gameMap === undefined
        ? entries[randint(entries.length)]
        : entries[gameMap.Tiles[x][y].Type];
      child.material = [
        flag === 'tile' ? meshes.plains : undefined,
        new MeshBasicMaterial({ name, map, transparent: true }),
        meshes.blank
      ].filter(Boolean);

      child.name = `(${x}, ${y})`;
      if (gameMap !== undefined) {
        gameMap.Tiles[x][y].Mesh = child;       
      }
      scene.add(child);
    }
  };

  const glbOnLoad = (
    y: number,
    x: number,
    entries: [string, Texture][],
    flag: loadFlag,
    gameMap?: GameMap
  ) => ({ scene }: GLTF) => {
    scene.traverse(traverseGlbScene(y, x, entries, flag, gameMap));
  };

  const loadGlbForEachRowAndColumn = (y: number, x: number, gameMap?: GameMap) => {
    const { error: consoleError } = console;
    loader.load('./assets/raw.glb', glbOnLoad(y, x, texturesEntries, 'tile', gameMap), undefined, consoleError);
  };

  range(GameMap.Width).forEach(x => {
    range(GameMap.Height).forEach(y => {
      loadGlbForEachRowAndColumn(y, x, gameMap);
    });
  });
};

export { loadTilesGlb, hexScreenSize };
