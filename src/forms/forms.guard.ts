import { CanActivate, ExecutionContext, Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { FormsService } from '../forms/forms.service';
import { Reflector } from '@nestjs/core';
import { ProjectAction, ProjectAuthorization } from '../authorization/projects.authorization';

@Injectable()
export class FormAuthorizationGuard implements CanActivate {
  constructor(
    private readonly formsService: FormsService,
    private readonly projectsAuthorization: ProjectAuthorization,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Extract the authenticated user
    const formId = request.params.formId; // Extract formId from params

    if (!formId || !user) {
      throw new ConflictException('Invalid request');
    }

    // Fetch the form by ID and check if the user has access
    const form = await this.formsService.getForm(formId);

    if (!form) {
      throw new ForbiddenException('Form not found');
    }

    // Extract the action from reflector
    const action = this.reflector.get<ProjectAction>('form-action', context.getHandler());

    if (!action) {
      throw new ForbiddenException('Invalid action');
    }

    const isAuthorized = await this.projectsAuthorization.isAuthorized(user.id, form.projectId, action);

    // attach the form to the request object
    request.form = form;

    return isAuthorized; // If authorized, continue to the controller
  }
}
