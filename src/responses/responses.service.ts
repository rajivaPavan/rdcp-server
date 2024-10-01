import { Injectable } from '@nestjs/common';
import { S3ObjectStorageService } from './files.service';
import * as crypto from 'crypto';

@Injectable()
export class ResponsesService {

    constructor(
        private readonly s3ObjectStorageService: S3ObjectStorageService
    ) { }

    async submit(
        projectId: string,
        formId: string,
        body: any,
        files: Array<Express.Multer.File>
    ) {
        console.log(body);
        console.log(files);

        await this.uploadFiles(projectId, formId, files);
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
        const urls = await Promise.all(files.map(async (file, index) => {
            // change originalname to hash name with base prefix and extension
            const key = `${basePrefix}${res[index].name}${file.originalname.slice(file.originalname.lastIndexOf('.'))}`;
            file.originalname = key;
            const url = await this.s3ObjectStorageService.uploadFile(file);
            return {
                field: file.fieldname,
                url: url,
            }
        }));

        console.log(urls);
    }
}


export class FileHashService {

    generateHash(file: Express.Multer.File): string {
        const hash = crypto.createHash('sha256');
        hash.update(file.buffer);
        return hash.digest('hex');
    }
}
