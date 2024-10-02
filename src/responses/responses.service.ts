import { Injectable } from '@nestjs/common';
import { FileHashService, S3ObjectStorageService } from './files.service';
import { ResponsesRepository } from './responses.repository';
import { Types } from 'mongoose';

@Injectable()
export class ResponsesService {

    constructor(
        private readonly s3ObjectStorageService: S3ObjectStorageService,
        private readonly responsesRepository: ResponsesRepository,
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

        // save in db
        const response = await this.responsesRepository.create({
            _id: new Types.ObjectId(),
            projectId: new Types.ObjectId(projectId),
            formId: new Types.ObjectId(formId),
            record: {
                ...body,
                ...res.reduce((acc, curr) => {
                    acc[curr.field] = curr.key;
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
}

