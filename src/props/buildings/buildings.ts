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

abstract class Building extends Prop {
  public Name : string;
  public Owner : Player;
  public CoOrds : Point;
  public Level : number;
  public Cost : Cost;
  public Durability : Attribute;
  public Scouting : Scouting;
  public DestroyTerrainOnBuilt : boolean;
}

abstract class UnitBuilding extends Building {
  public QueueCapacity : Attribute;
  public TrainingQueue : Unit[];
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
  Building,
  UnitBuilding,
  ResourcesBuilding,
  Infrastructure,
  TransmissionBuilding,
  DefensiveBuilding
};
