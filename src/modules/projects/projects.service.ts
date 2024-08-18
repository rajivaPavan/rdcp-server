import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './projects.repository';
import { Collaborator, Project, ProjectRoleEnum } from './projects.schema';
import { Types } from 'mongoose';
import { ProjectDTO } from './projects.dtos';

interface IProjectsService {
    getProject(id: string): Promise<ProjectDTO>;
    create(projectDTO: ProjectDTO, userId: string): Promise<any>;
    getProjectsOfUser(userId: string): Promise<ProjectDTO[]>;
}

@Injectable()
export class ProjectsService implements IProjectsService {


    constructor(private readonly projectRepository: ProjectRepository) { }

    async getProject(id: string): Promise<ProjectDTO> {
        throw new Error('Method not implemented.');
    }

    async create(projectDTO: ProjectDTO, userId: string): Promise<any> {

        const project = new Project(projectDTO);

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

}
