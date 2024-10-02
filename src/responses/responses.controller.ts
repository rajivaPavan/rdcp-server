import { Body, ConflictException, Controller, Post, Req, UnauthorizedException, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';
import { FormId } from 'src/forms/decorators/form-id.decorator';
import { FormsService } from 'src/forms/forms.service';
import AuthenticationService from 'src/auth/auth.service';
import { Form } from 'src/forms/entities/form.schema';

@Controller('responses')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
        private readonly formService: FormsService,
        private readonly authService: AuthenticationService
    ) { }

    @Post(':formId/submit')
    @UseInterceptors(AnyFilesInterceptor({}))
    async uploadFile(
        @FormId() formId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any,
        @Req() req: Request
    ) {
        // JSON parse every field in the body
        const records = this.parseBody(body);

        // get the form 
        const form = await this.formService.getForm(formId);

        const { authorized } = await this.formService.publicSubmissionAuth(form);

        const projectId = form.projectId;

        if (authorized) {
            // public forms do not require authentication
            this.responsesService.submit(projectId, formId, records, files);
        }
        else {
            // private forms require authentication
            const user = await this.authService.extractUserFromRequest(req);

            if (!user)
                throw new ConflictException('User not authenticated');

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
            await this.formService.privateSubmissionAuth(form, userId);

            // Submit the response with the user's ID in the background
            await this.responsesService.submit(projectId, formId, records, files, userId);
        } catch (error) {
            // Handle or log the error
            console.error(`Error processing private submission for user ${userId}:`, error);
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
