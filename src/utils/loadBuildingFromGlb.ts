import { Mesh, MeshBasicMaterial, Object3D, Scene, Texture } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Point } from "../attr";
import { Building } from "../props/buildings";
import { PlayerColor } from "../player";
import { meshes } from "../resources";
import { parseCoordsToScreenPoint, InvalidArgumentException, range } from "./";
import { getBuildingEntries } from "./textures";

const instantiateBuilding = (mainScene: Scene, coords: Point, building: Building) => {
  if (building.Owner === undefined) {
    throw new InvalidArgumentException('building.Owner', building);
  }

  const meshname = `${building.Name}_${Date.now().toString()}`;
  const textureEntries = getBuildingEntries(building);
  new GLTFLoader().load(`./assets/buildings/${building.Name}.glb`, glb => {
    glb.scene.traverse((child: Object3D) => {
      if (child instanceof Mesh && child.isMesh) {
        child.geometry.clearGroups();
        range(3).forEach(materialIndex => {
          child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
        });

        const name = `${building.Name}_${PlayerColor[building.Owner.Color].toLowerCase()}`;
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
  }, undefined, () => console.error);
  building.MeshName = meshname;
}

export {
  instantiateBuilding
};
