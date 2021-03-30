import { Resources } from './attr';
import { Cities } from './props';
import { Building } from './props/buildings';
import { Unit } from './props/units';
import { Technology, Customizable } from './researches';

enum Color {
  RED = 0,
  YELLOW = 1,
  BLUE = 2,
  GREEN = 3
}

class Player {
  public readonly Name : string;
  public readonly Color : Color;
  public readonly isAI : boolean;
  public Resources : Resources;
  public Units : Unit[];
  public Buildings : Building[];
  public Researches : Technology[];
  public Customizables : Customizable[];

  constructor(
    name : string,
    color : Color,
    resources : Resources,
    isAI : boolean,
    units : Unit[],
    buildings : Building[],
    research : Technology[],
    customizables : Customizable[]
  ) {
    this.Name = name;
    this.Color = color;
    this.isAI = isAI;
    this.Resources = resources;
    this.Units = units;
    this.Buildings = buildings;
    this.Researches = research;
    this.Customizables = customizables;
  }
}

export {
  Color,
  Player
};
