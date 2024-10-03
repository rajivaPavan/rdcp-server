import { Injectable } from '@nestjs/common';
import { FileHashService, S3ObjectStorageService } from './files.service';
import { ResponsesRepository } from './responses.repository';
import { Types } from 'mongoose';
import { FormsRepository } from 'src/forms/forms.repository';

@Injectable()
export class ResponsesService {

    constructor(
        private readonly s3ObjectStorageService: S3ObjectStorageService,
        private readonly responsesRepository: ResponsesRepository,
        private readonly formRepository: FormsRepository
    ) { }

    async submit(
        projectId: string,
        formId: string,
        body: Record<string, any>,
        files: Array<Express.Multer.File>,
        userId?: string
    ) {
        console.log(body);
        console.log(files);

        const res = await this.uploadFiles(projectId, formId, files);

        const form = await this.formRepository.findById(formId);
        const schema = form.schema;

        // // check if all required fields are present
        // const requiredFields = schema.filter(field => field.extraAttributes.required);

        // const missingFields = requiredFields.filter(field => !body[field.name]);

        // if (missingFields.length > 0) {
        //     throw new Error(`Missing required fields: ${missingFields.map(field => field.name).join(', ')}`);
        // }

        // save in db
        const response = await this.responsesRepository.create({
            _id: new Types.ObjectId(),
            projectId: new Types.ObjectId(projectId),
            formId: new Types.ObjectId(formId),
            userId: userId ? new Types.ObjectId(userId) : null,
            record: {
                ...body,
                ...res.reduce((acc, curr) => {
                    const q = schema.find(field => field.id === curr.field);
                    acc[curr.field] = {
                        value : curr.key,
                        type: q.type,
                        label: q.extraAttributes.label,
                    };
                    return acc;
                }, {}),
            },
        });

        console.log(response);
        return response;
    }

    private async uploadFiles(
        projectId: string,
        formId: string,
        files: Array<Express.Multer.File>) {

        // generate new names for files based on hash
        const fileHashService = new FileHashService();

        const res = await Promise.all(files.map(file => {
            const hash = fileHashService.generateHash(file);
            return {
                field: file.fieldname,
                name: hash,
            }
        }));

        const basePrefix = `${projectId}/${formId}/`;

        // upload files to s3
        const uploadResponse = await Promise.all(files.map(async (file, index) => {
            // change originalname to hash name with base prefix and extension
            const key = `${basePrefix}${res[index].name}${file.originalname.slice(file.originalname.lastIndexOf('.'))}`;
            await this.s3ObjectStorageService.uploadFile(key, file);
            return {
                field: file.fieldname,
                key: key,
            }
        }));

        return uploadResponse;
    }

    async getResponses(formId: string) {
        return await this.responsesRepository.find({
            formId: new Types.ObjectId(formId),
        });
    }
}

