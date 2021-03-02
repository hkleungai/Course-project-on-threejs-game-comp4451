"use strict";

class Point {
    private _x : number;
    private _y : number;

    constructor(x : number, y : number) {
        if (Number.isInteger(x) && Number.isInteger(y)) {
            this._x = x;
            this._y = y;
        } else {
            throw new InvalidArgumentException('coodrinates', x, y);
        }      
    }

    get X() : number { return this._x };
    set X(x : number) { 
        if (Number.isInteger(x)) {
            this._x = x;
        } else {
            throw new InvalidArgumentException('coodrinates_x', x);
        }
    }
    get Y() : number { return this._y };
    set Y(y : number) { 
        if (Number.isInteger(y)) {
            this._y = y;
        } else {
            throw new InvalidArgumentException('coodrinates_y', y);
        }
    }
}

class Resources {
    private _money : Attribute;
    private _steel : Attribute;
    private _supplies : Attribute;
    private _ammo : Attribute;
    private _fuel : Attribute;
    private _raremetal : Attribute;
    private _manpower : Attribute;
    private _power : Attribute;

    constructor(resources? : Partial<Resources>) {
        if (Number.isInteger(resources.Money?.Value ?? 0)) {
            this._money = resources?.Money;
        } else {
            throw new InvalidArgumentException('money', resources.Money);
        } 
        if (Number.isInteger(resources.Steel?.Value ?? 0)) {
            this._steel = resources?.Steel;
        } else {
            throw new InvalidArgumentException('steel', resources.Steel);
        } 
        if (Number.isInteger(resources.Supplies?.Value ?? 0)) {
            this._supplies = resources.Supplies;
        } else {
            throw new InvalidArgumentException('supplies', resources.Supplies);
        } 
        if (Number.isInteger(resources.Ammo?.Value ?? 0)) {
            this._ammo = resources.Ammo;
        } else {
            throw new InvalidArgumentException('ammo', resources.Ammo);
        } 
        if (Number.isInteger(resources.Fuel?.Value ?? 0)) {
            this._fuel = resources.Fuel;
        } else {
            throw new InvalidArgumentException('fuel', resources.Fuel);
        } 
        if (Number.isInteger(resources.RareMetal?.Value ?? 0)) {
            this._raremetal = resources.RareMetal;
        } else {
            throw new InvalidArgumentException('rare_metal', resources.RareMetal);
        } 
        if (Number.isInteger(resources.Manpower?.Value ?? 0)) {
            this._manpower = resources.Manpower;
        } else {
            throw new InvalidArgumentException('manpower', resources.Manpower);
        }     
        if (Number.isInteger(resources.Power?.Value ?? 0)) {
            this._power = resources.Power;
        } else {
            throw new InvalidArgumentException('power', resources.Power);
        } 
    }
    
    //#region get/set
    get Money() : Attribute { return this._money; }
    set Money(value : Attribute) { this._money = value; }
    get Steel() : Attribute { return this._steel; }
    set Steel(value : Attribute) { this._steel = value; }
    get Supplies() : Attribute { return this._supplies; }
    set Supplies(value : Attribute) { this._supplies = value; }
    get Ammo() : Attribute { return this._ammo; }
    set Ammo(value : Attribute) { this._ammo = value; }
    get Fuel() : Attribute { return this._fuel; }
    set Fuel(value : Attribute) { this._fuel = value; }
    get RareMetal() : Attribute { return this._raremetal; }
    set RareMetal(value : Attribute) { this._raremetal = value; }
    get Manpower() : Attribute { return this._manpower; }
    set Manpower(value : Attribute) { this._manpower = value; }
    get Power() : Attribute { return this._power; }
    set Power(value : Attribute) { this._power = value; }

    Consume(resources : Resources) {
        
    }
    Produce(resources : Resources) {

    }
    //#endregion
}

enum ModifierType { 
    FIXED_VALUE = 0, 
    PERCENTAGE = 1 
};

class Modifier {
    private _type : ModifierType;
    private _value : number;

    constructor(type : ModifierType, value : number) {
        this._type = type;
        this._value = value;
    }

    //#region get/set
    get Value() : number { return this._value; }
    set Value(value : number) { this._value = value; }
    get Type() : ModifierType { return this._type; }
    set Type(value : ModifierType) { this._type = value; }
    //#endregion
}

class TerrainModifiers {
    private _camouflage : Modifier;
    private _supplies : Modifier;
    private _fuel : Modifier;

    constructor(camo : Modifier, supplies : Modifier, fuel : Modifier) {
        this._camouflage = camo;
        this._supplies = supplies;
        this._fuel = fuel;
    }
    get Camo() : Modifier { return this._camouflage; }
    set Camo(value : Modifier) { this._camouflage = value; }
    get Supplies() : Modifier { return this._supplies; }
    set Supplies(value : Modifier) { this._supplies = value; }
    get Fuel() : Modifier { return this._fuel; }
    set Fuel(value : Modifier) { this._fuel = value; }
}

class Attribute {
    private _value : number;
    private _mod : Modifier;

    constructor(value : number, mod : Modifier) {
        this._value = value;
        this._mod = mod;
    }

    //#region get/set
    get Value() : number { return this._value; }
    set Value(value : number) { this._value = value; }
    get Mod() : Modifier { return this._mod; }
    set Mod(value : Modifier) { this._mod = value; }
    //#endregion

    Apply() : number {
        switch (this._mod.Type) {
            case ModifierType.FIXED_VALUE:
                return this._value + this._mod.Value;
            case ModifierType.PERCENTAGE:
                return Math.round(this._value * (1 + this._mod.Value));
        }
    }
}

class Cost {
    private _base : Resources;
    private _research : Resources;
    private _repair : Resources;
    private _fortification : Resources;
    private _manufacture : Resources;
    private _recycling : Resources;

    constructor(cost? : Partial<Cost>) {
        this._base = cost.Base;
        this._research = cost.Research;
        this._repair = cost.Repair;
        this._fortification = cost.Fortification;
        this._manufacture = cost.Manufacture;
        this._recycling = cost.Recycling;
    }

    //#region get/set
    get Base() : Resources { return this._base; }
    set Base(value : Resources) { this._base = value; }
    get Research() : Resources { return this._research; }
    set Research(value : Resources) { this._research = value; }
    get Repair() : Resources { return this._repair; }
    set Repair(value : Resources) { this._repair = value; }
    get Fortification() : Resources { return this._fortification; }
    set Fortification(value : Resources) { this._fortification = value; }
    get Manufacture() : Resources { return this._manufacture; }
    set Manufacture(value : Resources) { this._manufacture = value; }
    get Recycling() : Resources { return this._recycling; }
    set Recycling(value : Resources) { this._recycling = value; }
    //#endregion
}

class Maneuverability {
    private _speed : Attribute;
    private _mobility : Attribute;
    private _size : Attribute;

    constructor(maneuver? : Partial<Maneuverability>) {
        this._speed = maneuver.Speed;
        this._mobility = maneuver.Mobility;
        this._size = maneuver.Size;
    }

    //#region get/set
    get Speed() : Attribute { return this._speed; }
    set Speed(value : Attribute) { this._speed = value; }
    get Mobility() : Attribute { return this._mobility; }
    set Mobility(value : Attribute) { this._mobility = value; }
    get Size() : Attribute { return this._size; }
    set Size(value : Attribute) { this._size = value; }
    //#endregion
}

class Defense {
    private _strength : Attribute;
    private _resistance : Attribute;
    private _evasion : Attribute;
    private _suppression_threshold : Attribute;
    private _durability : Attribute;
    private _integrity : Attribute;

    constructor(defense? : Partial<Defense>) {
        this._strength = defense.Strength;
        this._resistance = defense.Resistance;
        this._evasion = defense.Evasion;
        this._suppression_threshold = defense.SuppressionThreshold;
        this._durability = defense.Durability;
        this._integrity = defense.Integrity;
    }

    //#region get/set
    get Strength() : Attribute { return this._strength; }
    set Strength(value : Attribute) { this._strength = value; }
    get Resistance() : Attribute { return this._resistance; }
    set Resistance(value : Attribute) { this._resistance = value; }
    get Evasion() : Attribute { return this._evasion; }
    set Evasion(value : Attribute) { this._evasion = value; }
    get SuppressionThreshold() : Attribute { return this._suppression_threshold; }
    set SuppressionThreshold(value : Attribute) { this._suppression_threshold = value; }
    get Durability() : Attribute { return this._durability; }
    set Durability(value : Attribute) { this._durability = value; }
    get Integrity() : Attribute { return this._integrity; }
    set Integrity(value : Attribute) { this._integrity = value; }
    //#endregion
}

class Offense {
    private _cyclic : Attribute;
    private _firepower : Attribute;
    private _destruction_power : Attribute;
    private _damage_deviation : Attribute;
    private _damage_dropoff : Attribute;
    private _rof : Attribute;
    private _salvo : Attribute;
    private _suppression : Attribute;
    private _range : Attribute;
    private _accurarcy : Attribute;
    private _accurarcy_deviation : Attribute;
    private _aoe : Attribute;
    private _splash_decay : Attribute;
    private _is_direct_fire : boolean;

    constructor(offense? : Partial<Offense>) {
        this._cyclic = offense.Cyclic;
        this._firepower = offense.Firepower;
        this._destruction_power = offense.DestructionPower;
        this._damage_deviation = offense.DamageDeviation;
        this._damage_dropoff = offense.DamageDropoff;
        this._rof = offense.ROF;
        this._salvo = offense.Salvo;
        this._suppression = offense.Suppression;
        this._range = offense.Range;
        this._accurarcy = offense.Accurarcy;
        this._accurarcy_deviation = offense.AccurarcyDeviation;
        this._aoe = offense.AOE;
        this._splash_decay = offense.SplashDecay;
        this._is_direct_fire = offense.IsDirectFire;
    }

    //#region get/set
    get Cyclic() : Attribute { return this._cyclic; }
    set Cyclic(value : Attribute) { this._cyclic = value; }
    get Firepower() : Attribute { return this._firepower; }
    set Firepower(value : Attribute) { this._firepower = value; }
    get DestructionPower() : Attribute { return this._destruction_power; }
    set DestructionPower(value : Attribute) { this._destruction_power = value; }
    get DamageDeviation() : Attribute { return this._damage_deviation; }
    set DamageDeviation(value : Attribute) { this._damage_deviation = value; }
    get DamageDropoff() : Attribute { return this._damage_dropoff; }
    set DamageDropoff(value : Attribute) { this._damage_dropoff = value; }
    get ROF() : Attribute { return this._rof; }
    set ROF(value : Attribute) { this._rof = value; }
    get Salvo() : Attribute { return this._salvo; }
    set Salvo(value : Attribute) { this._salvo = value; }
    get Suppression() : Attribute { return this._suppression; }
    set Suppression(value : Attribute) { this._suppression = value; }
    get Range() : Attribute { return this._range; }
    set Range(value : Attribute) { this._range = value; }
    get Accurarcy() : Attribute { return this._accurarcy; }
    set Accurarcy(value : Attribute) { this._accurarcy = value; }
    get AccurarcyDeviation() : Attribute { return this._accurarcy_deviation; }
    set AccurarcyDeviation(value : Attribute) { this._accurarcy_deviation = value; }
    get AOE() : Attribute { return this._aoe; }
    set AOE(value : Attribute) { this._aoe = value; }
    get SplashDecay() : Attribute { return this._splash_decay; }
    set SplashDecay(value : Attribute) { this._splash_decay = value; }
    get IsDirectFire() : boolean { return this._is_direct_fire; }
    set IsDirectFire(value : boolean) { this._is_direct_fire = value; }
    //#endregion
}

class Load {
    private _units : Unit[];
    private _resources : Resources;

    constructor(units : Unit[], resources : Resources) {
        this._units = units;
        this._resources = resources;
    }

    //#region get/set
    get Units() : Unit[] { return this._units; }
    set Units(value : Unit[]) { this._units = value; }
    get Resources() : Resources { return this._resources; }
    set Resources(value : Resources) { this._resources = value; }
    //#endregion

    public AddUnit(unit : Unit) { this._units.push(unit); }
    public RemoveUnit(unit : Unit) {
        this._units.forEach((u, i) => {
            if (u === unit) this._units.splice(i, 1);
        });
    }
}

class Spotting {
    private _reconnaissance : Attribute;
    private _camouflage : Attribute;
    private _detection : Attribute;
    private _communication : Attribute;

    constructor(recon : Attribute, camo : Attribute, detect : Attribute, comm : Attribute) {
        this._reconnaissance = recon;
        this._camouflage = camo;
        this._detection = detect;
        this._communication = comm;
    }

    //#region get/set
    get Reconnaissance() : Attribute { return this._reconnaissance; }
    set Reconnaissance(value : Attribute) { this._reconnaissance = value; }
    get Camouflage() : Attribute { return this._camouflage; }
    set Camouflage(value : Attribute) { this._camouflage = value; }
    get Detection() : Attribute { return this._detection; }
    set Detection(value : Attribute) { this._detection = value; }
    get Communication() : Attribute { return this._communication; }
    set Communication(value : Attribute) { this._communication = value; }
    //#endregion

}