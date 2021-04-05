import { Mesh, MeshBasicMaterial, Object3D, Scene, Texture } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Point } from "../attr";
import { Unit } from "../props/units";
import { PlayerColor } from "../player";
import { assaults, engineers, infantries, meshes, militias, mountains, supports } from "../resources";
import { coordsToScreenPoint, InvalidArgumentException, range } from "../utils";

const getEntries = (unit: Unit): { [k: string]: Texture } => {
    switch (unit.Name) {
        case "militia":
            return militias;
        case "infantry":
            return infantries;
        case "assault":
            return assaults;
        case "mountain":
            return mountains;
        case "support":
            return supports;
        case "engineer":
            return engineers;
        default:
            break;
    }
}

const instantiateUnit = (mainScene: Scene, coords: Point, unit: Unit) => {
    if (unit.Owner === undefined) {
        throw new InvalidArgumentException('unit.Owner', unit);
    }

    const textureEntries = getEntries(unit);
    new GLTFLoader().load(`./assets/units/${unit.Name}.glb`, glb => {
        glb.scene.traverse((child: Object3D) => {
            if (child instanceof Mesh && child.isMesh) {
                child.geometry.clearGroups();
                range(3).forEach(materialIndex => {
                    child.geometry.addGroup(0, child.geometry.index.count, materialIndex);
                });
                const map: Texture = textureEntries[`${unit.Name}_${PlayerColor[unit.Owner.Color].toLowerCase()}`];
                child.material = [
                    new MeshBasicMaterial({ map, transparent: true }),
                    meshes.blank,
                    meshes.blank
                ];
                const screenPos = coordsToScreenPoint(coords);
                child.position.set(screenPos.x, screenPos.y, 0.1);
                mainScene.add(child);
            }
        });
    }, undefined, () => { console.log('error') });
}

export {
    instantiateUnit
}

