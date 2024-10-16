import { ProjectRoleEnum } from "../projects/entities/project-role.enum";
import { CollaboratorsRepository } from "../projects/collaborators.repository";
import { Types } from "mongoose";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { Exception } from "handlebars";

export const projectActions = {
    create_form: [ProjectRoleEnum.MANAGER],
    update_form: [ProjectRoleEnum.MANAGER],
    delete_form: [ProjectRoleEnum.MANAGER],
    view_forms: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.EDITOR, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
    view_form: [ProjectRoleEnum.MANAGER],
    edit_form_properties: [ProjectRoleEnum.MANAGER],
    edit_form_schema: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.EDITOR],
    view_form_responses: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
    view_form_summary: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
}

export type ProjectAction = keyof typeof projectActions;

@Injectable()
export class ProjectAuthorization {
    constructor(
        private readonly collaboratorsRepository: CollaboratorsRepository,
    ) { }

    // This method will check if the user is a collaborator of the project and if the user has
    // the required role to perform the action.
    async isAuthorized(userId: string, projectId: string, action: ProjectAction): Promise<boolean> {
        let projectRoles;
        try {
            projectRoles = await this.getProjectRoles(userId, projectId);
        } catch (e) {
            return false;
        }

        // check if the user is an owner of the project, if so, they can perform any action
        if (projectRoles.includes(ProjectRoleEnum.OWNER)) {
            return true;
        }

        // required roles to perform the action
        const requiredRoles = projectActions[action];
        return projectRoles.some((role: ProjectRoleEnum) => requiredRoles.includes(role));
    }

    async getProjectRoles(userId: string, projectId: string): Promise<ProjectRoleEnum[]> {
        const collaborator = await this.collaboratorsRepository.findOne({
            project: new Types.ObjectId(projectId),
            user: new Types.ObjectId(userId),
        });

        if (!collaborator) {
            throw new NotCollaboratorException();
        }

        const projectRoles = collaborator.roles;
        return projectRoles;
    }

}

export class NotCollaboratorException extends Exception {
    constructor() {
        super('User is not a collaborator of the project');
    }
}