import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectRepository } from './projects.repository';
import { Project } from './entities/project.schema';
import { Types } from 'mongoose';
import { ProjectDTO } from './dtos/project.dtos';
import { CollaboratorsRepository } from './collaborators.repository';
import { FormsService } from '../forms/forms.service';
import { CreateProjectDto } from './dtos/create-project.dto';
import { ProjectRoleEnum } from './entities/project-role.enum';
import { AddCollaboratorsDto } from "./dtos/add-collaborators.dto";

@Injectable()
export class ProjectsService {
  constructor(
    private readonly formService: FormsService,
    private readonly projectRepository: ProjectRepository,
    private readonly collaboratorRepository: CollaboratorsRepository,
  ) {}

  private async findProjectOrFail(projectId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException();
    }
    return project;
  }

  private async authorizeUser(
    projectId: string,
    userId: string,
    requiredRole: ProjectRoleEnum,
  ): Promise<void> {
    const collaborator = await this.collaboratorRepository.findOne({
      project: new Types.ObjectId(projectId),
      user: new Types.ObjectId(userId),
    });
    if (!collaborator || !collaborator.roles.includes(requiredRole)) {
      throw new UnauthorizedProjectAccessException();
    }
  }

  async getProject(
    projectId: string,
    userId: string,
    withForms?: boolean,
  ): Promise<ProjectDTO> {
    const project = await this.findProjectOrFail(projectId);

    const collaborator = await this.collaboratorRepository.findOne({
      project: project._id,
      user: new Types.ObjectId(userId),
    });

    const forms = withForms
      ? await this.formService.getForms(projectId, userId)
      : undefined;

    return {
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      roles: collaborator?.roles || [],
      forms,
    };
  }

  async create(
    projectDTO: CreateProjectDto,
    userId: string,
  ): Promise<ProjectDTO> {
    const project = new Project({ ...projectDTO, _id: new Types.ObjectId() });
    const createdProject = await this.projectRepository.create(project);

    const roles = [ProjectRoleEnum.OWNER];

    await this.collaboratorRepository.create({
      project: createdProject._id,
      user: new Types.ObjectId(userId),
      roles: roles,
    });

    return {
      ...createdProject,
      id: createdProject._id.toString(),
      roles,
    };
  }

  async getProjectsOfUser(userId: string): Promise<ProjectDTO[]> {
    const userObjectId = new Types.ObjectId(userId);
    const collaborations = await this.collaboratorRepository.find({
      user: userObjectId,
    });

    const projectRoles = collaborations.reduce((acc, curr) => {
      acc[curr.project.toString()] = curr.roles;
      return acc;
    }, {});

    const projectIds = collaborations.map((collab) => collab.project);
    const projects = await this.projectRepository.find({
      _id: { $in: projectIds },
    });

    return projects.map((project) => ({
      id: project._id.toString(),
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      roles: projectRoles[project._id.toString()],
    }));
  }

  async updateProject(
    projectDTO: ProjectDTO,
    userId: string,
  ): Promise<ProjectDTO> {
    const id = projectDTO.id;
    await this.findProjectOrFail(id);
    await this.authorizeUser(id, userId, ProjectRoleEnum.OWNER);

    const updatedProject = await this.projectRepository.update(id, projectDTO);
    const collaborator = await this.collaboratorRepository.findOne({
      project: new Types.ObjectId(id),
      user: new Types.ObjectId(userId),
    });

    return {
      id: updatedProject._id.toString(),
      name: updatedProject.name,
      description: updatedProject.description,
      roles: collaborator?.roles || [],
    };
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    await this.findProjectOrFail(id);
    await this.authorizeUser(id, userId, ProjectRoleEnum.OWNER);

    await this.projectRepository.delete(id);
  }

  // TODO:
  async addCollaborators(
    collaboratorsDTO: AddCollaboratorsDto,
    userId: string,
  ): Promise<any> {
    // get the project
    const project = await this.projectRepository.findById(
      collaboratorsDTO.projectId,
    );

    if (!project) {
      throw new ProjectNotFoundException();
    }

    // Check if the user is a owner
    const collaborator = await this.collaboratorRepository.findOne({
      project: project._id,
      user: new Types.ObjectId(userId),
    });
    if (!collaborator || !collaborator.roles.includes(ProjectRoleEnum.OWNER)) {
      throw new UnauthorizedProjectAccessException();
    }

    // Add the new collaborators
    const newCollaborators = collaboratorsDTO.userIds.map((userId) => {
      return {
        project: project._id,
        user: new Types.ObjectId(userId),
        roles: collaboratorsDTO.roles,
      };
    });

    await this.collaboratorRepository.createMany(newCollaborators);
  }

  // TODO:
  async getCollaborators(projectId: string, userId: string): Promise<any> {
    const projects = await this.projectRepository.find({
      _id: new Types.ObjectId(projectId),
    });

    if (projects.length === 0) {
      throw new ProjectNotFoundException();
    }

    // Get the collaborators
    const collaborators = await this.collaboratorRepository.find({
      project: projects[0]._id,
    });

    return collaborators.map((collaborator) => ({
      userId: collaborator.user.toString(),
      roles: collaborator.roles,
    }));
  }
}

class ProjectNotFoundException extends NotFoundException {
  constructor() {
    super('Project not found');
  }
}

class UnauthorizedProjectAccessException extends UnauthorizedException {
  constructor() {
    super(
      'User does not have necesary permission to do this action in the project',
    );
  }
}
