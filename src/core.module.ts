import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { EmailModule } from "./email/email.module";
import { ProjectsModule } from "./projects/projects.module";
import { FormsModule } from "./forms/forms.module";
import { ResponsesModule } from "./responses/responses.module";
import { UsersModule } from "./users/users.module";
import { AuthorizationModule } from "./authorization/authorization.module"
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypedEventEmitterModule } from "./common/event-emitter/type-event-emitter.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Module({
    imports: [
        AuthorizationModule,
        EventEmitterModule.forRoot(),
        TypedEventEmitterModule,
        UsersModule,
        AuthModule,
        ProjectsModule,
        FormsModule,
        ResponsesModule
    ]
})
export class CoreModule { }