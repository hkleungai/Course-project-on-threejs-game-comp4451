import './assets/scss/main.scss';
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
  addWindowEventListeners,
  applyCssChangesOnGameStart,
  drawTileStatistics,
  loadTilesFromGlb,
  loadResourcesFromJsons,
  touchTile,
  selectTile,
} from './flows';
import {
  GameMap,
} from './props';
// import {testGetNeiboursAtRange} from './test';
// import { Point } from './attr';
// import { Infantry, Personnel, UnitStatus } from './props/units';
// import { PlayerColor, Player } from './player';

const scene = new Scene();
scene.background = new Color(0x000000);

const renderer = new WebGLRenderer({ antialias: true });
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 30, 10);
camera.lookAt(20, 30, 0);
camera.matrixAutoUpdate = true;

// const gameMap: GameMap = loadGameMapFromJson();
// let tileData: TileData = loadTileDataFromJson();
// let buildingData: BuildingData = loadBuildingDataFromJson();
// let customizableData: CustomizableData = loadCustomizableDataFromJson();
// let unitData: UnitData = loadUnitDataFromJson();

const gameMap: GameMap = loadResourcesFromJsons();
loadTilesFromGlb({ scene, gameMap });

const moveMouse = new Vector3(Infinity, Infinity, 0);
const leftClickMouse = new Vector3(Infinity, Infinity, 0);
const rightClickMouse = new Vector3(Infinity, Infinity, 0);

const gui: GUI = new GUI({ autoPlace: false });
const guiContainer: HTMLElement = document.querySelector('div.gui-container');
guiContainer.appendChild(gui.domElement);

const render = () => {
  window.requestAnimationFrame(render);
  touchTile({ camera, scene, moveMouse });
  selectTile({ camera, scene, leftClickMouse, gameMap });
  drawTileStatistics({ camera, scene, rightClickMouse, gui, guiContainer });
  renderer.render(scene, camera);
  document.querySelector('.canvas-container').appendChild(renderer.domElement);
};

const gameStart = () => {
  const renderWithCssChanges = () => {
    applyCssChangesOnGameStart();
    addWindowEventListeners({
      moveMouse,
      leftClickMouse,
      rightClickMouse,
      camera,
      renderer,
      gameMap,
      scene,
    });
    render();
  };
  setTimeout(renderWithCssChanges, 1500);
};

document.getElementById('gameStart').onclick = gameStart;
