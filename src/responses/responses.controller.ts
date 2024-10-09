import { Body, ConflictException, Controller, Get, NotFoundException, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';
import { FormId } from 'src/forms/decorators/form-id.decorator';
import AuthenticationService from 'src/auth/auth.service';
import { FormAuthorization } from 'src/authorization/forms.authorization';
import { FormDTO } from 'src/forms/dtos/form.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { FormAuthorizationGuard } from 'src/forms/forms.guard';
import { FormActionMeta } from 'src/forms/decorators/form-action.decorator';
import { FormReqDto } from 'src/forms/decorators/form.decorator';
import { Form } from 'src/forms/entities/form.schema';

@Controller('submissions')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
        private readonly authService: AuthenticationService,
        private readonly formAuth: FormAuthorization,
    ) {
    }

    @Get("form/:formId")
    async viewForm(
        @FormId() formId: string,
        @Req() req: Request
    ): Promise<FormDTO> {
        const form = await this.formAuth.getForm(formId);

        const { authorized } = this.formAuth.publicSubmissionAuth(form);

        if (authorized)
            return FormDTO.fromEntity(form);

        // check if user is authenticated
        // if user is authenticated, check if user has access to the form
        let user = null;
        try {
            user = await this.authService.extractUserFromRequest(req);
        } catch (error) {
            throw new NoFormAccessException();
        }

        await this.formAuth.privateSubmissionAuth(form, user.id);

        return FormDTO.fromEntity(form);
    }

    @Post('form/:formId')
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

        const { authorized } = this.formAuth.publicSubmissionAuth(form);

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

    @UseGuards(AuthGuard, FormAuthorizationGuard)
    @FormActionMeta('view_form_responses')
    @Get('form/:formId/responses')
    async getResponses(
        @FormId() formId: string,
        @FormReqDto() form: Form,
        @Query('page') page: number = 1, // default to page 1
        @Query('limit') limit: number = 10, // default limit to 10
    ) {

        const getAll = limit === -1;
        const responses = getAll ? await this.responsesService.getAllResponses(formId) :
            await this.responsesService.getResponses(formId, Number(page), Number(limit));

        return {
            responses,
            form: FormDTO.fromEntity(form)
        }
    }

    @UseGuards(AuthGuard, FormAuthorizationGuard)
    @FormActionMeta('view_form_responses')
    @Get('form/:formId/summary')
    async getSummary(
        @FormId() formId: string,
        @FormReqDto() form: Form,
        @Query('field') field: string
    ) {
        if (!field) throw new NotFoundException('Field is required');
        // get the type of the field
        const fieldType = form.schema.find(f => f.field === field)?.type;
        return this.responsesService.getSummary(formId, field, 'CheckboxField');
    }

}


export class NoFormAccessException extends ConflictException {
    constructor(message?: string) {
        super(message || 'User does not have access to the form');
    }
}