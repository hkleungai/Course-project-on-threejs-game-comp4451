import { Resources } from './attr';
// import { Cities } from './props';
import { Building } from './props/buildings';
import { Unit } from './props/units';
import { Technology, Customizable } from './researches';

enum PlayerColor {
  RED = 0,
  YELLOW = 1,
  BLUE = 2,
  GREEN = 3
}

class Player {
  public Name : string;
  public Color : PlayerColor;
  public IsAI : boolean;
  public Resources : Resources;
  public Buildings : Building[];
  public Researches : Technology[];
  public Customizables : Customizable[];

  constructor(player?: Partial<Player>) {
    this.Name = player.Name;
    this.Color = player.Color;
    this.IsAI = player.IsAI;
    this.Resources = player.Resources;
    this.Buildings = player.Buildings;
    this.Researches = player.Researches;
    this.Customizables = player.Customizables;
  }
}

const playerEquals = (p1: Player, p2: Player): boolean => {
  return p1.Name === p2.Name && p1.Color === p2.Color;
}

export {
  PlayerColor,
  Player,
  playerEquals
};
