import { Module } from './research';
import { Shell } from './shells';
import { Attribute } from '../attr';

class Gun extends Module {
  public CompatibleShells : Shell[];
  public CurrentShell : Shell;
}

class Hull extends Module {
  public Armour : Attribute;
}

class Engine extends Module {
  public Horsepower : Attribute;
  public FuelConsumption : Attribute;
  public CatchFireChance : Attribute;
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

class Fuselage extends Module {
  public Armour : Attribute;
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
  Hull,
  Engine,
  Radio,
  Periscope,
  FuelTank,
  CannonBreech,
  AmmoRack,
  TorpedoTubes,
  Sonar,
  Propeller,
  Rudder,
  Fuselage,
  Wings,
  LandingGear,
  Radar
};

