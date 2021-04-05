import { Prop } from '../prop';
import {
  Point,
  Attribute,
  Cost,
  Maneuverability,
  Defense,
  // Offense,
  Resources,
  Scouting,
} from '../../attr';
import {
  Firearm,
  // Module,
  Gun,
  MachineGun,
  Engine,
  Suspension,
  Radio,
  Periscope,
  FuelTank,
  CannonBreech,
  AmmoRack,
  Propeller,
  Rudder,
  Wings,
  LandingGear,
  Radar
} from '../../researches';
import { Player } from '../../player';
// import { personnelDataJson } from '../../assets/json';

enum UnitStatus {
  None,
  InQueue,
  CanBeDeployed,
  Active,
  Moved,
  Fired,
  Wrecked,
  Destroyed
}
abstract class Unit extends Prop {
  public Name : string;
  public Owner : Player;
  public Coords : Point;
  public Status : UnitStatus;
  public Cost : Cost;
  public Maneuverability : Maneuverability;
  public Defense : Defense;
  public Consumption : Resources;
  public Carrying : Resources;
  public Capacity : Resources;
  public Scouting : Scouting;
  public Morale : Attribute;

  public CurrentSuppressionLevel : number;
  public LastSuppressedRound : number;
  public IsSuppressed : boolean;
  public IsDisconnected : boolean;
  public TrainingTimeRemaining : number;

  public constructor(unit?: Partial<Unit>) {
    super();
    this.Name = unit.Name;
    this.Coords  = unit.Coords;
    this.Status = unit.Status;
    this.Cost  = unit.Cost;
    this.Maneuverability  = unit.Maneuverability;
    this.Defense  = unit.Defense;
    this.Consumption  = unit.Consumption;
    this.Carrying = unit.Carrying;
    this.Capacity  = unit.Capacity;
    this.Scouting  = unit.Scouting;
    this.Morale  = unit.Morale;

    this.CurrentSuppressionLevel = unit.CurrentSuppressionLevel;
    this.LastSuppressedRound = unit.LastSuppressedRound;
    this.IsSuppressed = unit.IsSuppressed;
    this.IsDisconnected = unit.IsDisconnected;
    this.TrainingTimeRemaining = unit.TrainingTimeRemaining;
  }
}

abstract class Personnel extends Unit {
  public PrimaryFirearm : Firearm;
  public SecondaryFirearm : Firearm;
  public DefaultPrimary : string;
  public AvailableFirearms : string[];
  public CaptureEfficiency : Attribute;

  public constructor(personnel?: Partial<Personnel>) {
    super(personnel);
    this.PrimaryFirearm = personnel.PrimaryFirearm;
    this.SecondaryFirearm = personnel.SecondaryFirearm;
    this.DefaultPrimary = personnel.DefaultPrimary;
    this.AvailableFirearms = personnel.AvailableFirearms;
    this.CaptureEfficiency = personnel.CaptureEfficiency;
  }
}

abstract class Artillery extends Unit {
  public IsAssembled : boolean;
  public AssembleTime : number;
  public DefaultGun : string;
  public Gun : Gun;
  public Radio : Radio;
  public CannonBreech : CannonBreech;
}

abstract class Vehicle extends Unit {
  public DefaultMainArmament : string;
  public Guns : Gun[];
  public MachineGuns : MachineGun[];
  public Engine : Engine;
  public Suspension : Suspension;
  public Radio : Radio;
  public Periscope : Periscope;
  public FuelTank : FuelTank;
  public CannonBreech : CannonBreech;
  public AmmoRack : AmmoRack;
}

abstract class Vessel extends Unit {
  public DefaultMainArmaments : string[];
  public DefaultSecondaryArmaments : string[];
  public Guns : Gun[];
  public MachineGuns : MachineGun[];
  public Engine : Engine;
  public Radio : Radio;
  public Periscope : Periscope;
  public FuelTank : FuelTank;
  public CannonBreech : CannonBreech;
  public AmmoRack : AmmoRack;
  public Propeller : Propeller;
  public Rudder : Rudder;
  public Radar : Radar;
  public Altitude : number;
}

abstract class Plane extends Unit {
  public Guns : Gun[];
  public MachineGuns : MachineGun[];
  public Engine : Engine;
  public Radio : Radio;
  public FuelTank : FuelTank;
  public CannonBreech : CannonBreech;
  public AmmoRack : AmmoRack;
  public Propeller : Propeller;
  public Rudder : Rudder;
  public Wings : Wings;
  public LandingGear : LandingGear;
  public Radar : Radar;
  public Altitude : number;
}

export {
  Unit,
  UnitStatus,
  Personnel,
  Artillery,
  Vehicle,
  Vessel,
  Plane
};
