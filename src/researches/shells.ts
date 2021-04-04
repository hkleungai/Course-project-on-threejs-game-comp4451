import { Customizable } from './research';
import {
  Modifier
} from '../attr';

abstract class Shell extends Customizable {
  public PenetrationCoefficient : Modifier;
  public PenetrationDeviation : Modifier;
  public AOEModifier : Modifier;
  public SplashDecayModifier : Modifier;
  public DropoffModifier : Modifier;
}

class AP extends Shell {

}

class HE extends Shell {

}

export {
  Shell,
  AP,
  HE,
};

