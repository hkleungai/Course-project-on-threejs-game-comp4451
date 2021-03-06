import { LoadAllData } from './loaddata';
import {
  randint,
  range,
  sinDeg,
  cosDeg,
} from './utils';
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  sRGBEncoding,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { textures } from './resources';

const scene = new Scene();
scene.background = new Color(0x000000);
// Lighting seems optional for now, just as placeholder here.
const ambientLight = new AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);
const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const renderer = new WebGLRenderer({ antialias: true });
renderer.outputEncoding = sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.addEventListener('change', renderer);

// A "simple" zig-zag layout
const loader = new GLTFLoader();
const texturesEntries = Object.entries(textures);
const unit: { x?: number, y?: number } = {};
const initialPosition = new Vector3(-21, 8.5);
range(25).forEach(column => {
  range(10).forEach(row => {
    loader.load('./assets/raw.glb', gltf => {
      gltf.scene.traverse(child => {
        if (child instanceof Mesh && child.isMesh) {
          if (unit.x === undefined || unit.y === undefined) {
            const box = new Box3().setFromObject(child);
            const dummyVector = new Vector3();
            unit.x = box.getSize(dummyVector).x;
            unit.y = box.getSize(dummyVector).y;
          }

          child.geometry.clearGroups();
          range(3).forEach((materialIndex) => {
            child.geometry.addGroup(0, Infinity, materialIndex);
          });

          child.material = [
            new MeshBasicMaterial({
              map: textures.plains,
              transparent: true
            }),
            new MeshBasicMaterial({
              map: texturesEntries[randint(texturesEntries.length)][1],
              transparent: true
            })
          ];

          child.position.set(
            initialPosition.x + unit.y * column * cosDeg(30),
            initialPosition.y - unit.x * cosDeg(30) * row - ((column % 2) * unit.x * sinDeg(60) / 2),
            initialPosition.z
          );
          // console.log(child.position);
          scene.add(child);
        }
      });
    }, xhr => {
      // eslint-disable-next-line no-console
      console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    }, (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
    });
  });
});
LoadAllData();

// A rotational-solution inspired by https://jsfiddle.net/prisoner849/jzLdcemb/
// from https://discourse.threejs.org/t/hexagonal-grid-formation/18396
// const loader = new GLTFLoader();
// const texturesEntries = Object.entries(textures);
// const circle_count = 4; // Param that determines the number of "layer"
// let unit = undefined;
// const angle = Math.PI / 3;
// const axis = new Vector3(0, 0, 1);
// const axis_vector = unit => new Vector3(0, -unit, 0);
// const side_vector = unit => new Vector3(0, unit, 0).applyAxisAngle(axis, -angle);
// [false, true].forEach(is_origin_occupied => {
//   range(6).forEach(turn => {
//     range(circle_count).forEach(scaling => {
//       range(scaling + 1).forEach(bias => {
//         const [_, texture] = texturesEntries[randint(texturesEntries.length)];
//         loader.load('../public/raw.glb', gltf => {
//           gltf.scene.traverse(child => {
//             if (child.isMesh) {
//               if (unit === undefined) {
//                 const box = new Box3().setFromObject( child );
//                 unit = box.getSize().x;
//               }

//               child.material = new MeshPhongMaterial({
//                 map: texture,
//                 // envMap: texture,
//                 // normalMap: texture,
//                 // color: 0xffffff,
//                 // wireframeLinewidth: 3,
//                 // wireframe: true,
//               });
//               child.geometry.center();

//               if (is_origin_occupied) {
//                 const child_position = axis_vector(unit).clone();
//                 child_position
//                   .multiplyScalar(scaling + 1)
//                   .addScaledVector(side_vector(unit), bias)
//                   .applyAxisAngle(axis, angle * turn + Math.PI / 2);
//                 child.position.set(child_position.x, child_position.y, child_position.z);
//                 scene.add(child);
//               } else {
//                 child.position.set(0, 0, 0);
//                 scene.add(child);
//               }
//             }
//           });
//         }, xhr => {
//           console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
//         }, (error) => {
//           console.error(error);
//         });
//       });
//     });
//   });
// });

// const animate = () => {
//   render();
//   requestAnimationFrame(animate);
// };
const render = () => {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};
render();

// document
//   .getElementById('appContainer')
//   .appendChild(renderer.domElement);
