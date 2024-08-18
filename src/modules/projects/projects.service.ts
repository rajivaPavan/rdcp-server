import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from './projects.repository';
import { Collaborator, Project, ProjectRoleEnum } from './projects.schema';
import { Types } from 'mongoose';
import { ProjectDTO, UpdateCollaboratorsDTO } from './projects.dtos';

interface IProjectsService {
    getProject(projectId: string, userId:string): Promise<ProjectDTO>;
    create(projectDTO: ProjectDTO, userId: string): Promise<any>;
    getProjectsOfUser(userId: string): Promise<ProjectDTO[]>;
    getCollaborators(projectId: string): Promise<any>;
}

@Injectable()
export class ProjectsService implements IProjectsService {


    constructor(private readonly projectRepository: ProjectRepository) { }

    async getProject(projectId: string, userId:string): Promise<ProjectDTO> {
        const project = await this.projectRepository.findById(projectId);
        console.log(project)
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const roles = project.collaborators
            .find(collaborator => collaborator.userId.toString() == userId)
            .roles;

        return {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            roles: roles,
        };
    }

    async create(projectDTO: ProjectDTO, userId: string): Promise<any> {

        const project = new Project(projectDTO);
        project._id = new Types.ObjectId();

        // Create the owner collaborator
        const owner: Collaborator = {
            userId: new Types.ObjectId(userId),
            roles: [ProjectRoleEnum.OWNER],
        };

        // Create the project
        project.collaborators = [owner];

        return await this.projectRepository.create(project);
    }

    async getProjectsOfUser(userId: string): Promise<ProjectDTO[]> {
        const userObjectId = new Types.ObjectId(userId);

        // Find projects where the user is a collaborator
        const projects = await this.projectRepository
            .find({ 'collaborators.userId': userObjectId })

        // Format the results to include the roles of the user in each project
        return projects.map(project => {

            // Find the collaborator entry for this user in the project
            const collaborator = project.collaborators.find(
                (collab) => collab.userId.equals(userObjectId),
            );

            return {
                id: project._id.toString(),
                name: project.name,
                description: project.description,
                roles: collaborator ? collaborator.roles : [],
            };
        });
    }

    async addCollaborators(collaboratorsDTO: UpdateCollaboratorsDTO) {
        // get the project
        const projects = await this.projectRepository.findById(collaboratorsDTO.projectId);

        if (!projects) {
            throw new NotFoundException('Project not found');
        }

        // update the collaborators
        projects.collaborators = collaboratorsDTO.collaborators.map(collaborator => {
            return {
                userId: new Types.ObjectId(collaborator.userId),
                roles: collaborator.roles,
            }
        });

        // save the project
        return await this.projectRepository.update(collaboratorsDTO.projectId, projects);
    }

    async getCollaborators(projectId: string): Promise<any> {
        const projects = await this.projectRepository.find({ _id: new Types.ObjectId(projectId) });

        if (projects.length === 0) {
            throw new NotFoundException('Project not found');
        }

        const project = projects[0];

        return project.collaborators.map(collaborator => {
            return {
                userId: collaborator.userId.toString(),
                roles: collaborator.roles,
            };
        });
    }
}
