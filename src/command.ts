import {
  applyModAttr,
  consumeResources,
  plusEqualsAttr,
  minusEqualsAttr,
  Point,
  pointEquals,
  timesAttr,
  applyMod,
  geqAttr,
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
  tileExistsInArray
} from './utils';
import { BuildingData, Cities, CustomizableData, GameMap, Tile, UnitData } from './props';
import { Player } from './player';
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
}

class Hold extends Command {
  public Execute() {
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
  public Execute() {
    const unit: Unit = getUnitAt(this.GameMap, this.Source);
    const path = getPath(
      this.GameMap,
      getTile(this.GameMap,this.Source),
      getTile(this.GameMap, this.Destination),
      unit);
    unit.Carrying.Supplies.Value -= getRequiredSupplies(path, unit);
    unit.Coords = this.Destination;
    unit.Status = UnitStatus.Moved;
  }
}

class Fire extends Command {
  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point) {
    super(gameMap, player, src, destination);
  }
  // very crude implementation
  // TODO refine it later
  // included Sabotage
  public Execute() {
    const friendly = getUnitAt(this.GameMap, this.Source);
    let hostile: Unit | Building | Cities = getUnitAt(this.GameMap, this.Destination)
                  ?? getBuildingAt(this.GameMap, this.Destination);
    if (hostile === undefined) {
      const c = getCityAt(this.GameMap, this.Destination);
      if (c !== undefined) {
        hostile = c;
      }
    }
    if (friendly instanceof Personnel && hostile !== undefined) {
      const p = friendly as Personnel;
      const d = p.PrimaryFirearm.Offense.Damage;
      const damage = (hostile instanceof Unit ? d.Soft.Value : d.Destruction.Value)
                    * random(1 - d.Deviation.Value, 1 + d.Deviation.Value);
      if (hostile instanceof Unit) {
        hostile.Defense.Strength.Value -= damage;
        console.log(`hostile strength: ${hostile.Defense.Strength.Value}, damage inflictied: ${damage}`);
      } else {
        hostile.Durability.Value -= damage;
        console.log(`hostile durability: ${hostile.Durability.Value}, damage inflictied: ${damage}`);
      }
      friendly.Status = UnitStatus.Fired;
      consumeResources(friendly.Carrying, friendly.PrimaryFirearm.ConsumptionNormal);
      console.log(`ammo remaining: ${friendly.Carrying.Cartridges}`);
    }
  }
}

// this class included re-capture as well
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

  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point, unit: Unit) {
    super(gameMap, player, src, destination);
    this.Unit = unit;
    this.TrainingGround = getBuildingAt(gameMap, destination) as UnitBuilding;
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
  }
}

class Deploy extends Command {
  public Custom: CustomizableData;
  public TrainingGround: UnitBuilding;
  public Unit: Unit;

  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point, custom_data: CustomizableData) {
    super(gameMap, player, src, destination);
    this.Custom = custom_data;
    this.TrainingGround = getBuildingAt(gameMap, destination) as UnitBuilding;
  }
  public Execute() {
    if (this.Unit.Status !== UnitStatus.CanBeDeployed) {
      alert('not a deployable unit');
      return;
    }
    const deployable: Tile[] = getNeighborsAtRange(this.GameMap,
      getTile(this.GameMap, this.TrainingGround.CoOrds),
      Math.floor(applyModAttr(this.TrainingGround.DeployRange))
    ).filter(t => !isOccupied(this.GameMap, t.CoOrds));
    if (deployable.length == 0 ||
      !tileExistsInArray(deployable, getTile(this.GameMap, this.Destination))) {
      alert('either no available space for deploy or target is occupied.');
      return;
    }
    (this.Unit as Personnel).PrimaryFirearm = this.Custom.FirearmData[(this.Unit as Personnel).DefaultPrimary.toLowerCase()];
    this.Unit.Status = UnitStatus.Active;
    this.Unit.Coords = this.Destination;
    instantiateUnit(this.Scene, this.Unit.Coords, this.Unit);
  }
}

class Build extends Command {
  public Building: Building;

  constructor(gameMap: GameMap, player: Player, src: Point, destination: Point, building: Building) {
    super(gameMap, player, src, destination);
    this.Building = building;
  }
  public Execute() {
    this.Building.Owner = this.Player;
    consumeResources(this.Player.Resources, this.Building.Cost.Base);
    this.Building.CoOrds = this.Destination;
    this.Building.Status = BuildingStatus.UnderConstruction;
    this.GameMap.Buildings.push(this.Building);
  }
}

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
const getMoveTargets = (gameMap: GameMap, tile: Tile, self: Player): Tile[] => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    const unit = getUnitAt(gameMap, tile.CoOrds);
    if (unit.Carrying.Supplies.Value > 0 && hasEmptyNeigbors(gameMap, unit.Coords)) {
      return getNeighborsAtRange(gameMap, tile, applyModAttr(unit.Maneuverability.Speed))
        .filter(t => !isOccupied(gameMap, t.CoOrds));
    }    
  }
  return undefined;
  //TODO add check fuel for vehicles and suppression later
};
const getFireTargets = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): Unit[] => {
  let targets: Unit[];
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    const unit = getUnitAt(gameMap, tile.CoOrds);
    if (unit instanceof Personnel) {
      if (hasEnoughCartridges(unit, weapon as Firearm)
        && hasEnoughShells(unit, weapon as Firearm)
        && hasEnoughFuel(unit, weapon as Firearm)) {
        getNeighborsAtRange(gameMap, tile, applyModAttr(weapon.Offense.MaxRange))
          .filter(t => hasHostileUnit(gameMap, t.CoOrds, self))
          .forEach(t => targets.push(getUnitAt(gameMap, t.CoOrds)));
        return targets;
      }
    } else if (unit instanceof Artillery) {
      
    }
  }
  return targets;
};
const getSabotageTargets = (gameMap: GameMap, tile: Tile, self: Player, weapon: Firearm | Gun): (Building | Cities)[] => {
  let targets: (Building | Cities)[];
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    const unit = getUnitAt(gameMap, tile.CoOrds);
    if (unit instanceof Personnel) {
      
    }
  }
  return targets;
};
const canCapture = (gameMap: GameMap, tile: Tile, self: Player): boolean => {
  if (hasUnit(gameMap, tile.CoOrds)) {
    const unit = getUnitAt(gameMap, tile.CoOrds);
    if (unit instanceof Personnel) {
      if (isCity(gameMap, tile.CoOrds)) {
        const city: Cities = getCityAt(gameMap, tile.CoOrds);
        if (city.Owner === self) {
          return city.Morale.Value < 100;
        } 
        return true;
      }
    }
  }
  return false;
};
const getConstructBuildings = (self: Player, data: BuildingData): Building[] => {
  let build: Building[] = [];
  for (let k in data.UnitBuildingData) {
    let v: Building = data.UnitBuildingData[k];
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
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    const b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding) {
      const ub: UnitBuilding = b as UnitBuilding;
      return ub.TrainingQueue.length < applyModAttr(ub.QueueCapacity);
    } 
  }
  return false;
};
const getTrainUnits = (self: Player, data: UnitData): Unit[] => {
  let train: Unit[] = [];
  for (let k in data.PersonnelData) {
    let v: Unit = data.PersonnelData[k];
    if (lackingResources(self.Resources, v.Cost.Base) === '') {
      train.push(v);
    }
  }
  return train;
}
const getDeployUnits = (gameMap: GameMap, tile: Tile, self: Player): Unit[] => {
  if (hasFriendlyBuilding(gameMap, tile.CoOrds, self)) {
    const b: Building = getBuildingAt(gameMap, tile.CoOrds);
    if (b instanceof UnitBuilding) {
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
        return getNeighborsAtRange(gameMap, tile, Math.floor(applyModAttr(ub.DeployRange)));
      }
    }
  }
  return undefined;
};
const getFortifyTargets = (gameMap: GameMap, tile: Tile, self: Player): Building[] => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return getFortifyableNeighbours(gameMap, tile.CoOrds);
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    const city = getCityAt(gameMap, tile.CoOrds);
    return getFortifyableNeighbours(gameMap, tile.CoOrds, applyModAttr(city.ConstructionRange));
  }
  return undefined;
};
const getDemolishTargets = (gameMap: GameMap, tile: Tile, self: Player): Building[] => {
  if (hasFriendlyUnit(gameMap, tile.CoOrds, self)) {
    return getDemolishableNeighbours(gameMap, tile.CoOrds);
  } else if (isFriendlyCity(gameMap, tile.CoOrds, self)) {
    // consider city only so far
    const city = getCityAt(gameMap, tile.CoOrds);
    return getDemolishableNeighbours(gameMap, tile.CoOrds, applyModAttr(city.ConstructionRange));
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
}
