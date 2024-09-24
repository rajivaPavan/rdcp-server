import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { FormDTO } from './dtos/form.dto';
import { FormsService } from './forms.service';
import { AuthenticatedUser } from '../auth/entities/authenticated-user';
import { User } from '../users/decorators/user.decorator';
import { FormsEditingService } from './form-editing.service';
import { FormReqDto } from './decorators/form.decorator';
import { FormAuthorizationGuard } from './forms.guard';
import { FormActionMeta } from './decorators/form-action.decorator';

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
  private readonly logger = new Logger(FormsController.name);

  constructor(private readonly formsService: FormsService,
    private readonly formEditingService: FormsEditingService
  ) { }

  @FormActionMeta('create')
  @Post()
  async createForm(
    @Body() formDto: FormDTO,
    @User() user: AuthenticatedUser,
  ): Promise<FormDTO> {
    this.logger.debug(`Creating form with name: ${formDto.name} by ${user.id}`);
    return await this.formsService.createForm(formDto, user.id);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('delete')
  @Delete('/:formId')
  async deleteForm(
    @Param('formId') formId: string,
    @User() user: AuthenticatedUser,
  ) {
    this.logger.debug(`Deleting form with id: ${formId}`);
    await this.formsService.deleteForm(formId);
    return {
      message: 'Form deleted successfully',
      success: true,
    };
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('view_properties')
  @Get('/:formId')
  async getForm(@Param('formId') formId: string, @FormReqDto() form): Promise<FormDTO> {
    this.logger.debug(`Getting form with id: ${formId}`);
    return form;
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_properties')
  @Patch('/:formId')
  async updateForm(@Param('formId') formId: string, @Body() formDto: FormDTO) {
    this.logger.debug(`Updating form with id: ${formId}`);
    return await this.formsService.updateForm(formId, formDto);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_properties')
  @Patch(':formId/publish')
  async publishForm(@Param('formId') formId: string) {
    return await this.formsService.publishForm(formId);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/keep-alive')
  async keepAlive(@Body() body) {
    const { formId, userId } = body;
    return this.formEditingService.keepAlive(formId, userId);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/release-lock')
  async releaseLock(@Body() body) {
    const { formId, userId } = body;
    return this.formEditingService.releaseLock(formId, userId);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/save-form')
  async saveForm(@Body() body) {
    const { formId, data } = body;
    await this.formsService.saveFormSchema(formId, data);
    return { success: true };
  }
}
