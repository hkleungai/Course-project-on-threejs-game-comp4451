import { Customizable } from './research';
import {
  Attribute
} from '../attr';

class Shell extends Customizable {
  public Penetration : Attribute;
  public PenetrationDeviation : Attribute;
  public AmmoConsumption : Attribute;
  public Dropoff : () => void;
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

