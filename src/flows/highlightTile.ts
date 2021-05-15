import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
  Vector3Tuple,
} from 'three';
import { Tile } from '../props';
import { meshes } from '../resources';
import { getMesh, Hexagon } from '../utils';

interface HighlightTileInputType {
  center: Vector3Tuple;
  diameterX: number;
  diameterY: number;
  scene: Scene;
}

const highlightTile = ({
  center,
  diameterX,
  diameterY,
  scene,
}: HighlightTileInputType): Points<BufferGeometry, PointsMaterial> => {
  const highlightGeometry = new BufferGeometry();
  const vertices = new Hexagon({ center, diameterX, diameterY }).vertices.flat();
  highlightGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  const highlightMaterial = new PointsMaterial({ color: 0x888888 , size: 0.5 });
  const highlight = new Points(highlightGeometry, highlightMaterial);
  scene.add(highlight);
  return highlight;
};

const highlightTargets = (scene: Scene, tiles: Tile[]) => {
  tiles.forEach(t => getMesh(scene, t).material[2] = meshes.available);
};

const unhighlightTargets = (scene: Scene, tiles: Tile[]) => {
  tiles.forEach(t => getMesh(scene, t).material[2] = meshes.blank);
};

export { highlightTile, highlightTargets, unhighlightTargets };
