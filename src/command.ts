import {
  applyModAttr,
  consumeResources,
  plusEqualsAttr,
  minusEqualsAttr,
  Point,
  applyMod,
  lackingResources
} from './attr';
import { Building, BuildingStatus, UnitBuilding } from './props/buildings';
import { Artillery, Personnel, Unit, UnitStatus } from './props/units';
import {
  getBuildingAt,
  getCityAt,
  getConstructibleNeighbours,
  getDemolishableNeighbours,
  getFortifyableNeighbours,
  getNeighborsAtRange,
  getPath,
  getRequiredSupplies,
  getTile,
  getUnitAt,
  hasEmptyNeigbors,
  hasEnoughCartridges,
  hasFriendlyBuilding,
  hasFriendlyUnit,
  hasHostileUnit,
  hasUnit,
  instantiateBuilding,
  instantiateUnit,
  isCity,
  isFriendlyCity,
  isOccupied,
  isTileInList
} from './utils';
import { BuildingData, Cities, CustomizableData, GameMap, Tile, UnitData } from './props';
import { Player, playerEquals } from './player';
import { Scene } from 'three';
import { random } from 'mathjs';
import { Firearm, Gun } from './researches';
import { gameMap } from './assets/json';
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

const addCommand = (gameMap: GameMap, unit: Unit, command: Command) => {
  if (!unit.IsCommandSet) {
    gameMap.Commands.push(command);
    unit.IsCommandSet = true;
  } else {
    //eslint-disable no-alert
    alert('command is already set for this unit!');
    return;
  }
};

const addRepeatableCommand = (gameMap: GameMap, command: Command) => {
  gameMap.Commands.push(command);
};

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
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
  public Execute(): void {
    const unit: Unit = getUnitAt(this.GameMap, this.Source);
    const path = getPath(
      this.GameMap,
      getTile(this.GameMap,this.Source),
      getTile(this.GameMap, this.Destination),
      unit);
    unit.Carrying.Supplies.Value -= getRequiredSupplies(path, unit);
    unit.Coords = this.Destination;
    //unit.Status = UnitStatus.Moved;
    console.log(unit);
  }
}

class Fire extends Command {
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
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
        console.log(`hostile strength: ${hostile.Defense.Strength.Value}, damage inflictied: ${damage}`);
      } else {
        hostile.Durability.Value -= damage;
        console.log(`hostile durability: ${hostile.Durability.Value}, damage inflictied: ${damage}`);
      }
      //friendly.Status = UnitStatus.Fired;
      consumeResources(friendly.Carrying, friendly.PrimaryFirearm.ConsumptionNormal);
      console.log(`ammo remaining: ${friendly.Carrying.Cartridges.Value} / ${friendly.Capacity.Cartridges.Value}`);
    }
  }
}

class Capture extends Command {
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
  public Execute() {
    const city: Cities = getCityAt(this.GameMap, this.Source); // on top of city
    const unit: Unit = getUnitAt(this.GameMap, this.Source); // self unit
    if (city === undefined || !(unit instanceof Personnel)) {
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

  constructor(scene: Scene, gameMap: GameMap, player: Player, src: Point, destination: Point, unit: Unit) {
    super(gameMap, player, src, destination);
    this.Unit = unit;
    this.TrainingGround = getBuildingAt(gameMap, destination) as UnitBuilding;
    this.Scene = scene;
  }
  public Execute() {
    if (this.TrainingGround.TrainingQueue.length >=
      applyModAttr(this.TrainingGround.QueueCapacity)) {
      alert('training queue is full');
      return;
    }
    consumeResources(this.Player.Resources, this.Unit.Cost.Base);
    this.Unit.Owner = this.Player;
    this.Unit.Coords = new Point(-1, -1); // indicate not on map
    this.Unit.Status = UnitStatus.InQueue;
    this.TrainingGround.TrainingQueue.push(this.Unit);
    this.TrainingGround.CurrentQueueTime += this.Unit.Cost.Base.Time.Value;
    this.Unit.TrainingTimeRemaining = this.TrainingGround.CurrentQueueTime;
    this.Unit.TrainingGround = this.TrainingGround;
    this.GameMap.Units.push(this.Unit); // add to game map
    console.log('Trained a unit');
  }
}

class Deploy extends Command {
  public Custom: CustomizableData;
  public TrainingGround: UnitBuilding;
  public Unit: Unit;

  constructor(scene: Scene, gameMap: GameMap, player: Player, src: Point, destination: Point, custom_data: CustomizableData, unit_name: string) {
    super(gameMap, player, src, destination);
    this.Scene = scene;
    this.Custom = custom_data;
    this.TrainingGround = getBuildingAt(gameMap, src) as UnitBuilding;
    this.Unit = this.TrainingGround.ReadyToDeploy.find(u => u.Status === UnitStatus.CanBeDeployed && u.Name === unit_name);
  }
  public Execute() {
    if (this.Unit.Status !== UnitStatus.CanBeDeployed) {
      // alert('not a deployable unit');
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
    (this.Unit as Personnel).PrimaryFirearm = this.Custom.FirearmData[(this.Unit as Personnel).DefaultPrimary.toLowerCase()];
    this.Unit.Status = UnitStatus.Active;
    this.Unit.Coords = this.Destination;
    this.Unit.Carrying.Supplies.Value = this.Unit.Cost.Base.Supplies.Value;
    this.Unit.Carrying.Cartridges.Value = this.Unit.Cost.Base.Cartridges.Value;
    this.Unit.Carrying.Shells.Value = this.Unit.Cost.Base.Shells.Value;
    this.Unit.Carrying.Fuel.Value = this.Unit.Cost.Base.Fuel.Value;
    instantiateUnit(this.Scene, this.Unit.Coords, this.Unit);
    this.TrainingGround.ReadyToDeploy.splice(this.TrainingGround.ReadyToDeploy.indexOf(this.Unit), 1);
  }
}

class Build extends Command {
  public Building: Building;

  constructor(scene: Scene, gameMap: GameMap, player: Player, src: Point, destination: Point, building: Building) {
    super(gameMap, player, src, destination);
    this.Building = building;
    this.Scene = scene;
  }
  public Execute() {
    this.Building.Owner = this.Player;
    consumeResources(this.Player.Resources, this.Building.Cost.Base);
    this.Building.CoOrds = this.Destination;
    this.Building.Status = BuildingStatus.UnderConstruction;
    this.Building.Level = 1;
    this.Building.ConstructionTimeRemaining = applyModAttr(this.Building.Cost.Base.Time);
    this.GameMap.Buildings.push(this.Building);
    instantiateBuilding(this.Scene, this.Building.CoOrds, this.Building);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Fortify extends Command {
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
  public Execute() {
    const b = getBuildingAt(this.GameMap, this.Destination);
    consumeResources(this.Player.Resources, b.Cost.Fortification);
    b.Status = BuildingStatus.UnderConstruction;
    b.Level += 1;
    b.Durability.Value = applyModAttr(b.Durability);
    b.ConstructionTimeRemaining = applyModAttr(b.Cost.Fortification.Time);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Demolish extends Command {
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
  public Execute() {
    const b = getBuildingAt(this.GameMap, this.Destination);
    consumeResources(this.Player.Resources, b.Cost.Fortification);
    b.Level -= 1;
    b.Durability.Value -= b.Durability.Mod.Value;
  }
}

//#region logic for determining commands available
// TODO: Move these to utils
const getMoveTargets = (gameMap: GameMap, tile: Tile, self: Player): Tile[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return undefined;
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  if (unit.Carrying.Supplies.Value <= 0 || !hasEmptyNeigbors(gameMap, unit.Coords)) {
    return undefined;
  }
  const neighbors = getNeighborsAtRange(gameMap, tile, applyModAttr(unit.Maneuverability.Speed));
  return neighbors.filter(t => !isOccupied(gameMap, t.CoOrds));
  //TODO add check fuel for vehicles and suppression later
};

const getFireTargets = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): Unit[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return undefined;
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  if (unit instanceof Personnel) {
    if (
      !hasEnoughCartridges(unit, weapon as Firearm)
      || !hasEnoughShells(unit, weapon as Firearm)
      || !hasEnoughFuel(unit, weapon as Firearm)
    ) {
      return undefined;
    }
    const neighbors = getNeighborsAtRange(gameMap, tile, applyModAttr(weapon.Offense.MaxRange));
    return neighbors.filter(t => hasHostileUnit(gameMap, t.CoOrds, self)).map(t => getUnitAt(gameMap, t.CoOrds));
  }
  // eslint-disable-next-line no-empty
  if (unit instanceof Artillery) {

  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSabotageTargets = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): (Building | Cities)[] => {
  if (!hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return undefined;
  }
  const unit = getUnitAt(gameMap, tile.CoOrds);
  // eslint-disable-next-line no-empty
  if (unit instanceof Personnel) {

  }
  return undefined;
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
const getConstructBuildings = (self: Player, data: BuildingData): Building[] => {
  const build: Building[] = [];
  for (const k in data.UnitBuildingData) {
    const v: Building = data.UnitBuildingData[k];
    if (lackingResources(self.Resources, v.Cost.Base) === '') {
      build.push(v);
    }
  }
  return build;
};
const getBuildTargets = (gameMap: GameMap, tile: Tile, self: Player): Tile[] => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return getConstructibleNeighbours(gameMap, tile.CoOrds);
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    const city = getCityAt(gameMap, tile.CoOrds);
    return getConstructibleNeighbours(gameMap, tile.CoOrds, applyModAttr(city.ConstructionRange));
  }
  return undefined;
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
const getTrainUnits = (self: Player, data: UnitData): Unit[] => {
  const train: Unit[] = [];
  for (const k in data.PersonnelData) {
    const v: Unit = data.PersonnelData[k];
    if (lackingResources(self.Resources, v.Cost.Base) === '') {
      train.push(v);
    }
  }
  return train;
};
const getDeployUnits = (gameMap: GameMap, tile: Tile, self: Player): Unit[] => {
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    const b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding && playerEquals(self, b.Owner)) {
      const ub: UnitBuilding = b as UnitBuilding;
      if (ub.ReadyToDeploy.length > 0) {
        return ub.ReadyToDeploy;
      }
    }
  }
  return undefined;
};
const getDeployTargets = (gameMap: GameMap, tile: Tile, self: Player): Tile[] => {
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    const b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding) {
      const ub: UnitBuilding = b as UnitBuilding;
      if (ub.ReadyToDeploy.length > 0) {
        return getNeighborsAtRange(gameMap, tile, Math.floor(applyModAttr(ub.DeployRange))).filter(t => !isOccupied(gameMap, t.CoOrds));
      }
    }
  }
  return undefined;
};
const getFortifyTargets = (gameMap: GameMap, tile: Tile, self: Player): Building[] => {
  let building: Building[] = [];
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    building = getFortifyableNeighbours(gameMap, tile.CoOrds);
    return building.length === 0 ? undefined : building;
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    const city = getCityAt(gameMap, tile.CoOrds);
    building = getFortifyableNeighbours(gameMap, tile.CoOrds, applyModAttr(city.ConstructionRange));
    return building.length === 0 ? undefined : building;
  }
  return undefined;
};
const getDemolishTargets = (gameMap: GameMap, tile: Tile, self: Player): Building[] => {
  let building: Building[] = [];
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    building = getDemolishableNeighbours(gameMap, tile.CoOrds);
    return building.length === 0 ? undefined : building;
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    const city = getCityAt(gameMap, tile.CoOrds);
    building = getDemolishableNeighbours(gameMap, tile.CoOrds, applyModAttr(city.ConstructionRange));
    return building.length === 0 ? undefined : building;
  }
  return undefined;
};
//#endregion


export {
  Command,
  addCommand,
  addRepeatableCommand,
  Hold,
  Move,
  Fire,
  Capture,
  Train,
  Deploy,
  Build,
  Fortify,
  Demolish,
  getMoveTargets,
  getFireTargets,
  getSabotageTargets,
  canCapture,
  getConstructBuildings,
  getBuildTargets,
  canTrain,
  getTrainUnits,
  getDeployUnits,
  getDeployTargets,
  getFortifyTargets,
  getDemolishTargets
};
