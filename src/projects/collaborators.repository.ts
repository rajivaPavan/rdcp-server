import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Collaborator } from './entities/collaborator.schema';
import { ProjectRoleEnum } from './entities/project-role.enum';

@Injectable()
export class CollaboratorsRepository {
  constructor(
    @InjectModel(Collaborator.name)
    private collaboratorModel: Model<Collaborator>,
  ) { }

  async create(collaborator: Partial<Collaborator>): Promise<Collaborator> {
    return new this.collaboratorModel({
      _id: new Types.ObjectId(),
      ...collaborator,
    }).save();
  }

  async find(options: any): Promise<Collaborator[]> {
    return this.collaboratorModel.find(options).exec();
  }

  async findOne(options: any): Promise<Collaborator> {
    return this.collaboratorModel.findOne(options).exec();
  }

  async createMany(collaborators: Partial<Collaborator>[]): Promise<Collaborator[]> {
    const collaboratorsWithIds = collaborators.map((collaborator) => (new Collaborator({
      _id: new Types.ObjectId(),
      ...collaborator,
    })));
    return this.collaboratorModel.insertMany(collaboratorsWithIds);
  }

  async update(id:string, update: Partial<Collaborator>): Promise<Collaborator> {
    return this.collaboratorModel.findByIdAndUpdate(id, update).exec();
  }

  async updateOne(filter: any, update: any): Promise<any> {
    return this.collaboratorModel.updateOne(filter, update).exec();
  }

  async deleteOne(options: any): Promise<any> {
    return this.collaboratorModel.deleteOne(options).exec();
  }

  async delete(id: string): Promise<any> {
    return this.collaboratorModel.findByIdAndDelete(id).exec();
  }

  async findOwnerByProjectIdAndUserId(projectId: string, userId: string): Promise<Collaborator | null> {
    return this.collaboratorModel.findOne({
      projectId,
      userId,
      roles: ProjectRoleEnum.OWNER,
    }).exec();
  }
}
