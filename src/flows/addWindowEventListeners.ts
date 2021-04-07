import {
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Scene,
} from 'three';
import { GameMap } from '../props';
import { executePhases } from '../utils';

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
  gameMap?: GameMap;
  scene?: Scene;
}

const listenOnKeyboardEvent = ({
  camera, delta, gameMap, scene
}: OnKeyboardEventInputType): void => {
  if (delta === undefined) {
    delta = 0.5;
  }
  const callback = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.key) {
      case 'ArrowUp':
      case 'W':
        camera.translateY(delta);
        break;
      case 'ArrowDown':
      case 'S':
        camera.translateY(-delta);
        break;
      case 'ArrowLeft':
      case 'A':
        camera.translateX(-delta);
        break;
      case 'ArrowRight':
      case 'D':
        camera.translateX(delta);
        break;
      case '+':
      case 'E':
        camera.translateZ(-delta);
        break;
      case '-':
      case 'Q':
        camera.translateZ(delta);
        break;
      case 'Enter':
        scene !== undefined && gameMap !== undefined && executePhases(scene, gameMap);
        break;
      default:
        // console.log(event.key);
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
  gameMap?: GameMap;
  scene?: Scene;
}

const addWindowEventListeners = ({
  moveMouse,
  leftClickMouse,
  rightClickMouse,
  camera,
  renderer,
  gameMap,
  scene,
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
  listenOnKeyboardEvent({ camera, gameMap, scene });
};

export {
  addWindowEventListeners,
};
