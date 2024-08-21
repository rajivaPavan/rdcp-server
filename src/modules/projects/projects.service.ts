import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ProjectRepository } from './projects.repository';
import { Project, ProjectRoleEnum } from './projects.schema';
import { Types } from 'mongoose';
import { ProjectDTO, AddCollaboratorsDTO } from './projects.dtos';
import { CollaboratorRepository } from './collaborator.repository';
import { FormsService } from '../forms/forms.service';

@Injectable()
export class ProjectsService {

    constructor(
        private readonly formService: FormsService,
        private readonly projectRepository: ProjectRepository,
        private readonly collaboratorRepository: CollaboratorRepository
    ) { }

    private async findProjectOrFail(projectId: string): Promise<Project> {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new NotFoundException('Project not found');
        }
        return project;
    }

    private async authorizeUser(projectId: string, userId: string, requiredRole: ProjectRoleEnum): Promise<void> {
        const collaborator = await this.collaboratorRepository.findOne({ project: new Types.ObjectId(projectId), user: new Types.ObjectId(userId) });
        if (!collaborator || !collaborator.roles.includes(requiredRole)) {
            throw new ForbiddenException('User does not have the required permissions');
        }
    }

    async getProject(projectId: string, userId: string, withForms?: boolean): Promise<ProjectDTO> {
        const project = await this.findProjectOrFail(projectId);

        const collaborator = await this.collaboratorRepository.findOne({ project: project._id, user: new Types.ObjectId(userId) });

        const forms = withForms ? await this.formService.getForms(projectId, userId) : undefined;

        return {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            roles: collaborator?.roles || [],
            forms,
        };
    }

    async create(projectDTO: ProjectDTO, userId: string): Promise<ProjectDTO> {
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
        const collaborations = await this.collaboratorRepository.find({ user: userObjectId });

        const projectRoles = collaborations.reduce((acc, curr) => {
            acc[curr.project.toString()] = curr.roles;
            return acc;
        }, {});

        const projectIds = collaborations.map(collab => collab.project);
        const projects = await this.projectRepository.find({ _id: { $in: projectIds } });

        return projects.map(project => ({
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
            roles: projectRoles[project._id.toString()],
        }));
    }

    async updateProject(projectDTO: ProjectDTO, userId: string): Promise<ProjectDTO> {
        const id = projectDTO.id;
        await this.findProjectOrFail(id);
        await this.authorizeUser(id, userId, ProjectRoleEnum.OWNER);

        const updatedProject = await this.projectRepository.update(id, projectDTO);
        const collaborator = await this.collaboratorRepository.findOne(
            { project: new Types.ObjectId(id), user: new Types.ObjectId(userId) });

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
    async addCollaborators(collaboratorsDTO: AddCollaboratorsDTO, userId: string): Promise<any> {
        // get the project
        const project = await this.projectRepository.findById(collaboratorsDTO.projectId);

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if the user is a owner
        const collaborator = await this.collaboratorRepository.findOne({ project: project._id, user: new Types.ObjectId(userId) });
        if (!collaborator || !collaborator.roles.includes(ProjectRoleEnum.OWNER)) {
            throw new ForbiddenException('User is not an owner');
        }

        // Add the new collaborators
        const newCollaborators = collaboratorsDTO.userIds.map(userId => {
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
        const projects = await this.projectRepository.find({ _id: new Types.ObjectId(projectId) });

        if (projects.length === 0) {
            throw new NotFoundException('Project not found');
        }

        // Get the collaborators
        const collaborators = await this.collaboratorRepository.find({ project: projects[0]._id });

        return collaborators.map(collaborator => ({
            userId: collaborator.user.toString(),
            roles: collaborator.roles,
        }));
    }
}
