import {
  Camera,
  Object3D,
  Mesh,
  Raycaster,
  Scene,
  Vector3,
} from 'three';
import { GUI } from '../resources';
import { Point } from '../attr';

// A special hack given by https://stackoverflow.com/a/56439275
type datGUI = typeof GUI.datGUI.prototype;
let tileGridPosition: datGUI;
let tileCanvasPosition: datGUI;
let tileScreenPosition: datGUI;
let currentTile: Object3D;
let shouldUnsetCurrentTile = false;
const raycaster = new Raycaster();

interface DrawTileStatisticsInputType {
  camera: Camera;
  scene: Scene;
  rightClickMouse: Vector3;
  gui: GUI;
  guiContainer: HTMLElement;
}

const drawTileStatistics = ({
  camera,
  scene,
  rightClickMouse,
  gui,
  guiContainer,
}: DrawTileStatisticsInputType): void => {
  raycaster.setFromCamera(rightClickMouse, camera);
  const newTile = (
    raycaster.intersectObjects(scene.children)
      .map(({ object }) => object)
      .find(child => child instanceof Mesh && child.isMesh)
  ) as Mesh;

  if (shouldUnsetCurrentTile) {
    currentTile = undefined;
    rightClickMouse.x = Infinity;
    rightClickMouse.y = Infinity;
    shouldUnsetCurrentTile = false;
    return;
  }
  if (newTile === undefined && currentTile !== undefined) {
    currentTile = undefined;
  }
  if (newTile === currentTile) {
    return;
  }
  currentTile = newTile;

  const screenTile = (
    (new Vector3())
      .setFromMatrixPosition(currentTile.matrixWorld)
      .project(camera)
  );
  const { innerWidth: width, innerHeight: height } = window;
  screenTile.setX(
    screenTile.x * (width / 2) + width / 2
  );
  screenTile.setY(
    -(screenTile.y * (height / 2)) + height / 2
  );

  guiContainer.style.top = `${screenTile.y}px`;
  guiContainer.style.left = `${screenTile.x}px`;

  const currentTileGridPosition = currentTile.name.match(/\((\d+), (\d+)\)/);
  const pos: Point = new Point(parseInt(currentTileGridPosition[1]), parseInt(currentTileGridPosition[2]));
  tileGridPosition && gui.removeFolder(tileGridPosition);
  tileGridPosition = gui.addFolder('Grid position');
  tileGridPosition.add(pos, 'X', 0, 25, 1).name('X');
  tileGridPosition.add(pos, 'Y', 0, 25, 1).name('Y');
  tileGridPosition.open();

  tileCanvasPosition && gui.removeFolder(tileCanvasPosition);
  tileCanvasPosition = gui.addFolder('Canvas position');
  tileCanvasPosition.add(currentTile.position, 'x', -100, 100, 0.0001).name('X');
  tileCanvasPosition.add(currentTile.position, 'y', -100, 100, 0.0001).name('Y');
  tileCanvasPosition.open();

  tileScreenPosition && gui.removeFolder(tileScreenPosition);
  tileScreenPosition = gui.addFolder('Screen position');
  tileScreenPosition.add(screenTile, 'x', -100, 100, 0.0001).name('X');
  tileScreenPosition.add(screenTile, 'y', -100, 100, 0.0001).name('Y');
  tileScreenPosition.open();

  gui.showGUI();
  gui.listenOnClose(() => { shouldUnsetCurrentTile = true; });
};

export { drawTileStatistics };
