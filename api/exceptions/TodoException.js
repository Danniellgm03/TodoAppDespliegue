export class TodoException extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}