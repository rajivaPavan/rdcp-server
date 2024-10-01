import { Body, Controller, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';
import { S3ObjectStorageService } from './files.service';
import { FormId } from 'src/forms/decorators/form-id.decorator';

@Controller('responses')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
    ) { }

    @Post(':formId/submit')
    @UseInterceptors(AnyFilesInterceptor({

    }))
    async uploadFile(
        @FormId() formId: string,
        @UploadedFiles() files: Array<Express.Multer.File>,
        @Body() body: any) {

        await this.responsesService.submit("66c4d6676bbcc50e089f75fa",formId, body, files);
    }
}
