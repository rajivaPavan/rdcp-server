import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponsesService {
    async submit(body: any, files: Array<Express.Multer.File>) {
        console.log(body);
        console.log(files);
    }
}
