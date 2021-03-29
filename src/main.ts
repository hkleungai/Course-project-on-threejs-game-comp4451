import {
  Color,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

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
  touchTileViaRaycaster,
  loadGameMapFromJson,
  listenOnKeyboardEvent
} from './flows';

import './style.scss';
import { GameMap } from './props';

const scene = new Scene();
scene.background = new Color(0x000000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', () => { renderer.render(scene, camera); });

const gameMap: GameMap = loadGameMapFromJson();
loadTileDataFromJson();
loadBuildingDataFromJson();
loadCustomizableDataFromJson();
loadUnitDataFromJson();

loadTilesGlb({ scene, gameMap });

const moveMouse = new Vector3(Infinity, Infinity, 0);
const rightClickMouse = new Vector3(Infinity, Infinity, 0);
listenOnMouseEvent({ mouse: moveMouse, action: 'mousemove' });
listenOnMouseEvent({ mouse: rightClickMouse, action: 'contextmenu', shouldPreventDefault: true });
onWindowResize({ camera, renderer });
listenOnKeyboardEvent({ camera });

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
