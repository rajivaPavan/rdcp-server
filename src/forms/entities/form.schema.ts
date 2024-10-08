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

  @Prop({ default: false })
  hasChanges: boolean;

  @Prop({ default: true })
  multipleResponses: boolean;

  // published Schema
  @Prop({ type: Array, required: false, default: [] })
  schema: Record<string, any>[];

  // draft Schema
  @Prop({ type: Array, required: false, default: [] })
  draft: Record<string, any>[];

  @Prop({ type: [{ email: String, id: String }], default: [] })
  participants: { email: string; id: string }[];
}
export const FormSchema = SchemaFactory.createForClass(Form);
