import {
  Attribute,
  Cost,
  Defense,
  Offense,
  Point,
  Resources,
  Scouting
} from "../../attr";
import { Unit } from '../units';
import { Prop } from "../prop";
import { Player } from "../../player";

type BuildingType = 'unit' | 'resources' | 'infra' | 'transmit' | 'defensive';

enum BuildingStatus {
  None,
  UnderConstruction,
  Active,
  Destroyed
}
abstract class Building extends Prop {
  public Name : string;
  public Status : BuildingStatus;
  public Owner : Player;
  public CoOrds : Point;
  public Level : number;
  public MaxLevel : number;
  public Cost : Cost;
  public Durability : Attribute;
  public Scouting : Scouting;
  public DestroyTerrainOnBuilt : boolean;
  public ConstructionTimeRemaining : number;

  public constructor(building?: Partial<Building>) {
    super();
    this.Name = building.Name;
    this.Status = building.Status;
    this.Owner = building.Owner;
    this.CoOrds = building.CoOrds;
    this.Level = building.Level;
    this.MaxLevel = building.MaxLevel;
    this.Cost = building.Cost;
    this.Durability = building.Durability;
    this.Scouting = building.Scouting;
    this.DestroyTerrainOnBuilt = building.DestroyTerrainOnBuilt;
    this.ConstructionTimeRemaining = building.ConstructionTimeRemaining;
  }
}

abstract class UnitBuilding extends Building {
  public QueueCapacity : Attribute;
  public TrainingQueue : Unit[];
  public CurrentQueueTime : number;
  public ReadyToDeploy : Unit[];
  public DeployRange : Attribute;

  public constructor(unitBuilding?: Partial<UnitBuilding>) {
    super(unitBuilding);
    this.QueueCapacity = unitBuilding.QueueCapacity;
    this.TrainingQueue = unitBuilding.TrainingQueue;
    this.CurrentQueueTime = unitBuilding.CurrentQueueTime;
    this.ReadyToDeploy = unitBuilding.ReadyToDeploy;
    this.DeployRange = unitBuilding.DeployRange;
  }
}

abstract class ResourcesBuilding extends Building {
  public Production : Resources;
}

abstract class Infrastructure extends Building {

}

abstract class TransmissionBuilding extends Building {
  public EffectiveRange : Attribute;
}

abstract class DefensiveBuilding extends Building {
  public Offense : Offense;
  public Defense : Defense;
}

export {
  BuildingType,
  BuildingStatus,
  Building,
  UnitBuilding,
  ResourcesBuilding,
  Infrastructure,
  TransmissionBuilding,
  DefensiveBuilding
};
