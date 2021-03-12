import {
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
} from 'three';

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


export { onWindowResize, listenOnMouseEvent };
