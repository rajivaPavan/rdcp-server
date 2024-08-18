import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps: true})
export class User {

  @Prop({type: Types.ObjectId})
  _id: Types.ObjectId;

  @Prop({required: true})
  name: string;

  @Prop({required: true})
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: RoleEnum;
}

export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user'
}

export const UserSchema = SchemaFactory.createForClass(User);
