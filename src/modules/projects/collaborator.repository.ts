import { InjectModel } from "@nestjs/mongoose";
import { Collaborator } from "./projects.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CollaboratorRepository  {

    constructor(
        @InjectModel(Collaborator.name) private collaboratorModel: Model<Collaborator>
    ) {}

    async create(collaborator: Collaborator): Promise<Collaborator> {
        return new this.collaboratorModel(collaborator).save();
    }

    async find(options: any): Promise<Collaborator[]> {
        return this.collaboratorModel.find(options).exec();
    }

    async findOne(options: any): Promise<Collaborator> {
        return this.collaboratorModel.findOne(options).exec();
    }
}