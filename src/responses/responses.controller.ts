import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ResponsesService } from './responses.service';

@Controller('responses')
export class ResponsesController {

    constructor(
        private readonly responsesService: ResponsesService,
    ) {}

    @Post('submit')
    @UseInterceptors(AnyFilesInterceptor())
    async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: any) {
        await this.responsesService.submit(body, files);
    }
}
