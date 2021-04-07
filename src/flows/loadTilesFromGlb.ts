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
  InvalidArgumentException,
} from '../utils';
import {
  // infantries,
  // militias
  meshes,
  textures,
  suburbs,
  cities,
  metropolises
} from '../resources';
import { Cities, GameMap, Tile, TileType } from '../props';
import { PlayerColor } from '../player';
import { Point, pointEquals } from '../attr';
import { getCityAt } from './phases';

interface LoadTilesGlbInputTypes {
  scene: Scene;
  gameMap: GameMap;
}

let hexScreenSize: Vector3;

const getTileTexture = (tile: Tile): Texture => {
  let type = TileType[tile.Type].toLowerCase();
  return textures[type];
};

const getCitiesTextures = (type: TileType): { [k: string]: Texture } => {
  switch (type) {
    case TileType.SUBURB:
      return suburbs;
    case TileType.CITY:
      return cities;
    case TileType.METROPOLIS:
      return metropolises;
    default:
      throw new InvalidArgumentException('tile.Type', type);
  }
};

const getCitiesTexturesWithColor = (city: Cities): Texture => {
  let type = TileType[city.Type].toLowerCase();
  let color = PlayerColor[city.Owner.Color].toLowerCase();
  return getCitiesTextures(city.Type)[`${type}_${color}`];
};

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

  const setMeshChildPosition = (child: Object3D, y: number, x: number) => {
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
      childCenter[2]
    );

    // markChildVertices(childCenter);
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

      let t = gameMap.Tiles[x][y];
      let c = getCityAt(gameMap, new Point(x, y));
      let tex: Texture = c !== undefined
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
    loader.load('./assets/raw.glb', glbOnLoad(y, x, gameMap), undefined, consoleError);
  };

  range(GameMap.Width).forEach(x => {
    range(GameMap.Height).forEach(y => {
      loadGlbForEachRowAndColumn(y, x, gameMap);
    });
  });
};

export {
  loadTilesGlb,
  hexScreenSize,
  getCitiesTexturesWithColor,
  getTileTexture
};
