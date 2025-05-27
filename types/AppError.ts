/* eslint-disable @typescript-eslint/no-explicit-any */
interface AppErrorInterface {
  message: any | Error;
  statusCode?: number;
}

export class AppError extends Error {
  public readonly statusCode: number;

  constructor({ message, statusCode = 500 }: AppErrorInterface) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
