import {
    applyMod,
    consumeResources,
    plusEqualsAttr,
    minusEqualsAttr,
    Point
} from './attr';
import { UnitBuilding } from './props/buildings';
import { Personnel, Unit } from './props/units';
import {
    getNeighborsAtRange,
    getTile,
    getUnitAt,
    instantiateUnit,
    isFriendlyCity,
    isOccupied,
    tileExistsInArray
} from './flows';
import { Cities, Tile } from './props';
import { scene } from './main';
import { Player } from './player';
class Command {
    public Player : Player;
    public Source : Point;
    public Destination : Point;
    protected Execute?() : void;
    
}

class Hold extends Command {
    public Execute() {
        // well do nth...
    }
}

class Move extends Command {
    public path: Point[]; // exclude source, last tile must be destination
    public Execute() {
        let unit: Unit = getUnitAt(this.Source);

    }
}

class Fire extends Command {
    public Execute() {
        
    }
}

// this class included re-capture as well
class Capture extends Command {
    public Execute() {
        let tile: Tile = getTile(this.Source); // on top of city
        let unit: Unit = getUnitAt(this.Source); // self unit
        if (!(tile instanceof Cities) || !(unit instanceof Personnel)) {
            return;
        } 
        let city: Cities = tile as Cities;
        let person: Personnel = unit as Personnel;
        if (!isFriendlyCity(this.Source, this.Player)) {
            city.Morale = minusEqualsAttr(city.Morale, person.CaptureEfficiency);
            if (city.Morale.Value < 0) {
                city.Owner == null;
            }
        } else { // re-capture
            if (city.Morale.Value != 100) {
                city.Morale = plusEqualsAttr(city.Morale, person.CaptureEfficiency);
            }
            if (city.Morale.Value > 100) {
                city.Morale.Value = 100;
            }
        }
    }
}

class Train extends Command {
    public TrainingGround: UnitBuilding;
    public Unit: Unit;
    public Execute() {
        if (this.TrainingGround.TrainingQueue.length >= 
            applyMod(this.TrainingGround.QueueCapacity)) {
                return;
            }
        let nei: string = consumeResources(this.TrainingGround.Owner.Resources, this.Unit.Cost.Base);
        if (nei === '') {
            this.TrainingGround.TrainingQueue.push(this.Unit);
        } else {
            alert(`not enough ${nei}`);
        }
    }
}

class Deploy extends Command {
    public TrainingGround: UnitBuilding;
    public Unit: Unit;
    public Execute() {
        let deployable: Tile[] = getNeighborsAtRange(
            getTile(this.TrainingGround.CoOrds), 
            Math.floor(applyMod(this.TrainingGround.DeployRange))
        ).filter(t => !isOccupied(t.CoOrds));
        if (deployable.length == 0 || 
            !tileExistsInArray(deployable, getTile(this.Destination))) {
            return;
        }
        instantiateUnit(scene, this.Destination, this.Unit);
    }
}

export {
    Command,
    Hold,
    Move,
    Fire,
    Capture,
    Train,
    Deploy
}