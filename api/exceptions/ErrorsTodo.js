import { TodoException } from "./TodoException.js";

export class InvalidId extends TodoException {
  constructor(statusCode, message) {
    super(statusCode, message);
  }
}

export class TodoNotFound extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class TodoNotValid extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
