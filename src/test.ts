import { Scene } from 'three';
import { getNeighborsAtRange, getMesh, instantiateBuilding } from './utils';
import { GameMap, Tile } from './props/tiles';
import { meshes } from './resources';
import { Barracks } from './props/buildings';
import { BuildingData } from './props';
import { Point } from './attr';

const testGetNeiboursAtRange = (scene: Scene, map: GameMap, tile: Tile, range: number): void => {
  getNeighborsAtRange(map, tile, range).forEach(t => {
    const tile = getMesh(scene, t);
    tile.material[2] = meshes.available;
  });
};

const testCreateBuilding = (scene: Scene, gameMap: GameMap, buildingData: BuildingData) => {
  let b = new Barracks(buildingData.UnitBuildingData[0]);
  b.Owner = gameMap.Players[0];
  instantiateBuilding(scene, new Point(17, 8), b);
  b.CoOrds = new Point(17, 8);
  gameMap.Buildings.push(b);
};

export { testGetNeiboursAtRange };
