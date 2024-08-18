import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CollaboratorDTO, ProjectDTO, UpdateCollaboratorsDTO } from './projects.dtos';
import { AuthGuard } from '../auth/auth.guard';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // This endpoint will create a new project
    @UseGuards(AuthGuard)
    @Post()
    async createProject(@Body() project: ProjectDTO,
        @Req() req): Promise<ProjectDTO> {
        const userId = req.user.sub;
        return await this.projectsService.create(project, userId);
    }

    // This endpoint will return all projects where the user is a collaborator
    @UseGuards(AuthGuard)
    @Get()
    async getProjects(@Req() req) : Promise<ProjectDTO[]> {
        const userId = req.user.sub;
        return await this.projectsService.getProjectsOfUser(userId);
    }

    // This endpoint will return a specific project
    @UseGuards(AuthGuard)
    @Get("/:id")
    async getProject(@Param('id') id: string, @Req() req): Promise<ProjectDTO> {
        // TODO: Get the userId from the request
        const userId = req.user.sub;
        return await this.projectsService.getProject(id, userId);
    }

    // TODO: Add Owner Policy Guard
    // This endpoint will return all collaborators of a project
    @Get("/collaborators/:projectId")
    async getCollaborators(@Param('projectId') projectId: string): Promise<CollaboratorDTO[]> {
        return await this.projectsService.getCollaborators(projectId);
    }

    // TODO: Add Owner Policy Guard
    @Post("/collaborators")
    async addCollaborators(@Body() collaboratorsDTO: UpdateCollaboratorsDTO): Promise<any> {
        await this.projectsService.addCollaborators(collaboratorsDTO);
        return { message: "Collaborators added successfully", success: true };
    }

}
