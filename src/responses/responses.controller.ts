import { Body, ConflictException, Controller, Get, NotFoundException, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';
import { FormId } from 'src/forms/decorators/form-id.decorator';
import AuthenticationService from 'src/auth/auth.service';
import { FormAuthorization } from 'src/authorization/forms.authorization';
import { Form } from 'src/forms/entities/form.schema';
import { FormDTO } from 'src/forms/dtos/form.dto';

@Controller('responses')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
        private readonly authService: AuthenticationService,
        private readonly formAuth: FormAuthorization
    ) { }

    @Get(":formId")
    async viewForm(
        @FormId() formId: string,
        @Req() req: Request
    ): Promise<FormDTO> {
        const form = await this.formAuth.getForm(formId);

        const { authorized } = this.publicSubmissionAuth(form);

        const projectId = form.projectId.toString();

        if (authorized)
            return this.prepareFormDto(form);

        // check if user is authenticated
        // if user is authenticated, check if user has access to the form
        let user = null;
        try {
            user = await this.authService.extractUserFromRequest(req);
        } catch (error) {
            throw new NoFormAccessException();
        }

        await this.formAuth.privateSubmissionAuth(form, user.id);

        return {
            ...form,
            id: form._id.toString(),
            projectId: form.projectId.toString(),
        }
    }

    private prepareFormDto(form: Form): FormDTO {
        return {
            ...form,
            id: form._id.toString(),
            projectId: form.projectId.toString(),
        }
    }

    @Post(':formId/submit')
    @UseInterceptors(AnyFilesInterceptor({}))
    async submitForm(
        @FormId() formId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any,
        @Req() req: Request
    ) {
        // JSON parse every field in the body
        const records = this.parseBody(body);

        // get the form 
        const form = await this.formAuth.getForm(formId);

        const { authorized } = this.publicSubmissionAuth(form);

        const projectId = form.projectId.toString();

        if (authorized) {
            // public forms do not require authentication
            this.responsesService.submit(projectId, formId, records, files);
        }
        else {
            // private forms require authentication
            const user = await this.authService.extractUserFromRequest(req);

            if (!user)
                throw new NoFormAccessException();

            // submit the response with the user's ID
            this.handlePrivateSubmission(form, projectId, formId, records, files, user.id);
        }

        // return 202 Accepted status code to indicate that the request has been accepted for processing
        return {
            status: 'Accepted',
            statusCode: 202,
            message: 'The request has been accepted for processing',
        };
    }

    // Handle private submission in the background
    private async handlePrivateSubmission(
        form: any,
        projectId: string,
        formId: string,
        records: any,
        files: Array<Express.Multer.File>,
        userId: string,
    ) {
        try {
            // Ensure user has the right to submit to this form (private submission authorization)
            await this.formAuth.privateSubmissionAuth(form, userId);

            // Submit the response with the user's ID in the background
            await this.responsesService.submit(projectId, formId, records, files, userId);
        } catch (error) {
            // Handle or log the error
            console.error(`Error processing private submission for user ${userId}:`, error);
        }
    }

    /**
   * Checks if a public submission is authorized for the given form.
   *
   * @param formId - The ID of the form to check.
   * @returns A promise that resolves to an object containing:
   * - `authorized`: A boolean indicating if the submission is authorized.
   * - `message`: An optional message providing additional information.
   * - `projectId`: The ID of the project associated with the form.
   * @throws NotFoundException if the form is not found or not published.
   */
    private publicSubmissionAuth(form: Partial<Form>): {
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

    private parseBody(body: any) {
        for (const key in body) {
            try {
                body[key] = JSON.parse(body[key]);
            } catch (e) {
                // Do nothing
            }
        }
        return body;
    }
}


export class NoFormAccessException extends ConflictException {
    constructor(message?: string) {
        super(message || 'User does not have access to the form');
    }
}