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

@UseGuards(AuthGuard)
@Controller('forms')
export class FormsController {
  private readonly logger = new Logger(FormsController.name);

  constructor(private readonly formsService: FormsService) {}

  // TODO: Add Guard to check if user is authorized to create form
  @Post()
  async createForm(
    @Body() formDto: FormDTO,
    @User() user: AuthenticatedUser,
  ): Promise<FormDTO> {
    this.logger.debug(`Creating form with name: ${formDto.name} by ${user.id}`);
    return await this.formsService.createForm(formDto, user.id);
  }

  // TODO: Add Guard to check if user is authorized to delete form
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

  //TODO: Add Guard to check if user is authorized to get forms
  @Get('/:formId')
  async getForm(@Param('formId') formId: string): Promise<FormDTO> {
    this.logger.debug(`Getting form with id: ${formId}`);
    return await this.formsService.getForm(formId);
  }

  @Patch('/:formId')
  async updateForm(@Param('formId') formId: string, @Body() formDto: FormDTO) {
    this.logger.debug(`Updating form with id: ${formId}`);
    return await this.formsService.updateForm(formId, formDto);
  }
}
