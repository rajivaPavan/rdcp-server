import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

    // This function will return a specific project with the roles of the user in that project and the forms in that project
    async getProject(projectId: string, userId:string): Promise<ProjectDTO> {

        const project = await this.projectRepository.findById(projectId);
        console.log(project)
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if the user is a collaborator
        const collaborator = await this.collaboratorRepository.findOne({ project: project._id, user: new Types.ObjectId(userId) });

        if (!collaborator) {
            throw new UnauthorizedException('User is not a collaborator');
        }

        // Get the roles of the user
        const roles = collaborator.roles;

        // Get the forms in the project
        const forms = await this.formService.getForms(projectId, userId);

        return {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            roles : roles,
            forms: forms,
        };
    }

    async create(projectDTO: ProjectDTO, userId: string): Promise<any> {

        let project = new Project({
            ...projectDTO,
            _id: new Types.ObjectId(),
        });

        const collaborator = {
            project: project._id,
            user: new Types.ObjectId(userId),
            roles: [ProjectRoleEnum.OWNER],
        };

        project = await this.projectRepository.create(project, collaborator);
        await this.collaboratorRepository.create(collaborator);
        
        return project;
    }

    async getProjectsOfUser(userId: string): Promise<ProjectDTO[]> {
        const userObjectId = new Types.ObjectId(userId);

        // Find projects where the user is a collaborator
        const collaboration = await this.collaboratorRepository
            .find({ user: userObjectId })

        // Get a map from project id to roles
        const projectRoles = collaboration.reduce((acc, curr) => {
            acc[curr.project.toString()] = curr.roles;
            return acc;
        }, {});

        // Get the project ids
        const projectIds = collaboration.map(collaboration => collaboration.project);

        // Find the projects
        const projects = await this.projectRepository.find({ _id: { $in: projectIds } });

        return projects.map(project => {
            return {
                id: project._id.toString(),
                name: project.name,
                description: project.description,
                createdAt: project.createdAt,
                roles: projectRoles[project._id.toString()],
            };
        });
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
            throw new UnauthorizedException('User is not an owner');
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

        // Check if the user is a collaborator
    }
}
