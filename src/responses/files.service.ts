import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class S3ObjectStorageService {
  private s3: S3;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.configureS3();
  }

  // Configures the S3 client to use AWS or MinIO based on the environment
  private configureS3() {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    const accessKeyId = isProduction
      ? this.configService.get<string>('AWS_ACCESS_KEY_ID')
      : this.configService.get<string>('MINIO_ACCESS_KEY');

    const secretAccessKey = isProduction
      ? this.configService.get<string>('AWS_SECRET_ACCESS_KEY')
      : this.configService.get<string>('MINIO_SECRET_KEY');

    const endpoint = isProduction
      ? undefined // AWS S3 doesn't need a custom endpoint
      : this.configService.get<string>('MINIO_ENDPOINT');

    const region = isProduction
      ? this.configService.get<string>('AWS_REGION')
      : 'us-east-1'; // Dummy region for MinIO

    this.bucketName = isProduction
      ? this.configService.get<string>('AWS_S3_BUCKET_NAME')
      : this.configService.get<string>('MINIO_BUCKET_NAME');

    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
      endpoint, // MinIO requires a custom endpoint, S3 doesn't
      s3ForcePathStyle: !isProduction, // Required for MinIO
    });
  }

  // Upload file to S3 or MinIO
  async uploadFile(
    fileKey: string,
    file: Express.Multer.File
  ): Promise<string> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location; // Returns the file's URL
    } catch (error) {
      throw new InternalServerErrorException('File upload failed');
    }
  }

  // Retrieve a file from S3 or MinIO
  async getFileUrl(fileKey: string): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
      };

      const url = this.s3.getSignedUrl('getObject', params);
      return url;
    } catch (error) {
      throw new InternalServerErrorException('File retrieval failed');
    }
  }
}

export class FileHashService {

  generateHash(file: Express.Multer.File): string {
      const hash = crypto.createHash('sha256');
      hash.update(file.buffer);
      return hash.digest('hex');
  }
}
