import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import { FormsService } from 'src/forms/forms.service';
import { UsersService } from 'src/users/users.service';
import { CollaboratorDto } from './dtos/collaborator.dto';

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly formsService: FormsService,
    private readonly usersService: UsersService,
  ) { }

  private readonly logger = new Logger('ProjectsController');

  // This endpoint will create a new project
  @Post()
  async createProject(
    @Body() project: CreateProjectDto,
    @User() user,
  ): Promise<ProjectDTO> {
    return await this.projectsService.create(project, user);
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
    let project = await this.projectsService.getProject(id, user.id);

    if (!_withForms)
      return project;

    const forms = withForms
      ? await this.formsService.getForms(project.id, user.id)
      : undefined;

    return {
      ...project,
      forms
    }
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
