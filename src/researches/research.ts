import {
  Resources,
  Cost,
  Attribute,
  Modifier,
  Offense
} from '../attr';

class Technology {
  public Name : string;
  public Prerequisite : Technology;
  public Cost : Resources;
  public Effect : Modifier;

  constructor(name : string, prerequisite : Technology, cost : Resources, effect : Modifier) {
    this.Name = name;
    this.Prerequisite = prerequisite;
    this.Cost = cost;
    this.Effect = effect;
  }

  ApplyEffect(target : Attribute): void {
    target.Mod = this.Effect;
  }
}

abstract class Customizable {
  public Name : string;
  public Cost : Cost;

  protected constructor(name : string, cost : Cost) {
    this.Name = name;
    this.Cost = cost;
  }
}

enum FirearmType {
  NONE = 0,
  PRIMARY = 1 << 0,
  SECONDARY = 1 << 1,
  BOTH = PRIMARY | SECONDARY,
}

abstract class Firearm extends Customizable {
  public FirearmType : FirearmType;
  public Offense : Offense;
  public AmmoWeight : number;
  public ConsumptionNormal : Resources;
  public ConsumptionSuppress : Resources;
  public Noise : Attribute;
  public CamoPenaltyMove : Modifier;
  public CamoPenaltyFire : Modifier;
  public MobilityPenalty : Modifier;
}

abstract class Module extends Customizable {
  public Offense : Offense;
  public Integrity : Attribute;
  public Weight : Attribute;
}

abstract class Equippment extends Customizable {

}

export {
  Technology,
  Customizable,
  FirearmType,
  Firearm,
  Module,
  Equippment
};
