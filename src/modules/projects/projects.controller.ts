import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CollaboratorDTO, ProjectDTO, AddCollaboratorsDTO } from './projects.dtos';
import { AuthGuard } from '../auth/auth.guard';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // This endpoint will create a new project
    @UseGuards(AuthGuard)
    @Post()
    async createProject(@Body() project: ProjectDTO,
        @Req() req): Promise<ProjectDTO> {
        const userId = req.user.id;
        return await this.projectsService.create(project, userId);
    }

    // This endpoint will return all projects where the user is a collaborator
    @UseGuards(AuthGuard)
    @Get()
    async getProjects(@Req() req): Promise<ProjectDTO[]> {
        const userId = req.user.id;
        return await this.projectsService.getProjectsOfUser(userId);
    }

    // This endpoint will return a specific project
    @UseGuards(AuthGuard)
    @Get("/:id")
    async getProject(@Param('id') id: string,
        // withForms is a string because it is a query parameter
        @Query('forms') withForms: string | undefined,
        @Req() req): Promise<ProjectDTO> {
        const userId = req.user.id;
        // If withForms is not provided, it will be true by default
        // If withForms is provided and is 'false', it will be false
        // if withForms is provide and it not 'false', it will be true
        const _withForms = withForms === undefined ? true : withForms !== 'false';
        return await this.projectsService.getProject(id, userId, _withForms);
    }

    // This endpoint will return all collaborators of a project
    @Get("/collaborators/:projectId")
    async getCollaborators(@Param('projectId') projectId: string): Promise<CollaboratorDTO[]> {
        // return await this.projectsService.getCollaborators(projectId);
        throw new Error("Not implemented");
    }

    // This endpoint will add collaborators to a project
    @Post("/collaborators")
    async addCollaborators(@Body() collaboratorsDTO: AddCollaboratorsDTO, @Req() req): Promise<any> {
        const userId = req.user.id;
        await this.projectsService.addCollaborators(collaboratorsDTO, userId);
        return { message: "Collaborators added successfully", success: true };
    }

    /// Update endpoint for project
    @Patch("/:id")
    async updateProject(@Param('id') id: string, @Body() project: ProjectDTO, @Req() req): Promise<any> {
        const userId = req.user.id;
        await this.projectsService.updateProject(id, project, userId);
        return { message: "Project updated successfully", success: true };
    }

    @Delete("/:id")
    async deleteProject(@Param('id') id: string, @Req() req): Promise<any> {
        const userId = req.user.id;
        await this.projectsService.deleteProject(id, userId);
        return { message: "Project deleted successfully", success: true };
    }

}
