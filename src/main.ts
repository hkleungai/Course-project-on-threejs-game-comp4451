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
  touchTileViaRaycaster,
  loadGameMapFromJson,
  listenOnKeyboardEvent,
  instantiateUnit,
  removeDestroyed
} from './flows';

import './style.scss';
import {
  GameMap,
  TileData,
  BuildingData,
  CustomizableData,
  UnitData
} from './props';
import {testGetNeiboursAtRange} from './test';
import { Point } from './attr';
import { Infantry, Personnel, UnitStatus } from './props/units';
import { PlayerColor, Player } from './player';

let scene = new Scene();
scene.background = new Color(0x000000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 30, 10);
camera.lookAt(20, 30, 0);
camera.matrixAutoUpdate = true;

let gameMap: GameMap = loadGameMapFromJson();
let tileData: TileData = loadTileDataFromJson();
let buildingData: BuildingData = loadBuildingDataFromJson();
let customizableData: CustomizableData = loadCustomizableDataFromJson();
let unitData: UnitData = loadUnitDataFromJson();

loadTilesGlb({ scene, gameMap });

const moveMouse = new Vector3(Infinity, Infinity, 0);
const rightClickMouse = new Vector3(Infinity, Infinity, 0);
listenOnMouseEvent({ mouse: moveMouse, action: 'mousemove' });
listenOnMouseEvent({ mouse: rightClickMouse, action: 'contextmenu', shouldPreventDefault: true });
onWindowResize({ camera, renderer });
listenOnKeyboardEvent({ camera });

let test: Infantry = new Infantry(unitData.PersonnelData['infantry']);
test.Owner = new Player({Name: 'abc', Color: PlayerColor.RED});
instantiateUnit(scene, new Point(20, 20), test);
gameMap.Units.push(test);

const gui: GUI = new GUI({ autoPlace: false });
const guiContainer: HTMLElement = document.querySelector('.gui-container');
guiContainer.appendChild(gui.domElement);

const render = () => {
  window.requestAnimationFrame(render);
  touchTileViaRaycaster({ camera, scene, moveMouse });
  drawTileStatistics({ camera, scene, rightClickMouse, gui, guiContainer });
  renderer.render(scene, camera);
  // testGetNeiboursAtRange(scene, gameMap, gameMap.Tiles[17][10], 1);
};
render();
