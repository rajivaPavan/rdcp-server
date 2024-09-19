import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Collaborator } from './entities/collaborator.schema';

@Injectable()
export class CollaboratorsRepository {
  constructor(
    @InjectModel(Collaborator.name)
    private collaboratorModel: Model<Collaborator>,
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

  async createMany(collaborators: Collaborator[]): Promise<Collaborator[]> {
    return this.collaboratorModel.insertMany(collaborators);
  }

  /*async updateOne(collaborator: Collaborator): Promise<any> {
    return this.collaboratorModel.updateOne(collaborator).exec();
  }*/

  async updateOne(filter: any, update: any): Promise<any> {
    return this.collaboratorModel.updateOne(filter, update).exec();
  }

  async deleteOne(options: any): Promise<any> {
    return this.collaboratorModel.deleteOne(options).exec();
  }
}
