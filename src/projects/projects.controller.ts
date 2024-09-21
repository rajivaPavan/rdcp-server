import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectDTO } from './dtos/project.dtos';
import { AuthGuard } from '../auth/auth.guard';
import { CreateProjectDto } from './dtos/create-project.dto';
import { AddCollaboratorsDto } from './dtos/add-collaborators.dto';
import { User } from '../users/decorators/user.decorator';
import { AuthenticatedUser } from '../auth/entities/authenticated-user';
import { ProjectRoleEnum } from './entities/project-role.enum';

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  private readonly logger = new Logger('ProjectsController');

  // This endpoint will create a new project
  @Post()
  async createProject(
    @Body() project: CreateProjectDto,
    @User() user,
  ): Promise<ProjectDTO> {
    return await this.projectsService.create(project, user.id);
  }

  // This endpoint will return all projects where the user is a collaborator
  @Get()
  async getProjects(@User() user): Promise<ProjectDTO[]> {
    this.logger.debug(`Getting projects of user ${user.id}`);
    return await this.projectsService.getProjectsOfUser(user.id);
  }

  // This endpoint will return a specific project
  @Get('/:id')
  async getProject(
    @Param('id') id: string,
    // withForms is a string because it is a query parameter
    @Query('forms') withForms: string | undefined,
    @User() user: AuthenticatedUser,
  ): Promise<ProjectDTO> {
    this.logger.debug(`Getting project with id ${id}`);

    // If withForms is not provided, it will be true by default
    // If withForms is provided and is 'false', it will be false
    // if withForms is provide and it not 'false', it will be true
    const _withForms = withForms === undefined ? true : withForms !== 'false';
    return await this.projectsService.getProject(id, user.id, _withForms);
  }

  // This endpoint will return all collaborators of a project
  @Get('/:projectId/settings')
  async getCollaborators(
    @Param('projectId') projectId: string,
    @User() user: AuthenticatedUser,
  ): Promise<AddCollaboratorsDto[]> {
    return await this.projectsService.getCollaborators(projectId);
  }

  // Add collaborators to a project by email
  @Post('/:projectId/settings')
  async addCollaborators(
    @Param('projectId') projectId: string,
    @Body() collaboratorsDTO: AddCollaboratorsDto,
    @User() user: AuthenticatedUser,
  ): Promise<any> {
    await this.projectsService.addCollaboratorsByEmail(
      projectId,
      collaboratorsDTO,
      user.id,
    );
    return { message: 'Collaborators added successfully', success: true };
  }

  // Update collaborator roles
  @Patch('/:projectId/settings/:collaboratorId')
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
  @Delete('/:projectId/settings/:collaboratorId')
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

  /// Update endpoint for project
  @Patch()
  async updateProject(
    @Body() project: ProjectDTO,
    @User() user: AuthenticatedUser,
  ): Promise<any> {
    await this.projectsService.updateProject(project, user.id);
    return { message: 'Project updated successfully', success: true };
  }

  @Delete('/:projectId')
  async deleteProject(
    @Param('projectId') projectId: string,
    @User() user: AuthenticatedUser,
  ): Promise<any> {
    console.log('projectId', projectId);
    await this.projectsService.deleteProject(projectId, user.id);
    return { message: 'Project deleted successfully', success: true };
  }
}
