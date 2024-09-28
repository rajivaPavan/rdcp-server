export interface IStorageService {
    uploadFiles(files: Array<Express.Multer.File>): Promise<Array<string>>;
    deleteFiles(files: Array<string>): Promise<void>;
    getFiles(files: Array<string>): Promise<Array<Buffer>>;
}

export abstract class StorageService implements IStorageService {
    abstract uploadFiles(files: Array<Express.Multer.File>): Promise<Array<string>>;
    abstract deleteFiles(files: Array<string>): Promise<void>;
    abstract getFiles(files: Array<string>): Promise<Array<Buffer>>;
}
 