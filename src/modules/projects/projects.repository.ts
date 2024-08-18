import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collaborator, Project } from './projects.schema';

@Injectable()
export class ProjectRepository {

  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  async create(project: Project): Promise<Project> {
    return this.projectModel.create(project);
  }

  async find(options: any): Promise<Project[]> {
    return this.projectModel.find(options).exec();
  }

  async findById(id: string): Promise<Project> {
    return this.projectModel.findById(new Types.ObjectId(id)).exec();
  }

  async update(id: string, project: Project): Promise<Project> {
    return this.projectModel.findByIdAndUpdate
    (id, project, { new: true }).exec();
  }

  async delete(id: string): Promise<Project> {
    return this.projectModel.findByIdAndDelete(id).exec();
  }

}
