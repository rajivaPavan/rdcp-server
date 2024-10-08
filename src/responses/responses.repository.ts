import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormResponse, ResponseDocument } from './entities/response.schema';

@Injectable()
export class ResponsesRepository {
    constructor(
        @InjectModel(FormResponse.name) private readonly responseModel: Model<ResponseDocument>,
    ) { }

    async create(response: FormResponse): Promise<FormResponse> {
        const created = await this.responseModel.create(response);
        return created.toObject();
    }

    async find(options: any, page: number, limit: number): Promise<{
        items: FormResponse[];
        total: number;
        page: number;
        limit: number;
    }> {
        const skip = (page - 1) * limit; // Skip the previous pages
        const items = await this.responseModel.find(options).skip(skip).limit(limit).exec();
        const total = await this.responseModel.countDocuments(); // Get total count of documents
        return {
            items,
            total,
            page,
            limit,
        };
    }

    async findOne(options: any): Promise<FormResponse> {
        return await this.responseModel.findOne(options).lean().exec();
    }

    async findById(id: string): Promise<FormResponse> {
        return await this.responseModel.findById(id).lean().exec();
    }

    async update(id: string, response: Partial<FormResponse>): Promise<FormResponse> {
        return await this.responseModel
            .findByIdAndUpdate(id, response, { new: true })
            .lean()
            .exec();
    }

    async delete(id: string): Promise<FormResponse> {
        return await this.responseModel.findByIdAndDelete(id).exec();
    }
}