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

export interface AddCollaboratorsDTO {
    userIds: string[];
    roles: ProjectRoleEnum[];
    projectId: string;
}

    






