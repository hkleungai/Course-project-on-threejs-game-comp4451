import {
  Object3D,
  Scene,
  Vector3,
} from 'three';
import { Camera } from 'three/src/cameras/Camera';

import { GUI } from '../resources';

interface DrawTileStatisticsInputType {
  camera: Camera;
  scene: Scene;
  tileChildrenEntries: { [key: string]: { [innerKey: string]: number } };
}

const drawTileStatistics = ({
  camera, scene, tileChildrenEntries,
}: DrawTileStatisticsInputType): void => {
  const gui: GUI = new GUI({
    onClose: () => gui.hide(),
    autoPlace: false,
  });

  const GUIContainer: HTMLElement = document.querySelector('.gui-container');
  GUIContainer.appendChild(gui.domElement);

  // A special hack given by https://stackoverflow.com/a/56439275
  type datGUI = typeof GUI.datGUI.prototype;
  let tileGridPosition: datGUI;
  let tileCanvasPosition: datGUI;
  let tileScreenPosition: datGUI;

  const onMouseMove = (event: MouseEvent) => {
    event.preventDefault();

    const windowIntersect = (new Vector3(
      (event.clientX / window.innerWidth) * 2 - 1,
      - (event.clientY / window.innerHeight) * 2 + 1,
      0,
    )).unproject(camera)
      .sub(camera.position)
      .normalize();

    const canvasIntersect = (new Vector3()).copy(camera.position).add(
      windowIntersect.multiplyScalar(-camera.position.z / windowIntersect.z)
    );

    const mouseTiletances: [Object3D, number][] = (
      scene.children.map((child) => (
        [child, canvasIntersect.distanceTo(child.position)]
      ))
    );

    const intersectedTile = mouseTiletances.reduce((prev, curr) => {
      return prev[1] < curr[1] ? prev : curr;
    })[0];

    const { position: { x, y }} = intersectedTile;
    const intersectedTileEntry = tileChildrenEntries[`${x}, ${y}`];

    let screenTile = new Vector3();

    screenTile = screenTile.setFromMatrixPosition( intersectedTile.matrixWorld );
    screenTile = screenTile.project(camera);

    // const { width, height } = renderer.context.canvas;
    const { innerWidth: width, innerHeight: height } = window;

    screenTile.setX(
      screenTile.x * (width / 2) + width / 2
    );
    screenTile.setY(
      -(screenTile.y * (height / 2)) + height / 2
    );

    GUIContainer.style.top = `${screenTile.y}px`;
    GUIContainer.style.left = `${screenTile.x}px`;

    tileGridPosition && gui.removeFolder(tileGridPosition);
    tileGridPosition = gui.addFolder('Grid position');
    tileGridPosition.add(intersectedTileEntry, 'row', 0, 25, 1).name('Row');
    tileGridPosition.add(intersectedTileEntry, 'column', 0, 25, 1).name('Column');
    tileGridPosition.open();

    tileCanvasPosition && gui.removeFolder(tileCanvasPosition);
    tileCanvasPosition = gui.addFolder('Canvas position');
    tileCanvasPosition.add(intersectedTile.position, 'x', -100, 100, 0.0001).name('X');
    tileCanvasPosition.add(intersectedTile.position, 'y', -100, 100, 0.0001).name('Y');
    tileCanvasPosition.open();

    tileScreenPosition && gui.removeFolder(tileScreenPosition);
    tileScreenPosition = gui.addFolder('Screen position');
    tileScreenPosition.add(screenTile, 'x', -100, 100, 0.0001).name('X');
    tileScreenPosition.add(screenTile, 'y', -100, 100, 0.0001).name('Y');
    tileScreenPosition.open();

    gui.showGUI();
  };

  window.addEventListener('contextmenu', onMouseMove, false);
};

export { drawTileStatistics };
