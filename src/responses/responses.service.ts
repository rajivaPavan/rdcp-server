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

    private readonly fileUploadFieldType = 'FileUploadField';

    async submit(
        projectId: string,
        formId: string,
        body: Record<string, any>,
        files: Array<Express.Multer.File>,
        userId?: string
    ) {

        const res = await this.uploadFiles(projectId, formId, files);
        const form = await this.formRepository.findById(formId);
        const schema = form.schema;

        // TODO: check if all required fields are present
        // this.validateRequiredFields(schema, body, files);

        // create an array in the order of the schema from the body with labels added 
        // and files replaced with their s3 keys
        const preparedRecord = schema.map(field => {
            const _record = {
                type: field.type,
                label: field.extraAttributes.label,
            };
            if (field.type === this.fileUploadFieldType) {
                const file = res.find(r => r.field === field.id);
                console.log("File", file);
                return {
                    id: file.field,
                    value: file.key,
                    ..._record,
                }
            }
            return {
                field: field.id,
                value: body[field.id],
                ..._record,
            }
        });

        console.log(preparedRecord);


        // save in db
        const response = await this.responsesRepository.create({
            _id: new Types.ObjectId(),
            projectId: new Types.ObjectId(projectId),
            formId: new Types.ObjectId(formId),
            userId: userId ? new Types.ObjectId(userId) : null,
            record: preparedRecord,
        });

        return response;
    }

    private validateRequiredFields(schema: Record<string, any>[], body: Record<string, any>, files: Express.Multer.File[]) {
        // TODO: check the accuracy of  this method
        const requiredFields = schema.filter(field => field.extraAttributes.required);

        if (requiredFields.length > 0) {
            // check for missing fields in body
            const missingFields = requiredFields.filter(field => !body[field.id]);

            // check for missing fields in files
            const missingFiles = requiredFields.filter(field => !files.find(file => file.fieldname === field.id));

            if (missingFields.length > 0 || missingFiles.length > 0) {
                const missingFieldNames = missingFields.map(field => field.extraAttributes.label);
                const missingFileNames = missingFiles.map(field => field.extraAttributes.label);
                throw new Error(`Missing required fields: ${[...missingFieldNames, ...missingFileNames].join(', ')}`);
            }
        }
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

