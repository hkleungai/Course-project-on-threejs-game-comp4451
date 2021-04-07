import {
  applyModAttr,
  consumeResources,
  plusEqualsAttr,
  minusEqualsAttr,
  Point,
  pointEquals
} from './attr';
import { Building, BuildingStatus, UnitBuilding } from './props/buildings';
import { Personnel, Unit, UnitStatus } from './props/units';
import {
  getBuildingAt,
  getCityAt,
  getNeighborsAtRange,
  getRequiredSupplies,
  getTile,
  getUnitAt,
  instantiateUnit,
  isFriendlyCity,
  isOccupied,
  tileExistsInArray
} from './utils';
import { Cities, CustomizableData, GameMap, Tile } from './props';
import { Player } from './player';
import { Scene } from 'three';
import { random } from 'mathjs';
abstract class Command {
  public Scene: Scene;
  public GameMap : GameMap;
  public Player : Player;
  public Source : Point;
  public Destination : Point;
  public Execute?() : void;

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
  public Path: Tile[]; // exclude source, last tile must be destination
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point, path: Tile[]) {
    super(gameMap, player, src, destination);
    this.Path = path;
  }
  public Execute() {
    let unit: Unit = getUnitAt(this.GameMap, this.Source);
    unit.Carrying.Supplies.Value -= getRequiredSupplies(this.Path, unit);
    unit.Coords = this.Destination;
    unit.Status = UnitStatus.Moved;
  }
}

class Fire extends Command {
  // very crude implementation
  // TODO refine it later
  public Execute() {
    let friendly = getUnitAt(this.GameMap, this.Source);
    let hostile: Unit | Building | Cities = getUnitAt(this.GameMap, this.Destination)
                  ?? getBuildingAt(this.GameMap, this.Destination);
    if (hostile === undefined) {
      let c = getCityAt(this.GameMap, this.Destination);
      if (c !== undefined) {
        hostile = c;
      }
    }
    if (friendly instanceof Personnel && hostile !== undefined) {
      let p = friendly as Personnel;
      let d = p.PrimaryFirearm.Offense.Damage;
      let damage = (hostile instanceof Unit ? d.Soft.Value : d.Destruction.Value)
                    * random(1 - d.Deviation.Value, 1 + d.Deviation.Value);
      if (hostile instanceof Unit) {
        hostile.Defense.Strength.Value -= damage;
      } else {
        hostile.Durability.Value -= damage;
      }
      friendly.Status = UnitStatus.Fired;
      consumeResources(friendly.Carrying, friendly.PrimaryFirearm.ConsumptionNormal);
    }
  }
}

// this class included re-capture as well
class Capture extends Command {
  public Execute() {
    let city: Cities = getCityAt(this.GameMap, this.Source); // on top of city
    let unit: Unit = getUnitAt(this.GameMap, this.Source); // self unit
    if (city === undefined || !(unit instanceof Personnel)) {
      alert('target is not a city or unit is not personnel');
      return;
    }
    let person: Personnel = unit as Personnel;
    if (!isFriendlyCity(this.GameMap, this.Source, this.Player)) {
      city.Morale = minusEqualsAttr(city.Morale, person.CaptureEfficiency);
      if (city.Morale.Value <= 0) {
        city.Owner = person.Owner;
        city.Morale.Value = Math.abs(city.Morale.Value);
      }
    } else { // re-capture
      if (city.Morale.Value < 100) {
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
    let nei: string = consumeResources(this.Player.Resources, this.Unit.Cost.Base);
    if (nei === '') {
      this.Unit.Owner = this.Player;
      this.Unit.Coords = new Point(-1, -1); // indicate not on map
      this.Unit.Status = UnitStatus.InQueue;
      this.TrainingGround.TrainingQueue.push(this.Unit);
      this.TrainingGround.CurrentQueueTime += this.Unit.Cost.Base.Time.Value;
      this.Unit.TrainingTimeRemaining = this.TrainingGround.CurrentQueueTime;
      this.Unit.TrainingGround = this.TrainingGround;
      this.GameMap.Units.push(this.Unit); // add to game map
    } else {
      alert(`not enough ${nei}`);
    }
  }
}

class Deploy extends Command {
  public Custom: CustomizableData;
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
    (this.Unit as Personnel).PrimaryFirearm = this.Custom.FirearmData[(this.Unit as Personnel).DefaultPrimary];
    this.Unit.Status = UnitStatus.Active;
    this.Unit.Coords = this.Destination;
    instantiateUnit(this.Scene, this.Unit.Coords, this.Unit);
  }
}

class Build extends Command {
  public Building: Building;
  public Execute() {
    this.Building.Owner = this.Player;
    let nei = consumeResources(this.Player.Resources, this.Building.Cost.Base);
    if (nei === '') {
      this.Building.CoOrds = this.Destination;
      this.Building.Status = BuildingStatus.UnderConstruction;
      this.GameMap.Buildings.push(this.Building);
    } else {
      alert(`not enough ${nei}`);
    }
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
