import { ProjectRoleEnum } from "./projects.schema";

export interface ProjectDTO{
    id: string;
    name: string;
    description: string;
    roles: ProjectRoleEnum[];
}

export interface CollaboratorDTO{
    userId: string;
    roles: ProjectRoleEnum[];
}

export interface UpdateCollaboratorsDTO {
    collaborators: CollaboratorDTO[];
    projectId: string;
}

    






