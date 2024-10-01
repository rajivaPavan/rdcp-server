import { Body, Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';
import { S3ObjectStorageService } from './files.service';
import { FormId } from 'src/forms/decorators/form-id.decorator';

@Controller('responses')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
        private readonly s3ObjectStorageService: S3ObjectStorageService
    ) { }

    @Post(':formId/submit')
    @UseInterceptors(AnyFilesInterceptor({

    }))
    async uploadFile(
        @FormId() formId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any) {

        await this.responsesService.submit(body, files);
        files.forEach(async file => {
            let name = await this.s3ObjectStorageService.uploadFile(file);
            console.log(name);
        });
    }
}
