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
import { textures, meshes, infantries, militias } from '../resources';

interface LoadTilesGlbInputTypes {
  scene: Scene;
}

type loadFlag = 'tile' | 'unit' | 'building';

const loadTilesGlb = ({ scene }: LoadTilesGlbInputTypes): void => {
  // A 'simple' zig-zag layout
  const loader = new GLTFLoader();
  const texturesEntries = Object.entries(textures);
  const infantryEntries = Object.entries(infantries);
  const militiaEntries = Object.entries(militias);
  const unit: { x?: number, y?: number } = {};

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
    flag: loadFlag
  ) => (child: Object3D) => {
    if (child instanceof Mesh && child.isMesh) {
      setMeshChildPosition(child, row, column, flag);

      child.geometry.clearGroups();
      range(flag === 'tile' ? 3 : 2).forEach(materialIndex => {
        child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
      });

      const [name, map] = entries[randint(entries.length)];
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
    flag: loadFlag
  ) => ({ scene }: GLTF) => {
    scene.traverse(traverseGlbScene(row, column, entries, flag));
  };

  const loadGlbForEachRowAndColumn = (row: number, column: number) => {
    const bias = (row + column) % 6;
    const { error: consoleError } = console;
    loader.load('./assets/raw.glb', glbOnLoad(row, column, texturesEntries, 'tile'), undefined, consoleError);
    bias === 1 && loader.load('./assets/units/militia.glb', glbOnLoad(row, column, militiaEntries, 'unit'), undefined, consoleError);
    bias === 4 && loader.load('./assets/units/infantry.glb', glbOnLoad(row, column, infantryEntries, 'unit'), undefined, consoleError);
  };

  range(25).forEach(column => {
    range(10).forEach(row => {
      loadGlbForEachRowAndColumn(row, column);
    });
  });
};

export { loadTilesGlb };
