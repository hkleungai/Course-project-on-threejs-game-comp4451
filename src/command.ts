import {
	applyModAttr,
	consumeResources,
	plusEqualsAttr,
	minusEqualsAttr,
	Point
} from './attr';
import { Building, UnitBuilding } from './props/buildings';
import { Personnel, Unit, UnitStatus } from './props/units';
import {
	getNeighborsAtRange,
	getTile,
	getUnitAt,
	instantiateUnit,
	isFriendlyCity,
	isOccupied,
	tileExistsInArray
} from './flows';
import { Cities, GameMap, Tile } from './props';
import { scene } from './main';
import { Player } from './player';
abstract class Command {
	public GameMap : GameMap;
	public Player : Player;
	public Source : Point;
	public Destination : Point;
	protected Execute?() : void;

	protected constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
		this.GameMap = gameMap;
		this.Player = player;
		this.Source = src;
		this.Destination = destination;
	}
}

class Hold extends Command {
	public Execute() {
		getUnitAt(this.GameMap, this.Destination).Status = UnitStatus.Active;
	}
	constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
		super(gameMap, player, src, destination);
	}
}

class Move extends Command {
	public path: Point[]; // exclude source, last tile must be destination
	public Execute() {
		let unit: Unit = getUnitAt(this.GameMap, this.Source);
		
	}
}

class Fire extends Command {
	public Execute() {
		
	}
}

// this class included re-capture as well
class Capture extends Command {
	public Execute() {
		let tile: Tile = getTile(this.GameMap, this.Source); // on top of city
		let unit: Unit = getUnitAt(this.GameMap, this.Source); // self unit
		if (!(tile instanceof Cities) || !(unit instanceof Personnel)) {
			alert('target is not a city or unit is not personnel');
			return;
		}
		let city: Cities = tile as Cities;
		let person: Personnel = unit as Personnel;
		if (!isFriendlyCity(this.GameMap, this.Source, this.Player)) {
			city.Morale = minusEqualsAttr(city.Morale, person.CaptureEfficiency);
			if (city.Morale.Value < 0) {
				city.Owner = person.Owner;
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
			applyModAttr(this.TrainingGround.QueueCapacity)) {
				alert('training queue is full');
				return;
			}
		let nei: string = consumeResources(this.TrainingGround.Owner.Resources, this.Unit.Cost.Base);
		if (nei === '') {
			this.Unit.Status = UnitStatus.InQueue;
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
		if (this.Unit.Status !== UnitStatus.CanBeDeployed) {
			alert('not a deployable unit');
			return;
		}
		let deployable: Tile[] = getNeighborsAtRange(this.GameMap, 
			getTile(this.GameMap, this.TrainingGround.CoOrds), 
			Math.floor(applyModAttr(this.TrainingGround.DeployRange))
		).filter(t => !isOccupied(this.GameMap, t.CoOrds));
		if (deployable.length == 0 || 
			!tileExistsInArray(deployable, getTile(this.GameMap, this.Destination))) {
			alert('either no available space for deploy or target is occupied.');
			return;
		}
		this.Unit.Status = UnitStatus.Active;
		instantiateUnit(scene, this.Destination, this.Unit);
	}
}

class Build extends Command {
	public Building: Building;
	public Execute() {

	}
}

export {
	Command,
	Hold,
	Move,
	Fire,
	Capture,
	Train,
	Deploy,
	Build
}