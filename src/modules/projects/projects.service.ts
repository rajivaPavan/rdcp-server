import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './projects.repository';
import { Project, ProjectRoleEnum } from './projects.schema';
import { Types } from 'mongoose';
import { ProjectDTO, UpdateCollaboratorsDTO } from './projects.dtos';
import { CollaboratorRepository } from './collaborator.repository';

@Injectable()
export class ProjectsService {


    constructor(private readonly projectRepository: ProjectRepository,
        private readonly collaboratorRepository: CollaboratorRepository
    ) { }

    async getProject(projectId: string, userId:string): Promise<ProjectDTO> {
        const project = await this.projectRepository.findById(projectId);
        console.log(project)
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            roles: [],
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
                roles: projectRoles[project._id.toString()],
            };
        });
    }

    async addCollaborators(collaboratorsDTO: UpdateCollaboratorsDTO) {
        // get the project
        const projects = await this.projectRepository.findById(collaboratorsDTO.projectId);

        if (!projects) {
            throw new NotFoundException('Project not found');
        }

        // // update the collaborators
        // projects.collaborators = collaboratorsDTO.collaborators.map(collaborator => {
        //     return {
        //         userId: new Types.ObjectId(collaborator.userId),
        //         roles: collaborator.roles,
        //     }
        // });

        // save the project
        return await this.projectRepository.update(collaboratorsDTO.projectId, projects);
    }

    async getCollaborators(projectId: string): Promise<any> {
        const projects = await this.projectRepository.find({ _id: new Types.ObjectId(projectId) });

        if (projects.length === 0) {
            throw new NotFoundException('Project not found');
        }

        const project = projects[0];

        // return project.collaborators.map(collaborator => {
        //     return {
        //         userId: collaborator.userId.toString(),
        //         roles: collaborator.roles,
        //     };
        // });
    }
}
