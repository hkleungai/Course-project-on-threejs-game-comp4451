import {
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  sRGBEncoding,
} from 'three';

import {
  drawTileStatistics,
  loadTilesGlb,
  loadTileDataFromJson,
  onWindowResize,
} from './flows';

import './style.scss';

const scene = new Scene();
scene.background = new Color(0x000000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const render = () => {
  window.requestAnimationFrame(render);
  renderer.render(scene, camera);
};
render();

const tileChildrenEntries = {};
loadTilesGlb({ scene, tileChildrenEntries });
loadTileDataFromJson();
onWindowResize({ camera, renderer });
drawTileStatistics({ camera, scene, tileChildrenEntries });
