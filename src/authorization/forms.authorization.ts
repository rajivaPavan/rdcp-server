import { ProjectRoleEnum } from "../projects/entities/project-role.enum";
import { CollaboratorsRepository } from "../projects/collaborators.repository";
import { Types } from "mongoose";
import { Injectable } from "@nestjs/common";

export const formActions = {
    create: [ProjectRoleEnum.MANAGER],
    update: [ProjectRoleEnum.MANAGER],
    delete: [ProjectRoleEnum.MANAGER],
    view_form:[ProjectRoleEnum.MANAGER, ProjectRoleEnum.EDITOR, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
    view_properties: [ProjectRoleEnum.MANAGER],
    edit_properties: [ProjectRoleEnum.MANAGER],
    edit_schema: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.EDITOR],
    view_responses: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
    view_summary: [ProjectRoleEnum.MANAGER, ProjectRoleEnum.ANALYST, ProjectRoleEnum.ANALYST_VIEW_ONLY],
}

export type FormAction = keyof typeof formActions;

@Injectable()
export class FormsAuthorization {
    constructor(
        private readonly collaboratorsRepository: CollaboratorsRepository,
    ) { }

    // This method will check if the user is a collaborator of the project and if the user has
    // the required role to perform the action.
    async isAuthorized(userId: string, projectId: string, action: FormAction): Promise<boolean> {
        const collaborator = await this.collaboratorsRepository.findOne({
            project: new Types.ObjectId(projectId),
            user: new Types.ObjectId(userId),
        });

        if (!collaborator) {
            return false;
        }

        const projectRoles = collaborator.roles;

        // check if the user is an owner of the project, if so, they can perform any action
        if (projectRoles.includes(ProjectRoleEnum.OWNER)) {
            return true;
        }

        // required roles to perform the action
        const requiredRoles = formActions[action];
        return projectRoles.some((role: ProjectRoleEnum) => requiredRoles.includes(role));
    }

}