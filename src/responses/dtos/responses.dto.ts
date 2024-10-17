import { FormResponse } from "../entities/response.schema";

export class FormResponseDto {
    formId: string;
    projectId: string;
    userId?: string;
    createdAt?: Date;
    record: Array<Record<string, any>>;

    static fromEntity(entity: FormResponse): FormResponseDto {
        return {
            formId: entity.formId.toString(),
            projectId: entity.projectId.toString(),
            userId: entity.userId?.toString(),
            createdAt: entity.createdAt,
            record: entity.record
        }
    }
}