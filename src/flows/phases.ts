import { Mesh, Scene } from "three";
import { Point, pointEquals } from "../attr"
import { GameMap } from "../props"
import {
    Unit,
    UnitStatus
} from "../props/units"
import { InvalidArgumentException } from "../utils";

const getUnitAtCoOrds = (map: GameMap, coords: Point): Unit => {
    return map.Units.find(u => pointEquals(u.Coords, coords));
}

const deployUnit = (scene: Scene, unit: Unit, coords: Point) => {
    if (unit.Status !== UnitStatus.CanBeDeployed) {
        return; // TODO add exception maybe
    }


}

const executeMovePhase = (map: GameMap) => {

}

export {
  getUnitAtCoOrds
}
