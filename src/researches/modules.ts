import { Module } from './research';
import { Shell } from './shells';
import { Attribute, Offense } from '../attr';

class Gun extends Module {
  public Offense : Offense;
  public Noise : Attribute;
  public CamoPenaltyFire : Attribute;
  public ShellConsumption : Attribute;
  public CompatibleShells : string[];
  public CurrentShell : Shell;
}

class MachineGun extends Module {

}

class Engine extends Module {
  public Horsepower : Attribute;
  public FuelConsumption : Attribute;
  public CatchFireChance : Attribute;
}

class Suspension extends Module {

}

class Radio extends Module {
  public SignalStrength : Attribute;
}

class Periscope extends Module {
  public ObservableRange : Attribute;
}

class FuelTank extends Module {
  public Capacity : Attribute;
  public Leakage : Attribute;
}

class CannonBreech extends Module {
  public MisfireChance : Attribute;
}

class AmmoRack extends Module {
  public Capacity : Attribute;
}

class TorpedoTubes extends Module {
  public Capacity : Attribute;
}

class Sonar extends Module {
  public Range : Attribute;
}

class Propeller extends Module {
  public Thrust : Attribute;
}

class Rudder extends Module {
  public Steering : Attribute;
}

class Wings extends Module {

}

class LandingGear extends Module {

}

class Radar extends Module {
  public Range : Attribute;
}

export {
  Gun,
  MachineGun,
  Engine,
  Suspension,
  Radio,
  Periscope,
  FuelTank,
  CannonBreech,
  AmmoRack,
  TorpedoTubes,
  Sonar,
  Propeller,
  Rudder,
  Wings,
  LandingGear,
  Radar
};

