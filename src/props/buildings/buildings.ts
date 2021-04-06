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
  public Cost : Cost;
  public Durability : Attribute;
  public Scouting : Scouting;
  public DestroyTerrainOnBuilt : boolean;
  public ConstructionTimeRemaining : number;
}

abstract class UnitBuilding extends Building {
  public QueueCapacity : Attribute;
  public TrainingQueue : Unit[];
  public CurrentQueueTime : number;
  public ReadyToDeploy : Unit[];
  public DeployRange : Attribute;
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
