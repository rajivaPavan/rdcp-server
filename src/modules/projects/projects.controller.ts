import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CollaboratorDTO, CreateDTO, ProjectDTO, UpdateCollaboratorsDTO } from './projects.dtos';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    // This endpoint will create a new project
    @Post()
    async createProject(@Body() createDTO: CreateDTO): Promise<ProjectDTO> {
        const { project, userId } = createDTO;
        return await this.projectsService.create(project, userId);
    }

    // This endpoint will return all projects where the user is a collaborator
    @Get('/user/:userId')
    async getProjects(@Param('userId') userId: string): Promise<ProjectDTO[]> {
        return await this.projectsService.getProjectsOfUser(userId);
    }

    // This endpoint will return a specific project
    @Get("/:id")
    async getProject(@Param('id') id: string): Promise<ProjectDTO> {
        // TODO: Get the userId from the request
        const userId = "userId";
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
    async addCollaborators(@Body() collaboratorsDTO : UpdateCollaboratorsDTO ): Promise<any> {
        await this.projectsService.addCollaborators(collaboratorsDTO);
        return {message: "Collaborators added successfully", success: true};
    }

}
