"use strict";

const __main__ = async () => {
  // Reasons for having dynamic imports with templates strings.
  // -  Paths like `three/examples/...` can be copied and replaced by `${THREE}/examples/...`.
  // -  Constants, like `THREE`, for module urls can be extracted
  //    and placed in another separate file for management.
  // P.s. Normally people manage module with nodejs support,
  //      but for now I think it is better make everything minimal and ugly :)
  // And as common practice, index files are (and would be) used extensively.
  const {
    THREE,
    THREE_BUILD,
    randint,
    range,
  } = await import('./utils/index.js');
  const {
    AmbientLight,
    Box3,
    Color,
    DirectionalLight,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Vector3,
    sRGBEncoding,
  } = await import(THREE_BUILD);
  const { GLTFLoader } = await import(`${THREE}/examples/jsm/loaders/GLTFLoader.js`);
  const { OrbitControls } = await import(`${THREE}/examples/jsm/controls/OrbitControls.js`)
  const textures = await (await import('./resources/index.js')).textures_promise();

  const scene = new Scene();
  scene.background = new Color(0x000000);
  // Lighting seems optional for now, just as placeholder here.
  const ambientLight = new AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  const directionalLight = new DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0,1,0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.outputEncoding = sRGBEncoding;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 15);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderer);

  const loader = new GLTFLoader();
  const textures_entries = Object.entries(textures);

  // Inspired by https://jsfiddle.net/prisoner849/jzLdcemb/
  // from https://discourse.threejs.org/t/hexagonal-grid-formation/18396
  const circle_count = 4; // Param that determines the number of "layer"
  let unit = -1;
  const angle = Math.PI / 3;
  const axis = new Vector3(0, 0, 1);
  const axis_vector = unit => new Vector3(0, -unit, 0);
  const side_vector = unit => new Vector3(0, unit, 0).applyAxisAngle(axis, -angle);
  [false, true].forEach(is_origin_occupied => {
    range(6).forEach(turn => {
      range(circle_count).forEach(scaling => {
        range(scaling + 1).forEach(bias => {
          const [_, texture] = textures_entries[randint(textures_entries.length)];
          loader.load('../assets/blends/raw.glb', gltf => {
            gltf.scene.traverse(child => {
              if (child.isMesh) {
                if (unit === -1) {
                  const box = new Box3().setFromObject( child );
                  unit = box.getSize().x;
                }

                child.material = new MeshPhongMaterial({
                  map: texture,
                  // envMap: texture,
                  // normalMap: texture,
                  // color: 0xffffff,
                  // wireframeLinewidth: 3,
                  // wireframe: true,
                });
                child.geometry.center();

                if (is_origin_occupied) {
                  const child_position = axis_vector(unit).clone();
                  child_position
                    .multiplyScalar(scaling + 1)
                    .addScaledVector(side_vector(unit), bias)
                    .applyAxisAngle(axis, angle * turn + Math.PI / 2);
                  child.position.set(child_position.x, child_position.y, child_position.z);
                  scene.add(child);
                } else {
                  child.position.set(0, 0, 0);
                  scene.add(child);
                }
              }
            });
          }, xhr => {
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
          }, (error) => {
            console.error(error);
          });
        });
      });
    });
  });

  const animate = () =>{
    render();
    requestAnimationFrame(animate)
  }
  const render = () =>{
    requestAnimationFrame(render);
    renderer.render(scene, camera)
  }
  render();
};

__main__();
