import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('responses')
export class ResponsesController {

    @Post('submit')
    @UseInterceptors(AnyFilesInterceptor())
    uploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: any) {
        console.log(body);
        console.log(files);
    }
}
