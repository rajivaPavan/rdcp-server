import { BadRequestException } from "@nestjs/common";

export class EmailRequiredException extends BadRequestException {
  constructor() {
    super("Email is required");
  }
}