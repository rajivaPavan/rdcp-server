import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FormDTO } from '../dtos/form.dto';

export const FormReqDto = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.form as FormDTO;
  },
);
