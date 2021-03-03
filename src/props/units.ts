import { Prop } from './prop';
import {
    Point,
    Attribute,
    Cost,
    Maneuverability,
    Defense,
    Offense,
    Resources,
    Spotting,
} from '../attr';
import { Firearm, Module } from '../research';

class Unit extends Prop {
    private _name : string;
    private _coords : Point;
    private _cost : Cost;
    private _maneuverability : Maneuverability;
    private _defense : Defense;
    private _offense : Offense;
    private _consumption : Resources;
    private _capacity : Resources;
    private _spotting : Spotting;
    private _morale : Attribute;

    constructor(unit? : Partial<Unit>) {
        super();
        this._name = unit.Name;
        this._coords  = unit.Coords;
        this._cost  = unit.Cost;
        this._maneuverability  = unit.Maneuverability;
        this._defense  = unit.Defense;
        this._offense  = unit.Offense;
        this._consumption  = unit.Consumption;
        this._capacity  = unit.Capacity;
        this._spotting  = unit.Spotting;
        this._morale  = unit.Morale;
    }

    //#region get/set
    get Name() : string { return this._name; }
    set Name(value : string) { this._name = value; }
    get Coords() : Point { return this._coords; }
    set Coords(value : Point) { this._coords = value; }
    get Cost() : Cost { return this._cost; }
    set Cost(value : Cost) { this._cost = value; }
    get Maneuverability() : Maneuverability { return this._maneuverability; }
    set Maneuverability(value : Maneuverability) { this._maneuverability = value; }
    get Defense() : Defense { return this._defense; }
    set Defense(value : Defense) { this._defense = value; }
    get Offense() : Offense { return this._offense; }
    set Offense(value : Offense) { this._offense = value; }
    get Consumption() : Resources { return this._consumption; }
    set Consumption(value : Resources) { this._consumption = value; }
    get Capacity() : Resources { return this._capacity; }
    set Capacity(value : Resources) { this._capacity = value; }
    get Spotting() : Spotting { return this._spotting; }
    set Spotting(value : Spotting) { this._spotting = value; }
    get Morale() : Attribute { return this._morale; }
    set Morale(value : Attribute) { this._morale = value; }
    //#endregion
}

class Personnel extends Unit {
    private _primary_firearm : Firearm;
    private _secondary_firearm : Firearm;
    private _capture : Attribute;

    constructor(personnel? : Partial<Personnel>) {
        super(personnel);

    }
}

class Artillery extends Unit {

}

class Vehicle extends Unit {

}

class Vessel extends Unit {

}

class Plane extends Unit {

}

export {
    Unit,
    Personnel,
    Artillery,
    Vehicle,
    Vessel,
    Plane
}
