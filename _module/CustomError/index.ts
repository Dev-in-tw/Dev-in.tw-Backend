export class CustomError {
  errorMessage: string;

  constructor(errorMessage: string) {
    this.errorMessage = errorMessage;
  }

  default() {
    throw new Error(this.errorMessage);
  }

  func(callerFunction: { name: string }) {
    throw new Error(`[${callerFunction.name}] ${this.errorMessage}`);
  }
}
