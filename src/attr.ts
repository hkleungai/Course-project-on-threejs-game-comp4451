import { Unit } from './props/units';
import { InvalidArgumentException } from './utils';

class Point {
  public X : number;
  public Y : number;

  constructor(x : number, y : number) {
    if (Number.isInteger(x) && Number.isInteger(y)) {
      this.X = x;
      this.Y = y;
    } else {
      throw new InvalidArgumentException('coodrinates', x, y);
    }
  }
}

class Resources {
  public Money : Attribute;
  public Steel : Attribute;
  public Supplies : Attribute;
  public Ammo : Attribute;
  public Fuel : Attribute;
  public RareMetal : Attribute;
  public Manpower : Attribute;
  public Power : Attribute;

  constructor(resources?: Partial<Resources>) {
    if (Number.isInteger(resources.Money?.Value ?? 0)) {
      this.Money = resources?.Money;
    } else {
      throw new InvalidArgumentException('money', resources.Money.Value);
    }
    if (Number.isInteger(resources.Steel?.Value ?? 0)) {
      this.Steel = resources?.Steel;
    } else {
      throw new InvalidArgumentException('steel', resources.Steel.Value);
    }
    if (Number.isInteger(resources.Supplies?.Value ?? 0)) {
      this.Supplies = resources.Supplies;
    } else {
      throw new InvalidArgumentException('supplies', resources.Supplies.Value);
    }
    if (Number.isInteger(resources.Ammo?.Value ?? 0)) {
      this.Ammo = resources.Ammo;
    } else {
      throw new InvalidArgumentException('ammo', resources.Ammo.Value);
    }
    if (Number.isInteger(resources.Fuel?.Value ?? 0)) {
      this.Fuel = resources.Fuel;
    } else {
      throw new InvalidArgumentException('fuel', resources.Fuel.Value);
    }
    if (Number.isInteger(resources.RareMetal?.Value ?? 0)) {
      this.RareMetal = resources.RareMetal;
    } else {
      throw new InvalidArgumentException('rare_metal', resources.RareMetal.Value);
    }
    if (Number.isInteger(resources.Manpower?.Value ?? 0)) {
      this.Manpower = resources.Manpower;
    } else {
      throw new InvalidArgumentException('manpower', resources.Manpower.Value);
    }
    if (Number.isInteger(resources.Power?.Value ?? 0)) {
      this.Power = resources.Power;
    } else {
      throw new InvalidArgumentException('power', resources.Power.Value);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Consume(resources : Resources): void {
    // TODO
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Produce(resources : Resources): void {
    // TODO
  }

}

enum ModifierType {
  FIXED_VALUE = 0,
  PERCENTAGE = 1,
  MULTIPLE = 2
}

class Modifier {
  public Type : ModifierType;
  public Value : number;

  constructor(type : ModifierType, value : number) {
    this.Type = type;
    this.Value = value;
  }
}

class TerrainModifiers {
  public Recon : Modifier;
  public Camouflage : Modifier;
  public Supplies : Modifier;
  public Fuel : Modifier;
  public Mobility: Modifier;

  constructor(
    recon : Modifier,
    camo : Modifier,
    supplies : Modifier,
    fuel : Modifier,
    mobility : Modifier
  ) {
    this.Recon = recon;
    this.Camouflage = camo;
    this.Supplies = supplies;
    this.Fuel = fuel;
    this.Mobility = mobility;
  }
}

class Attribute {
  public Value : number;
  public Mod : Modifier;

  constructor(value : number, mod : Modifier) {
    this.Value = value;
    this.Mod = mod;
  }

  Apply() : number {
    switch (this.Mod.Type) {
      case ModifierType.FIXED_VALUE:
        return this.Value + this.Mod.Value;
      case ModifierType.PERCENTAGE:
        return Math.round(this.Value * (1 + this.Mod.Value / 100));
      case ModifierType.MULTIPLE:
        return Math.round(this.Value * this.Mod.Value);
    }
  }
}

class Cost {
  public Base : Resources;
  public Research : Resources;
  public Repair : Resources;
  public Fortification : Resources;
  public Manufacture : Resources;
  public Recycling : Resources;

  constructor(cost?: Partial<Cost>) {
    this.Base = cost.Base;
    this.Research = cost.Research;
    this.Repair = cost.Repair;
    this.Fortification = cost.Fortification;
    this.Manufacture = cost.Manufacture;
    this.Recycling = cost.Recycling;
  }
}

class Maneuverability {
  public Speed : Attribute;
  public Mobility : Attribute;
  public Size : Attribute;

  constructor(maneuver?: Partial<Maneuverability>) {
    this.Speed = maneuver.Speed;
    this.Mobility = maneuver.Mobility;
    this.Size = maneuver.Size;
  }
}

class Defense {
  public Strength : Attribute;
  public Resistance : Attribute;
  public Evasion : Attribute;
  public SuppressionThreshold : Attribute;
  public Integrity : Attribute;

  constructor(defense?: Partial<Defense>) {
    this.Strength = defense.Strength;
    this.Resistance = defense.Resistance;
    this.Evasion = defense.Evasion;
    this.SuppressionThreshold = defense.SuppressionThreshold;
    this.Integrity = defense.Integrity;
  }
}

class Offense {
  public Cyclic : Attribute;
  public Firepower : Attribute;
  public DestructionPower : Attribute;
  public DamageDeviation : Attribute;
  public DamageDropoff : Attribute;
  public ROF : Attribute;
  public Salvo : Attribute;
  public Suppression : Attribute;
  public Range : Attribute;
  public Accurarcy : Attribute;
  public AccurarcyDeviation : Attribute;
  public AOE : Attribute;
  public SplashDecay : Attribute;
  public IsDirectFire : boolean;

  constructor(offense?: Partial<Offense>) {
    this.Cyclic = offense.Cyclic;
    this.Firepower = offense.Firepower;
    this.DestructionPower = offense.DestructionPower;
    this.DamageDeviation = offense.DamageDeviation;
    this.DamageDropoff = offense.DamageDropoff;
    this.ROF = offense.ROF;
    this.Salvo = offense.Salvo;
    this.Suppression = offense.Suppression;
    this.Range = offense.Range;
    this.Accurarcy = offense.Accurarcy;
    this.AccurarcyDeviation = offense.AccurarcyDeviation;
    this.AOE = offense.AOE;
    this.SplashDecay = offense.SplashDecay;
    this.IsDirectFire = offense.IsDirectFire;
  }
}

class Load {
  public Units : Unit[];
  public Resources : Resources;

  constructor(units : Unit[], resources : Resources) {
    this.Units = units;
    this.Resources = resources;
  }

  public AddUnit(unit : Unit): void { this.Units.push(unit); }
  public RemoveUnit(unit : Unit): void {
    this.Units.forEach((u, i) => {
      u === unit && this.Units.splice(i, 1);
    });
  }
}

class Spotting {
  public Reconnaissance : Attribute;
  public Camouflage : Attribute;
  public Detection : Attribute;
  public Communication : Attribute;

  constructor(recon : Attribute, camo : Attribute, detect : Attribute, comm : Attribute) {
    this.Reconnaissance = recon;
    this.Camouflage = camo;
    this.Detection = detect;
    this.Communication = comm;
  }
}

export {
  Point,
  Resources,
  Attribute,
  Modifier,
  ModifierType,
  TerrainModifiers,
  Cost,
  Maneuverability,
  Defense,
  Offense,
  Load,
  Spotting
};