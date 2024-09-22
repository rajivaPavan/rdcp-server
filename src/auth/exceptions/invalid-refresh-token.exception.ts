import { UnauthorizedException } from "@nestjs/common";

export class InvalidRefreshToken extends UnauthorizedException {
    constructor() {
        super('Invalid Refresh Token');
    }

    static withMessage(message: string) {
        return new UnauthorizedException(message);
    }
}