interface IException {
  argName: string,
  argValues: unknown[],
}

class InvalidArgumentException extends Error {
  constructor(
    argName: IException['argName'],
    ...argValues: IException['argValues']
  ) {
    super(`${argName} is ${argValues}`);
    this.name = 'InvalidArgumentException';
  }
}

class InsufficientResourcesException extends Error {
  constructor(
    resName: IException['argName'],
    ...argValue: IException['argValues']
  ) {
    super(`Lack of ${resName}: have ${argValue[0]}, need ${argValue[1]}`);
    this.name = 'InsufficientResourcesException';
  }
}

export {
  InvalidArgumentException,
  InsufficientResourcesException
};
