import { IStorageService } from "./storage.service";

export class LocalStorageService implements IStorageService {

    async uploadFiles(files: Array<Express.Multer.File>): Promise<Array<string>> {
        console.log('file', files);
        return files.map(file => {
            return file.originalname;
        });
    }
    deleteFiles(files: Array<string>): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getFiles(files: Array<string>): Promise<Array<Buffer>> {
        throw new Error("Method not implemented.");
    }

}