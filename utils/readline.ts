import * as readline from 'readline';

export class Readline {
  private readlineInterface: readline.Interface;

  constructor() {
    this.readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  public enterValue(valueName: string): Promise<string> {
    return new Promise((resolve) => {
      this.readlineInterface.question(
        `Enter ${valueName}: `,
        (enteredApiKey) => {
          resolve(enteredApiKey);
        }
      );
    });
  }

  public close() {
    this.readlineInterface.close();
  }
}
