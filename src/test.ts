import { Scene, Mesh } from 'three';
import { getNeighborsAtRange, getMesh } from './flows';
import {GameMap, Tile} from './props/tiles';
import { meshes } from './resources';

let nei: Tile[] = [];
const testGetNeiboursAtRange = (scene: Scene, map: GameMap, tile: Tile, range: number) => {
  nei = getNeighborsAtRange(map, tile, range);
  nei.forEach(t => {
    let tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });
}

export {testGetNeiboursAtRange}
