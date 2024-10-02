import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { AuthGuard } from "src/auth/auth.guard";
import { AuthenticatedUser } from "src/auth/entities/authenticated-user";
import { AddCollaboratorsDto } from "./dtos/add-collaborators.dto";
import { CollaboratorDto } from "./dtos/collaborator.dto";
import { ProjectRoleEnum } from "./entities/project-role.enum";
import { User } from "src/users/decorators/user.decorator";
import { UsersService } from "src/users/users.service";


@UseGuards(AuthGuard)
@Controller('projects/:projectId/collaborators')
export class CollaboratorsController {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly usersService: UsersService,
    ) { }


    // This endpoint will return all collaborators of a project
    @Get()
    async getCollaborators(
        @Param('projectId') projectId: string,
        @User() user: AuthenticatedUser,
    ): Promise<CollaboratorDto[]> {
        let collaborators = await this.projectsService.getCollaborators(projectId);
        const collaboratorDetails = await Promise.all(collaborators.map(async collaborator => {
            let user = await this.usersService.findUser(collaborator.userId);
            return {
                userId: collaborator.userId,
                email: user,
                roles: collaborator.roles
            }
        }));
        return collaboratorDetails;
    }

    @Post()
    async addCollaborators(
        @Param('projectId') projectId: string,
        @Body() collaboratorsDTO: AddCollaboratorsDto,
        @User() user: AuthenticatedUser,
    ): Promise<any> {
        await this.projectsService.addCollaborators(projectId,
            collaboratorsDTO, user.id);
        return { message: 'Collaborators added successfully', success: true };
    }

    // Update collaborator roles
    @Patch('/:collaboratorId')
    async updateCollaboratorRoles(
        @Param('projectId') projectId: string,
        @Param('collaboratorId') collaboratorId: string,
        @Body('roles') roles: ProjectRoleEnum[],
        @User() user: AuthenticatedUser,
    ): Promise<any> {
        await this.projectsService.updateCollaboratorRoles(
            projectId,
            collaboratorId,
            roles,
            user.id,
        );
        return {
            message: 'Collaborator roles updated successfully',
            success: true,
        };
    }
    // Remove a collaborator from a project
    @Delete('/:collaboratorId')
    async removeCollaborator(
        @Param('projectId') projectId: string,
        @Param('collaboratorId') collaboratorId: string,
        @User() user: AuthenticatedUser,
    ): Promise<any> {
        await this.projectsService.removeCollaborator(
            projectId,
            collaboratorId,
            user.id,
        );
        return { message: 'Collaborator removed successfully', success: true };
    }

}