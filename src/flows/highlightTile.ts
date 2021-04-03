import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  Scene,
  Vector3Tuple,
} from 'three';
import { Hexagon } from '../utils';

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

export { highlightTile };
