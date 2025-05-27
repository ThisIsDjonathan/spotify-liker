/* eslint-disable @typescript-eslint/no-explicit-any */
interface AppErrorInterface {
    error?: any | Error;
    statusCode?: number;
}

export class AppError extends Error {
  public readonly statusCode: number;

  constructor({ error, statusCode = 500 }: AppErrorInterface) {
    super(error);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
