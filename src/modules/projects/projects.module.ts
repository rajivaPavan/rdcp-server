import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './projects.schema';
import { ProjectRepository } from './projects.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthModule, jwtModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
        jwtModule
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService, ProjectRepository]
})
export class ProjectsModule { }
