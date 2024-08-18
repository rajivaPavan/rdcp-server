import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

export enum RoleEnum {
  ADMIN = 'admin',
  USER = 'user'
}

@Schema({timestamps: true})
export class User {

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Prop({type: Types.ObjectId, auto: true})
  _id: Types.ObjectId;

  @Prop({required: true})
  name: string;

  @Prop({required: true, unique: true})
  email: string;

  @Prop()
  password: string;

  @Prop({required: true, enum: RoleEnum})
  role: RoleEnum;
}

export const UserSchema = SchemaFactory.createForClass(User);
