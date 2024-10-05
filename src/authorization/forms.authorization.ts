import { Injectable, NotFoundException } from "@nestjs/common";
import { Form } from "src/forms/entities/form.schema";
import { FormsRepository } from "src/forms/forms.repository";

@Injectable()
export class FormAuthorization{

    constructor(
        private readonly formsRepository: FormsRepository
    ) {}

    async getForm(formId: string) {
        return await this.formsRepository.findById(formId);
    }

    privateSubmissionAuth(form: any, userId: string) {
        return true;
    }

    publicSubmissionAuth(form: Partial<Form>): {
        authorized: boolean;
        message?: string;
    } {

        if (!form.isPublished) {
            throw new NotFoundException('Form is not found');
        }

        // if form is not private then anyone can submit a response
        if (!form.isPrivate)
            return { authorized: true };

        return {
            authorized: false,
        }
    }
}