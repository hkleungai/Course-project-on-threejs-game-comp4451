import { Scene } from 'three';
import { getNeighborsAtRange, getMesh } from './utils';
import { GameMap, Tile } from './props/tiles';
import { meshes } from './resources';

const testGetNeiboursAtRange = (scene: Scene, map: GameMap, tile: Tile, range: number): void => {
  getNeighborsAtRange(map, tile, range).forEach(t => {
    const tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });
};

export { testGetNeiboursAtRange };
