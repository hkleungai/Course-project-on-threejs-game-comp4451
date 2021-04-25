// import { ResourcesBuilding } from './props/buildings';
import { Unit } from './props/units';
import { InsufficientResourcesException, InvalidArgumentException } from './utils';

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

const pointEquals = (p1: Point, p2: Point): boolean => {
  return p1.X === p2.X && p1.Y === p2.Y;
}

class Resources {
  public Money : Attribute;
  public Steel : Attribute;
  public Supplies : Attribute;
  public Cartridges : Attribute;
  public Shells : Attribute;
  public Fuel : Attribute;
  public RareMetal : Attribute;
  public Manpower : Attribute;
  public Power : Attribute;
  public Time : Attribute;

  constructor(resources?: Partial<Resources>) {
    if (Number.isInteger(resources.Money?.Value ?? 0)) {
      this.Money = resources?.Money;
    } else {
      throw new InvalidArgumentException('money', resources.Money.Value);
    }
    if (Number.isInteger(resources.Manpower?.Value ?? 0)) {
      this.Manpower = resources.Manpower;
    } else {
      throw new InvalidArgumentException('manpower', resources.Manpower.Value);
    }
  }
}

const consumeResources = (
  original: Resources,
  consumption: Resources
): string => {
  if (original.Money.Value < consumption.Money.Value) {
    return 'money';
  }
  if (original.Steel.Value < consumption.Steel.Value) {
    return 'steel';
  }
  if (original.Supplies.Value < consumption.Supplies.Value) {
    return 'supplies';
  }
  if (original.Cartridges.Value < consumption.Cartridges.Value) {
    return 'cartridges';
  }
  if (original.Shells.Value < consumption.Shells.Value) {
    return 'shells';
  }
  if (original.Fuel.Value < consumption.Fuel.Value) {
    return 'fuel';
  }
  if (original.RareMetal.Value < consumption.RareMetal.Value) {
    return 'rare_metal';
  }
  if (original.Manpower.Value < consumption.Manpower.Value) {
    return 'manpower';
  }
  if (original.Power.Value < consumption.Power.Value) {
    return 'power';
  }

  original.Money.Value -= consumption.Money.Value;
  original.Steel.Value -= consumption.Steel.Value;
  original.Supplies.Value -= consumption.Supplies.Value;
  original.Cartridges.Value -= consumption.Cartridges.Value;
  original.Shells.Value -= consumption.Shells.Value;
  original.Fuel.Value -= consumption.Fuel.Value;
  original.RareMetal.Value -= consumption.RareMetal.Value;
  original.Manpower.Value -= consumption.Manpower.Value;
  original.Power.Value -= consumption.Power.Value;

  return '';
};

const produceResources = (
  original : Resources,
  production: Resources
): void => {
  original.Money.Value += applyModAttr(production.Money);
  original.Steel.Value += applyModAttr(production.Steel);
  original.Supplies.Value += applyModAttr(production.Supplies);
  original.Shells.Value += applyModAttr(production.Shells);
  original.Fuel.Value += applyModAttr(production.Fuel);
  original.RareMetal.Value += applyModAttr(production.RareMetal);
  original.Manpower.Value += applyModAttr(production.Manpower);
  original.Power.Value += applyModAttr(original.Power);
};

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

const applyMod = (m: Modifier, n: number): number => {
  switch (m.Type) {
    case ModifierType.FIXED_VALUE:
      return n + m.Value;
    case ModifierType.PERCENTAGE:
      return Math.round(n * (1 + m.Value / 100));
    case ModifierType.MULTIPLE:
      return Math.round(n * m.Value);
  }
}

const modEquals = (m1: Modifier, m2: Modifier): boolean => {
  return m1.Type === m2.Type && m1.Value === m2.Value;
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

  constructor(value : number, mod : Modifier = null) {
    this.Value = value;
    this.Mod = mod;
  }
}

const applyModAttr = (attr: Attribute): number => {
  switch (attr.Mod?.Type) {
    case ModifierType.FIXED_VALUE:
      return attr.Value + attr.Mod.Value;
    case ModifierType.PERCENTAGE:
      return Math.round(attr.Value * (1 + attr.Mod.Value / 100));
    case ModifierType.MULTIPLE:
      return Math.round(attr.Value * attr.Mod.Value);
    default:
      return attr.Value;
  }
};

///region f**king "operator override"
const plusAttr = (a1: Attribute, a2: Attribute): number => {
  return applyModAttr(a1) + applyModAttr(a2);
}

const minusAttr = (a1: Attribute, a2: Attribute): number => {
  return applyModAttr(a1) - applyModAttr(a2);
}

const timesAttr = (a1: Attribute, a2: Attribute): number => {
  return applyModAttr(a1) * applyModAttr(a2);
}

const divideAttr = (a1: Attribute, a2: Attribute): number => {
  return applyModAttr(a1) / applyModAttr(a2);
}

// note: undefined = throw if mods are diff; flase = keep a2 mod instead
const plusEqualsAttr = (a1: Attribute, a2: Attribute, keep_a1_mod: boolean = undefined): Attribute => {
  const val: number = plusAttr(a1, a2);
  if (!modEquals(a1.Mod, a2.Mod)) {
    if (keep_a1_mod === undefined) {
      throw new InvalidArgumentException('a1.Mod, a2.Mod', a1.Mod, a2.Mod);
    }
    return new Attribute(val, keep_a1_mod ? a1.Mod : a2.Mod);
  }
  return new Attribute(val, a1.Mod); // a1.Mod or a2.Mod are both ok as they are equal
}

const minusEqualsAttr = (a1: Attribute, a2: Attribute, keep_a1_mod: boolean = undefined): Attribute => {
  const val: number = minusAttr(a1, a2);
  if (!modEquals(a1.Mod, a2.Mod)) {
    if (keep_a1_mod === undefined) {
      throw new InvalidArgumentException('a1.Mod, a2.Mod', a1.Mod, a2.Mod);
    }
    return new Attribute(val, keep_a1_mod ? a1.Mod : a2.Mod);
  }
  return new Attribute(val, a1.Mod); // a1.Mod or a2.Mod are both ok as they are equal
}

const timesEqualsAttr = (a1: Attribute, a2: Attribute, keep_a1_mod: boolean = undefined): Attribute => {
  const val: number = timesAttr(a1, a2);
  if (!modEquals(a1.Mod, a2.Mod)) {
    if (keep_a1_mod === undefined) {
      throw new InvalidArgumentException('a1.Mod, a2.Mod', a1.Mod, a2.Mod);
    }
    return new Attribute(val, keep_a1_mod ? a1.Mod : a2.Mod);
  }
  return new Attribute(val, a1.Mod); // a1.Mod or a2.Mod are both ok as they are equal
}

const divideEqualsAttr = (a1: Attribute, a2: Attribute, keep_a1_mod: boolean = undefined): Attribute => {
  const val: number = divideAttr(a1, a2);
  if (!modEquals(a1.Mod, a2.Mod)) {
    if (keep_a1_mod === undefined) {
      throw new InvalidArgumentException('a1.Mod, a2.Mod', a1.Mod, a2.Mod);
    }
    return new Attribute(val, keep_a1_mod ? a1.Mod : a2.Mod);
  }
  return new Attribute(val, a1.Mod); // a1.Mod or a2.Mod are both ok as they are equal
}

const ltAttr = (a1: Attribute, a2: Attribute): boolean => {
  return applyModAttr(a1) < applyModAttr(a2);
}

const leqAttr = (a1: Attribute, a2: Attribute): boolean => {
  return applyModAttr(a1) <= applyModAttr(a2);
}

const gtAttr = (a1: Attribute, a2: Attribute): boolean => {
  return applyModAttr(a1) > applyModAttr(a2);
}

const geqAttr = (a1: Attribute, a2: Attribute): boolean => {
  return applyModAttr(a1) >= applyModAttr(a2);
}

///endregion
class Cost {
  public Base : Resources;
  public Research : Resources;
  public Repair : Resources;
  public Fortification : Resources;
  public Manufacture : Resources;
  public Maintenance : Resources;
  public Recycling : Resources;

  constructor(cost?: Partial<Cost>) {
    this.Base = cost.Base;
    this.Research = cost.Research;
    this.Repair = cost.Repair;
    this.Fortification = cost.Fortification;
    this.Manufacture = cost.Manufacture;
    this.Maintenance = cost.Maintenance;
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
  public Hardness : Attribute;
  public Integrity : Attribute;
  public Suppression : Suppression;

  constructor(defense?: Partial<Defense>) {
    this.Strength = defense.Strength;
    this.Resistance = defense.Resistance;
    this.Evasion = defense.Evasion;
    this.Suppression = defense.Suppression;
    this.Integrity = defense.Integrity;
  }
}

class Suppression {
  public Threshold : Attribute;
  public Resilience : Attribute;
}

class Offense {
  public Handling : Handling;
  public Damage : Damage;
  public Accuracy : Accuracy;
  public AOE : AOE;
  public Suppression : Attribute;
  public MinRange : Attribute;
  public MaxRange : Attribute;
  public IsDirectFire : boolean;

  constructor(offense?: Partial<Offense>) {
    this.Handling = offense.Handling;
    this.Damage = offense.Damage;
    this.Accuracy = offense.Accuracy;
    this.AOE = offense.AOE;
    this.Suppression = offense.Suppression;
    this.MinRange = offense.MinRange;
    this.MaxRange = offense.MaxRange;
    this.IsDirectFire = offense.IsDirectFire;
  }
}

class Handling {
  public Cyclic : Attribute;
  public Clip : Attribute;
  public Reload : Attribute;
  public Aim : Attribute;
  public Salvo : Attribute;
  public ROF : number;
  public ROFSuppress : number;
}

class Accuracy {
  public Normal : Attribute;
  public Suppress : Attribute;
  public Deviation : Attribute;
}

class AOE {
  public BlastRadius : Attribute;
  public SplashDecay : Attribute;
}

class Damage {
  public Soft : Attribute;
  public Hard : Attribute;
  public Destruction : Attribute;
  public Deviation : Attribute;
  public Dropoff : Attribute;
  public Penetration ?: Attribute;
}
class Load {
  public Units : Unit[] = [];
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

class Scouting {
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
  pointEquals,
  Resources,
  consumeResources,
  produceResources,
  Attribute,
  plusAttr,
  minusAttr,
  timesAttr,
  divideAttr,
  plusEqualsAttr,
  minusEqualsAttr,
  timesEqualsAttr,
  divideEqualsAttr,
  ltAttr,
  leqAttr,
  gtAttr,
  geqAttr,
  applyModAttr,
  Modifier,
  ModifierType,
  applyMod,
  modEquals,
  TerrainModifiers,
  Cost,
  Maneuverability,
  Defense,
  Offense,
  Load,
  Scouting
};
