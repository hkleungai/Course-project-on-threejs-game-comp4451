import { Scene, Mesh } from 'three';
import { getNeighborsAtRange } from './flows';
import {GameMap, Tile} from './props/tiles';
import { meshes } from './resources';

let nei: Tile[] = [];
const testGetNeiboursAtRange = (scene: Scene, map: GameMap, tile: Tile, range: number) => {
  nei = getNeighborsAtRange(map, tile, range);
  nei.forEach(t => {
    let tile: Mesh = <Mesh>(scene.getObjectByName(`(${t.CoOrds.X}, ${t.CoOrds.Y})`));
    tile.material[2] = meshes.available;
  });
}

export {testGetNeiboursAtRange}
