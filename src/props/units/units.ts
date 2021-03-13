import { Prop } from '../prop';
import {
  Point,
  Attribute,
  Cost,
  Maneuverability,
  Defense,
  Offense,
  Resources,
  Spotting,
} from '../../attr';
import {
  Firearm,
  Module
} from '../../researches';

abstract class Unit extends Prop {
  public Name : string;
  public Coords : Point;
  public Cost : Cost;
  public TrainingTime : Attribute;
  public TimeRemaining : number;
  public Maneuverability : Maneuverability;
  public Defense : Defense;
  public Offense : Offense;
  public Consumption : Resources;
  public Capacity : Resources;
  public Spotting : Spotting;
  public Morale : Attribute;

  protected constructor(unit?: Partial<Unit>) {
    super();
    this.Name = unit.Name;
    this.Coords  = unit.Coords;
    this.Cost  = unit.Cost;
    this.Maneuverability  = unit.Maneuverability;
    this.Defense  = unit.Defense;
    this.Offense  = unit.Offense;
    this.Consumption  = unit.Consumption;
    this.Capacity  = unit.Capacity;
    this.Spotting  = unit.Spotting;
    this.Morale  = unit.Morale;
  }
}

abstract class Personnel extends Unit {
  public PrimaryFirearm : Firearm;
  public SecondaryFirearm : Firearm;
  public CaptureEfficiency : Attribute;

  protected constructor(personnel?: Partial<Personnel>) {
    super(personnel);
    this.PrimaryFirearm = personnel.PrimaryFirearm;
    this.SecondaryFirearm = personnel.SecondaryFirearm;
    this.CaptureEfficiency = personnel.CaptureEfficiency;
  }
}

abstract class Artillery extends Unit {
  public Modules : Module[];
}

abstract class Vehicle extends Unit {
  public Modules : Module[];
}

abstract class Vessel extends Unit {
  public Modules : Module[];
  public Altitude : number;
}

abstract class Plane extends Unit {
  public Modules : Module[];
  public Altitude : number;
}

export {
  Unit,
  Personnel,
  Artillery,
  Vehicle,
  Vessel,
  Plane
};
