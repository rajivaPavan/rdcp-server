import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateDTO, ProjectDTO } from './projects.dtos';

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
        return await this.projectsService.getProject(id);
    }

}
