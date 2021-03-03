import { Cost, Attribute } from './attr';
class Technology {
    constructor(name : string, prerquisite : Technology, buff_aspect, buff_amount, research_cost) {

    }
}

class Customizable {
    constructor(name : string, cost : Cost) {

    }
}

class Firearm extends Customizable {
    constructor(name : string, cost : Cost,
                cyclic : Attribute, firepwr : Attribute ) {
        super(name, cost);
    }
}

class Module extends Customizable {

}

class Shell extends Customizable {

}

export {
    Technology,
    Customizable,
    Firearm,
    Module,
    Shell
}
