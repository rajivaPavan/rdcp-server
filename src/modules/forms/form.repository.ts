import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Form, FormDocument } from "./form.schema";
import { Model } from "mongoose";

@Injectable()
export class FormRepository {
    constructor(
        @InjectModel(Form.name) private readonly formModel: Model<FormDocument>
    ) { }

    async create(form: Form): Promise<Form> {
        const created = await this.formModel.create(form);
        return created.toObject();
    }

    async find(options: any): Promise<Form[]> {
        return await this.formModel.find(options).lean().exec();
    }

    async findOne(options: any): Promise<Form> {
        return await this.formModel.findOne(options).exec();
    }

    async findById(id: string): Promise<Form> {
        return await this.formModel.findById(id).exec();
    }

    async update(id: string, form: Form): Promise<Form> {
        return await this.formModel.findByIdAndUpdate(id, form, { new: true }).exec();
    }

    async delete(id: string): Promise<Form> {
        return await this.formModel.findByIdAndDelete(id).exec();
    }
}