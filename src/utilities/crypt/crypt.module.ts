import { Module } from "@nestjs/common";
import { CryptService } from "./crypt.service";
import { ConfigService } from "@nestjs/config";

@Module({
    providers: [CryptService, ConfigService],
    exports: [CryptService],
})
export class CryptModule {}