import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  sRGBEncoding
} from 'three';

import { GUI } from './resources';

import {
  drawTileStatistics,
  loadTilesGlb,
  loadTileDataFromJson,
  loadBuildingDataFromJson,
  loadUnitDataFromJson,
  loadCustomizableDataFromJson,
  onWindowResize,
  listenOnMouseEvent,
  touchTileViaRaycaster
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

loadTileDataFromJson();
loadBuildingDataFromJson();
loadCustomizableDataFromJson();
loadUnitDataFromJson();

loadTilesGlb({ scene });

const moveMouse = new Vector3(Infinity, Infinity, 0);
const rightClickMouse = new Vector3(Infinity, Infinity, 0);
listenOnMouseEvent({ mouse: moveMouse, action: 'mousemove' });
listenOnMouseEvent({ mouse: rightClickMouse, action: 'contextmenu', shouldPreventDefault: true });
onWindowResize({ camera, renderer });

const gui: GUI = new GUI({ autoPlace: false });
const guiContainer: HTMLElement = document.querySelector('.gui-container');
guiContainer.appendChild(gui.domElement);

const render = () => {
  window.requestAnimationFrame(render);
  touchTileViaRaycaster({ camera, scene, moveMouse });
  drawTileStatistics({ camera, scene, rightClickMouse, gui, guiContainer });
  renderer.render(scene, camera);
};
render();
