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

export { InvalidArgumentException };
