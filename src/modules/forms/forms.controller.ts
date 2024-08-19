import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Form } from './form.schema';
import { AuthGuard } from '../auth/auth.guard';
import { FormDTO, ProjectFormsResponseDTO } from './forms.dto';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {

    constructor(
        private readonly formsService: FormsService
    ) { }
    
    // TODO: Add Guard to check if user is authorized to create form
    @UseGuards(AuthGuard)
    @Post()
    async createForm(@Body() formDto: FormDTO, @Req() req): Promise<FormDTO> {
        const userId = req.user.id;
        const res = await this.formsService.createForm(formDto, userId);
        return res;
    }

    // TODO: Add Guard to check if user is authorized to get forms
    @UseGuards(AuthGuard)
    @Get('/:projectId')
    async getForms(@Param('projectId') projectId: string, @Req() req): Promise<ProjectFormsResponseDTO> {
        console.log(projectId)
        const userId = req.user.id;
        const res = await this.formsService.getForms(projectId, userId);
        console.log(res)
        return res;
    }

}
