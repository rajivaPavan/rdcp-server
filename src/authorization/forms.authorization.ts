import { Injectable } from "@nestjs/common";
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
}