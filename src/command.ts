import {
  applyModAttr,
  consumeResources,
  plusEqualsAttr,
  minusEqualsAttr,
  Point,
  applyMod,
} from './attr';
import { Building, BuildingStatus, UnitBuilding } from './props/buildings';
import { Artillery, Personnel, Unit, UnitStatus } from './props/units';
import {
  getBuildingAt,
  getCityAt,
  getNeighborsAtRange,
  getRequiredSupplies,
  getTile,
  getUnitAt,
  hasConstructibleNegibours,
  hasEmptyNeigbors,
  hasEnoughCartridges,
  hasEnoughFuel,
  hasEnoughShells,
  hasFriendlyBuilding,
  hasFriendlyUnit,
  hasHostileUnit,
  hasUnit,
  instantiateUnit,
  isCity,
  isFriendlyCity,
  isOccupied,
  isTileInList
} from './utils';
import { Cities, CustomizableData, GameMap, Tile } from './props';
import { Player } from './player';
import { Scene } from 'three';
import { random } from 'mathjs';
import { Firearm, Gun } from './researches';
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
  public Execute(): void {
    const unit = getUnitAt(this.GameMap, this.Destination);
    unit.Status = UnitStatus.Active;
    unit.Carrying.Supplies.Value -=  applyMod(
      getTile(this.GameMap, this.Destination).TerrainMod.Supplies,
      applyModAttr(unit.Consumption.Supplies)
    );
    if (unit.Carrying.Supplies.Value < 0) {
      unit.Carrying.Supplies.Value = 0;
    }
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
  public Execute(): void {
    const unit: Unit = getUnitAt(this.GameMap, this.Source);
    unit.Carrying.Supplies.Value -= getRequiredSupplies(this.Path, unit);
    unit.Coords = this.Destination;
    unit.Status = UnitStatus.Moved;
  }
}

class Fire extends Command {
  // very crude implementation
  // TODO refine it later
  public Execute(): void {
    const friendly = getUnitAt(this.GameMap, this.Source);
    const hostile: Unit | Building | Cities = (
      getUnitAt(this.GameMap, this.Destination)
      || getBuildingAt(this.GameMap, this.Destination)
      || getCityAt(this.GameMap, this.Destination)
    );
    if (friendly instanceof Personnel && hostile !== undefined) {
      const p = friendly as Personnel;
      const d = p.PrimaryFirearm.Offense.Damage;
      const damage = (
        hostile instanceof Unit ? d.Soft.Value : d.Destruction.Value
      ) * (
        random(1 - d.Deviation.Value, 1 + d.Deviation.Value)
      );
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Sabotage extends Command {

}

// this class included re-capture as well
class Capture extends Command {
  public Execute(): void {
    const city: Cities = getCityAt(this.GameMap, this.Source); // on top of city
    const unit: Unit = getUnitAt(this.GameMap, this.Source); // self unit
    if (city === undefined || !(unit instanceof Personnel)) {
    // eslint-disable-next-line no-alert
      alert('target is not a city or unit is not personnel');
      return;
    }
    const person: Personnel = unit as Personnel;
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
  public Execute(): void {
    if (this.TrainingGround.TrainingQueue.length >=
      applyModAttr(this.TrainingGround.QueueCapacity)) {
      // eslint-disable-next-line no-alert
      alert('training queue is full');
      return;
    }
    const nei: string = consumeResources(this.Player.Resources, this.Unit.Cost.Base);
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
      // eslint-disable-next-line no-alert
      alert(`not enough ${nei}`);
    }
  }
}

class Deploy extends Command {
  public Custom: CustomizableData;
  public TrainingGround: UnitBuilding;
  public Unit: Unit;
  public Execute(): void {
    if (this.Unit.Status !== UnitStatus.CanBeDeployed) {
      // eslint-disable-next-line no-alert
      alert('not a deployable unit');
      return;
    }
    const deployable: Tile[] = getNeighborsAtRange(this.GameMap,
      getTile(this.GameMap, this.TrainingGround.CoOrds),
      Math.floor(applyModAttr(this.TrainingGround.DeployRange))
    ).filter(t => !isOccupied(this.GameMap, t.CoOrds));
    if (
      deployable.length == 0 ||
      !isTileInList(deployable, getTile(this.GameMap, this.Destination))
    ) {
      // eslint-disable-next-line no-alert
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
  public Execute(): void {
    this.Building.Owner = this.Player;
    const nei = consumeResources(this.Player.Resources, this.Building.Cost.Base);
    if (nei === '') {
      this.Building.CoOrds = this.Destination;
      this.Building.Status = BuildingStatus.UnderConstruction;
      this.GameMap.Buildings.push(this.Building);
    } else {
      // eslint-disable-next-line no-alert
      alert(`not enough ${nei}`);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Fortify extends Command {

}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Demolish extends Command {

}

//#region logic for determining commands available
// TODO: Move these to utils
const canMove = (gameMap: GameMap, tile: Tile, self: Player): Tile[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return [];
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  if (unit.Carrying.Supplies.Value <= 0 || !hasEmptyNeigbors(gameMap, unit.Coords)) {
    return [];
  }
  const neighbors = getNeighborsAtRange(gameMap, tile, applyModAttr(unit.Maneuverability.Speed));
  return neighbors.filter(t => !isOccupied(gameMap, t.CoOrds));
  //TODO add check fuel for vehicles and suppression later
};

const canFire = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): Unit[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return [];
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  if (unit instanceof Personnel) {
    if (
      !hasEnoughCartridges(unit, weapon as Firearm)
      || !hasEnoughShells(unit, weapon as Firearm)
      || !hasEnoughFuel(unit, weapon as Firearm)
    ) {
      return [];
    }
    const neighbors = getNeighborsAtRange(gameMap, tile, applyModAttr(weapon.Offense.MaxRange));
    return neighbors.filter(t => hasHostileUnit(gameMap, t.CoOrds, self)).map(t => getUnitAt(gameMap, t.CoOrds));
  }
  // eslint-disable-next-line no-empty
  if (unit instanceof Artillery) {

  }
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const canSabotage = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): (Building | Cities)[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return [];
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  // eslint-disable-next-line no-empty
  if (unit instanceof Personnel) {

  }
  return [];
};

const canCapture = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (!hasUnit(gameMap, tile.CoOrds)) {
    return false;
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  if (!(unit instanceof Personnel) || !isCity(gameMap, tile.CoOrds)) {
    return false;
  }
  const city: Cities = getCityAt(gameMap, tile.CoOrds);
  return city.Owner !== self || city.Morale.Value < 100;
};

const canBuild = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return hasConstructibleNegibours(gameMap, tile.CoOrds);
  }
  if (!isFriendlyCity(gameMap, tile.CoOrds, self)) {
    return false;
  }
  // consider city only so far
  const city = getCityAt(gameMap, tile.CoOrds);
  const neighbors = getNeighborsAtRange(gameMap, city, applyModAttr(city.ConstructionRange));
  return neighbors.some(n => n.AllowConstruction && !isOccupied(gameMap, n.CoOrds));
};

const canTrain = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (!hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    return false;
  }
  const b = getBuildingAt(gameMap, tile.CoOrds);
  if (!(b instanceof UnitBuilding)) {
    return false;
  }
  return b.TrainingQueue.length < applyModAttr(b.QueueCapacity);
};

const canDeploy = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (!hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    return false;
  }
  const b = getBuildingAt(gameMap, tile.CoOrds);
  if (!(b instanceof UnitBuilding)) {
    return false;
  }
  return b.ReadyToDeploy.length > 0;
};

const canFortify = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (!hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    return false;
  }
  const building = getBuildingAt(gameMap, tile.CoOrds);
  return building.Level < building.MaxLevel && building.Status === BuildingStatus.Active;
};
const canDemolish = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (!hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    return false;
  }
  const building = getBuildingAt(gameMap, tile.CoOrds);
  return building.Status === BuildingStatus.Active;
};
//#endregion


export {
  Command,
  Hold,
  Move,
  Fire,
  Capture,
  Train,
  Deploy,
  Build,
  canMove,
  canFire,
  canSabotage,
  canCapture,
  canBuild,
  canTrain,
  canDeploy,
  canFortify,
  canDemolish
};
