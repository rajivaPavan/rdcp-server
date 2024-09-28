import { createParamDecorator, ExecutionContext } from "@nestjs/common";

// Decorator for FormId
export const FormId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.params.formId as string;
    },
);