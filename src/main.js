"use strict";

const __main__ = async () => {
  // Dynamic Imports is needed since there are template strings used here.
  // Reasons for having dynamic imports with templates strings.
  // -  Path like `three/examples/...` in official doc
  //    can be immediately copied and replaced by `${THREE}/examples/...`.
  // -  Constants, like `THREE`, for module urls can be extracted
  //    and placed in another separate file for management.
  // P.s. Normally people manage module with nodejs support,
  //      but for now I think is better make everything minimal and ugly :)
  const {
    THREE,
    THREE_BUILD,
  } = await import('../utils/constants.js');
  const {
    AmbientLight,
    Color,
    DirectionalLight,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    TextureLoader,
    WebGLRenderer,
    sRGBEncoding,
  } = await import(THREE_BUILD);
  const { GLTFLoader } = await import(`${THREE}/examples/jsm/loaders/GLTFLoader.js`);
  const { OrbitControls } = await import(`${THREE}/examples/jsm/controls/OrbitControls.js`)

  const boundary = new TextureLoader().load('./tiles/boundary.png');
  const city_blue = new TextureLoader().load('./tiles/city_blue.png');
  const city_green = new TextureLoader().load('./tiles/city_green.png');
  const city_red = new TextureLoader().load('./tiles/city_red.png');
  const city_yellow = new TextureLoader().load('./tiles/city_yellow.png');
  const desert = new TextureLoader().load('./tiles/desert.png');
  const forest = new TextureLoader().load('./tiles/forest.png');
  const grassland = new TextureLoader().load('./tiles/grassland.png');
  const hills = new TextureLoader().load('./tiles/hills.png');
  const jungle = new TextureLoader().load('./tiles/jungle.png');
  const metropolis_blue = new TextureLoader().load('./tiles/metropolis_blue.png');
  const metropolis_green = new TextureLoader().load('./tiles/metropolis_green.png');
  const metropolis_red = new TextureLoader().load('./tiles/metropolis_red.png');
  const metropolis_yellow = new TextureLoader().load('./tiles/metropolis_yellow.png');
  const mountains = new TextureLoader().load('./tiles/mountains.png');
  const plains = new TextureLoader().load('./tiles/plains.png');
  const ridge = new TextureLoader().load('./tiles/ridge.png');
  const river = new TextureLoader().load('./tiles/river.png');
  const rocks = new TextureLoader().load('./tiles/rocks.png');
  const stream = new TextureLoader().load('./tiles/stream.png');
  const suburb_blue = new TextureLoader().load('./tiles/suburb_blue.png');
  const suburb_green = new TextureLoader().load('./tiles/suburb_green.png');
  const suburb_red = new TextureLoader().load('./tiles/suburb_red.png');
  const suburb_yellow = new TextureLoader().load('./tiles/suburb_yellow.png');
  const swamp = new TextureLoader().load('./tiles/swamp.png');

  const textures = [
    boundary,
    city_blue,
    city_green,
    city_red,
    city_yellow,
    desert,
    forest,
    grassland,
    hills,
    jungle,
    metropolis_blue,
    metropolis_green,
    metropolis_red,
    metropolis_yellow,
    mountains,
    plains,
    ridge,
    river,
    rocks,
    stream,
    suburb_blue,
    suburb_green,
    suburb_red,
    suburb_yellow,
    swamp,
  ];

  const scene = new Scene();

  scene.background = new Color(0x000000);
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
  camera.position.set(1, 1, 15);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', renderer);

  // TODO: Put it to utils
  const randint_bounded_by = bound => Math.floor(Math.random() * bound * 2 - bound);

  const loader = new GLTFLoader();
  textures.forEach(texture => {
    // texture.encoding = sRGBEncoding;
    // texture.flipY = false;

    loader.load('./raw.glb', gltf => {
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          child.material = new MeshPhongMaterial({
            map: texture,
            // color: 0xffffff,
          });
          child.geometry.center();
          child.position.set(
            randint_bounded_by(7),
            randint_bounded_by(7),
            randint_bounded_by(7),
          );
          child.scale.set(1.5, 1.5, 1.5);
          scene.add(child);
        }
      });
    }, xhr => {
      console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    }, (error) => {
      console.error(error);
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
