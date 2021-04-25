import { Mesh, MeshBasicMaterial, Object3D, Scene, Texture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Point } from "../attr";
import { Unit } from "../props/units";
import { PlayerColor } from "../player";
import { meshes } from "../resources";
import { parseCoordsToScreenPoint, InvalidArgumentException, range } from "./";
import { getUnitEntries } from "./textures";

const instantiateUnit = (mainScene: Scene, coords: Point, unit: Unit) => {
  if (unit.Owner === undefined) {
    throw new InvalidArgumentException('unit.Owner', unit);
  }

  const meshname = `${unit.Name}_${Date.now().toString()}`;
  const textureEntries = getUnitEntries(unit);
  new GLTFLoader().load(`./assets/units/${unit.Name}.glb`, glb => {
    glb.scene.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.isMesh) {
        child.geometry.clearGroups();
        range(3).forEach(materialIndex => {
          child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
        });

        const name = `${unit.Name}_${PlayerColor[unit.Owner.Color].toLowerCase()}`;
        const map: Texture = textureEntries[name];
        child.material = [
          new MeshBasicMaterial({ map, transparent: true }),
          meshes.blank,
          meshes.blank
        ];
        const screenPos = parseCoordsToScreenPoint(coords);
        child.position.set(screenPos.x, screenPos.y, 0.1);
        child.name = meshname;
        mainScene.add(child);
      }
    });
  }, undefined, () => { console.log('error') });
  unit.MeshName = meshname;
}

export {
  instantiateUnit
};

