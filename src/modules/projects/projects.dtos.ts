import { ProjectRoleEnum } from "./projects.schema";

export interface ProjectDTO{
    id: string;
    name: string;
    description: string;
    roles: ProjectRoleEnum[];
}

export interface CreateDTO {
    project: ProjectDTO;
    userId: string;
}
