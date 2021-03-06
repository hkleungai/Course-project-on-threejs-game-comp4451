import {
  Attribute,
  Cost,
  Defense,
  Load,
  Offense,
  Resources,
  Spotting
} from "../../attr";
import { Unit } from '../units';
import { Prop } from "../prop";

abstract class Building extends Prop {
  public Name : string;
  public Cost : Cost;
  public Durability : Attribute;
  public Spotting : Spotting;
}

abstract class UnitBuilding extends Building {
  public Load : Load;
  public QueueCapacity : number;
  public TrainingQueue : Unit[];
  public ReadyToDeploy : Unit[];
  public DeployRange : number;
}

abstract class ResourcesBuilding extends Building {
  public Production : Resources;
}

abstract class Infrastructure extends Building {

}

abstract class TransmissionBuilding extends Building {
  public Spotting : Spotting;
}

abstract class DefensiveBuildling extends Building {
  public Offense : Offense;
  public Defense : Defense;
}

export {
  Building,
  UnitBuilding,
  ResourcesBuilding,
  Infrastructure,
  TransmissionBuilding,
  DefensiveBuildling
};
