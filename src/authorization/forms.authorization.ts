import { ConflictException, Injectable } from "@nestjs/common";
import { Form } from "src/forms/entities/form.schema";
import { FormsRepository } from "src/forms/forms.repository";
import { ProjectAuthorization } from "./projects.authorization";
import { NoFormAccessException } from "src/responses/responses.controller";

@Injectable()
export class FormAuthorization {

    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly projectAuthorization: ProjectAuthorization,
    ) { }

    /**
     * Retrieves a form by its ID.
     *
     * @param formId - The unique identifier of the form to retrieve.
     * @returns A promise that resolves to the form object if found, or null if not found.
     */
    async getForm(formId: string): Promise<Form> {
        return await this.formsRepository.findById(formId);
    }

    /**
     * Authorizes a user's submission to a form.
     * 
     * @param form - The form object to be submitted.
     * @param userId - The ID of the user attempting to submit the form.
     * @returns A promise that resolves to an object indicating whether the user is authorized to submit the form and an optional message.
     * 
     * @throws UnPublishedFormException - If the form is not published.
     * @throws NoFormAccessException - If the form is private and the user is neither a collaborator nor a participant.
     */
    async privateSubmissionAuth(form: any, userId: string): Promise<{ authorized: boolean; message?: string; }> {

        if (!form.isPublished) {
            throw new UnPublishedFormException();
        }

        // if form is not private then anyone can submit a response
        if (!form.isPrivate)
            return { authorized: true };

        // Perform both checks in parallel since they are independent
        const [roles, isParticipant] = await Promise.all([
            this.projectAuthorization.getProjectRoles(userId, form.projectId),
            this.isParticipant(userId)
        ]);

        // If the user has no project roles and is not a participant, deny access
        const isCollaborator = roles.length > 0;
        if (!isCollaborator && !isParticipant) {
            throw new NoFormAccessException();
        }

        return {
            authorized: true,
        };
    }


    async isParticipant(userId: string) {
        // TODO: Implement this method
        console.error("Implement 'isParticipant' method");
        return false;
    }

    /**
     * Determines if a form is available for public submission.
     *
     * @param form - A partial form object containing the properties to check for authorization.
     * @returns An object indicating whether the form is authorized for submission and an optional message.
     * @throws UnPublishedFormException - If the form is not published.
     */
    publicSubmissionAuth(form: Partial<Form>): {
        authorized: boolean;
        message?: string;
    } {

        if (!form.isPublished) {
            throw new UnPublishedFormException();
        }

        // if form is not private then anyone can submit a response
        if (!form.isPrivate)
            return { authorized: true };

        return {
            authorized: false,
        }
    }
}

export class UnPublishedFormException extends ConflictException {
    constructor() {
        super('This form is not accepting responses');
    }
}