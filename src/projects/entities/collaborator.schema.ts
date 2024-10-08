import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../../users/entities/user.schema';
import { ProjectRoleEnum } from './project-role.enum';
import { Project } from './project.schema';

export type CollaboratorDocument = HydratedDocument<Collaborator>;

@Schema({})
export class Collaborator {
  constructor(collaborator: Partial<Collaborator>) {
    Object.assign(this, collaborator);
  }

  @Prop({ required: true })
  _id: Types.ObjectId;

  // reference to Project
  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project: Types.ObjectId;

  // reference to User
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  // user email
  @Prop({ type: String})
  email: string;

  @Prop({ type: [String], enum: ProjectRoleEnum, required: true })
  roles: ProjectRoleEnum[];
}

export const CollaboratorSchema = SchemaFactory.createForClass(Collaborator);
