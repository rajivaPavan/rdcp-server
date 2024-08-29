import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './entities/project.schema';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(project: Project): Promise<Project> {
    return this.projectModel.create(project);
  }

  async find(options: any): Promise<Project[]> {
    return this.projectModel.find(options).exec();
  }

  async findById(id: string): Promise<Project> {
    return this.projectModel.findById(id).exec();
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    return await this.projectModel
      .findByIdAndUpdate(id, project, { new: true })
      .exec();
  }

  async delete(id: string) {
    return await this.projectModel.findByIdAndDelete(id).exec();
  }
}
