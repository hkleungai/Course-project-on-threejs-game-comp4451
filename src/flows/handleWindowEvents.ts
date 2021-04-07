import {
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Scene,
} from 'three';
import { GameMap } from '../props';
import { executePhases } from './phases';
interface OnWindowResizeInputType {
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
}

const onWindowResize = ({
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
  shouldPreventDefault?: boolean;
}

const listenOnMouseEvent = ({
  mouse,
  action,
  shouldPreventDefault = false,
}: onMouseMoveInputType): void => {
  const callback = (event: MouseEvent): void => {
    shouldPreventDefault && event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
  window.addEventListener(action, callback, false);
};


interface OnKeyboardEventInputType {
  scene?: Scene;
  gameMap?: GameMap;
  camera: PerspectiveCamera;
  delta?: number;
}

const listenOnKeyboardEvent = ({
  camera, delta
}: OnKeyboardEventInputType): void => {
  if (delta === undefined) {
    delta = 1;
  }
  const callback = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.key) {
      case "ArrowUp" || "W":
        camera.translateY(delta);
        break;
      case "ArrowDown" || "S":
        camera.translateY(-delta);
        break;
      case "ArrowLeft" || "A":
        camera.translateX(-delta);
        break;
      case "ArrowRight" || "D":
        camera.translateX(delta);
        break;
      case "+" || "E":
        camera.translateZ(-delta);
        break;
      case "-" || "Q":
        camera.translateZ(delta);
        break;
      default:
        console.log(event.key);
    }
  };
  window.addEventListener('keydown', callback, false);
};

interface OnKeyboardEventInputTypeForPlanningPhase {
  scene: Scene;
  gameMap: GameMap;
}

const listenOnKeyboardEventForPlanningPhase = ({
  scene, gameMap
}: OnKeyboardEventInputTypeForPlanningPhase): void => {
  const callback = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.key) {
      case "Enter":
        if (scene !== undefined && gameMap !== undefined) {
          executePhases(scene, gameMap);
        }
        return;
    }
  };
  window.addEventListener('keydown', callback, false);
};

export {
  onWindowResize,
  listenOnMouseEvent,
  listenOnKeyboardEvent,
  listenOnKeyboardEventForPlanningPhase
};
