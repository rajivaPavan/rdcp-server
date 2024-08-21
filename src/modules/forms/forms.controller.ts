import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FormDTO, ProjectFormsResponseDTO as ProjectFormsDTO } from './forms.dto';
import { FormsService } from './forms.service';

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {

    constructor(
        private readonly formsService: FormsService
    ) { }

    // TODO: Add Guard to check if user is authorized to create form
    @Post()
    async createForm(@Body() formDto: FormDTO, @Req() req): Promise<FormDTO> {
        const userId = req.user.id;
        const res = await this.formsService.createForm(formDto, userId);
        console.log("created form", res);
        return res;
    }

    // TODO: Add Guard to check if user is authorized to delete form
    @Delete('/:formId')
    async deleteForm(@Param('formId') formId: string) {
        await this.formsService.deleteForm(formId)
        return {
            message: 'Form deleted successfully',
            success: true
        };
    }

}
