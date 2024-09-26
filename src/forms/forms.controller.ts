import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateFormDTO, FormDTO } from './dtos/form.dto';
import { FormsService } from './forms.service';
import { AuthenticatedUser } from '../auth/entities/authenticated-user';
import { User } from '../users/decorators/user.decorator';
import { FormsEditingService } from './form-editing.service';
import { FormReqDto } from './decorators/form.decorator';
import { FormAuthorizationGuard } from './forms.guard';
import { FormActionMeta } from './decorators/form-action.decorator';
import { FormId } from './decorators/form-id.decorator';

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
    @Body() formDto: CreateFormDTO,
    @User() user: AuthenticatedUser,
  ): Promise<FormDTO> {
    this.logger.debug(`Creating form with name: ${formDto.name} by ${user.id}`);
    return await this.formsService.createForm(formDto, user.id);
  }

  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('delete')
  @Delete('/:formId')
  async deleteForm(
    @FormId() formId: string,
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
  @FormActionMeta('view_form')
  @Get('/:formId')
  async getForm(@FormId() formId: string, @FormReqDto() form,
    @Query("schema") schema: boolean = false
  ): Promise<FormDTO> {
    
    this.logger.debug(`Getting form with id: ${formId}`);

    if (!schema) {
      // Remove schema from form object
      delete form.draft,
      delete form.schema;
    }

    return form;
  }

  /// Update form properties
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_properties')
  @Patch('/:formId')
  async updateForm(@FormId() formId: string, @Body() formDto: FormDTO) {
    this.logger.debug(`Updating form with id: ${formId}`);
    return await this.formsService.updateForm(formId, formDto);
  }


  /// Save form schema changes
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/save-form')
  async saveForm(@FormId() formId: string, @Body() body) {
    this.logger.debug(`Saving form schema with id: ${formId}`);
    const { data: schema } = body;
    await this.formsService.saveFormSchema(formId, schema);
    return { success: true };
  }

  /// Publish form changes to the public
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_properties')
  @Patch(':formId/publish')
  async publishForm(@FormId() formId: string) {
    return await this.formsService.publishForm(formId);
  }

  /// Lock form for editing
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/lock')
  async lockForm(@FormId() formId: string, @User() user: AuthenticatedUser) {
    this.logger.debug(`Locking form with id: ${formId}`);
    return this.formEditingService.lockForm(formId, user);
  }

  /// Keep form alive
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/keep-alive')
  async keepAlive(@FormId() formId: string, @User() user: AuthenticatedUser) {
    this.logger.debug(`Keep alive for form with id: ${formId}`);
    return this.formEditingService.keepAlive(formId, user.id);
  }

  /// Release form lock
  @UseGuards(FormAuthorizationGuard)
  @FormActionMeta('edit_schema')
  @Post(':formId/release-lock')
  async releaseLock(@FormId() formId: string, @User() user: AuthenticatedUser) {
    this.logger.debug(`Releasing lock for form with id: ${formId}`);
    return this.formEditingService.releaseLock(formId, user.id);
  }

}


