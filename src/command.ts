import { Point } from './attr';
class Command {
    public Source : Point;
    public Destination : Point;
    protected Execute?() : void;
}

class Move extends Command {
    public Execute() {
        
    }
}

class Fire extends Command {

}

class Capture extends Command {

}

export {
    Command
}