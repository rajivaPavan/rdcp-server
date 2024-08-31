import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Project } from '../../projects/entities/project.schema';

export type FormDocument = HydratedDocument<Form>;

@Schema({ timestamps: true })
export class Form {
  constructor(form: Partial<Form>) {
    Object.assign(this, form);
  }

  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ auto: true })
  createdAt: Date;

  @Prop({ auto: true })
  updatedAt: Date;

  @Prop({ default: true })
  isPrivate: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: true })
  multipleResponses: boolean;
}

export const FormSchema = SchemaFactory.createForClass(Form);
