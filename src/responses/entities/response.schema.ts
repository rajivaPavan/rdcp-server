import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ResponseDocument = HydratedDocument<Response>;

@Schema({ timestamps: true })
export class Response {
  constructor(response: Partial<Response>) {
    Object.assign(this, response);
  }

  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  formId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  projectId: Types.ObjectId;

//   @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ type: Types.Map, required: true })
  record: Record<string, any>;
}

export const ResponseSchema = SchemaFactory.createForClass(Response);