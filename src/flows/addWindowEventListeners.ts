import {
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Scene,
} from 'three';
import { GameMap } from '../props';
import { executeTests } from '../test';
import { Direction, executePhases } from '../utils';
import { JsonResourcesType } from './loadResourcesFromJsons';
import { selectTile } from './selectTile';

interface OnWindowResizeInputType {
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

const listenOnWindowResize = ({
  camera, renderer
}: OnWindowResizeInputType): void => {
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', resize, false);
};

interface onMouseMoveInputType {
  mouse: Vector3;
  action: keyof WindowEventMap; // eslint-disable-line no-undef
  eventButton?: MouseEvent['button'];
  shouldPreventDefault?: boolean;
}

const listenOnMouseEvent = ({
  mouse,
  action,
  eventButton = undefined,
  shouldPreventDefault = false,
}: onMouseMoveInputType): void => {
  const callback = (event: MouseEvent): void => {
    shouldPreventDefault && event.preventDefault();
    if (action === 'mousedown' && event.button !== eventButton) {
      return;
    }
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener(action, callback);
};

interface OnKeyboardEventInputType {
  camera: PerspectiveCamera;
  delta?: number;
  scene?: Scene;
  jsonResources?: JsonResourcesType;
}

const listenOnKeyboardEvent = ({
  camera, delta, scene, jsonResources
}: OnKeyboardEventInputType): void => {
  if (delta === undefined) {
    delta = 0.5;
  }
  const callback = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.key) {
      case 'ArrowUp':
      case '8':
        camera.translateY(delta);
        break;
      case 'ArrowDown':
      case '5':
        camera.translateY(-delta);
        break;
      case 'ArrowLeft':
      case '4':
        camera.translateX(-delta);
        break;
      case 'ArrowRight':
      case '6':
        camera.translateX(delta);
        break;
      case '+':
      case '9':
        camera.translateZ(-delta);
        break;
      case '-':
      case '7':
        camera.translateZ(delta);
        break;
      case 'w':
      case 'e':
      case 'd':
      case 's':
      case 'a':
      case 'q':
        selectTile({
          camera,
          direction: Direction[event.key],
          scene,
          data: jsonResources
        });
        break;
      case 't': //test
        scene !== undefined && jsonResources.gameMap !== undefined && executeTests(scene, jsonResources);
        break;
      case 'Enter':
        scene !== undefined && jsonResources.gameMap !== undefined && executePhases(scene, jsonResources);
        break;
      case ' ':
        selectTile({
          camera,
          scene,
          confirmSelection: true,
          data: jsonResources
        });
        break;
      default:
        console.log(event.key); //eslint-disable-line no-console
        break;
    }
  };
  window.addEventListener('keydown', callback, false);
};

interface AddWindowEventListenersInputType {
  moveMouse: Vector3;
  leftClickMouse: Vector3;
  rightClickMouse: Vector3;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  scene?: Scene;
  jsonResources?: JsonResourcesType;
}

const addWindowEventListeners = ({
  moveMouse,
  leftClickMouse,
  rightClickMouse,
  camera,
  renderer,
  scene,
  jsonResources
}: AddWindowEventListenersInputType): void => {
  listenOnMouseEvent({
    mouse: moveMouse,
    action: 'mousemove'
  });
  listenOnMouseEvent({
    mouse: leftClickMouse,
    action: 'mousedown',
    eventButton: 0,
    shouldPreventDefault: true
  });
  listenOnMouseEvent({
    mouse: rightClickMouse,
    action: 'contextmenu',
    shouldPreventDefault: true
  });
  listenOnWindowResize({ camera, renderer });
  listenOnKeyboardEvent({ camera, scene, jsonResources });
};

export {
  addWindowEventListeners
};
