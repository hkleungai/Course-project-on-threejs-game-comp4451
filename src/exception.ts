class InvalidArgumentException {
    public argname : string;
    public value;
    public constructor(argname : string, ...value) {
        this.argname = argname;
        this.value = value;
    }
    /**
     * toString
     */
    public toString() {
        return "InvalidArgumentException: " + this.argname + " is " + this.value;
    }
}
