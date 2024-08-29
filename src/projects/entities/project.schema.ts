import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  constructor(project: Partial<Project>) {
    Object.assign(this, project);
  }

  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ auto: true })
  createdAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
