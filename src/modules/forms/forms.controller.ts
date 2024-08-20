import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Form } from './form.schema';
import { AuthGuard } from '../auth/auth.guard';
import { FormDTO, ProjectFormsResponseDTO as ProjectFormsDTO } from './forms.dto';
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
        console.log("created form",res);
        return res;
    }
}
