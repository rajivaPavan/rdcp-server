// src/users/entities/whitelist.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WhitelistDocument = Whitelist & Document;

@Schema({ timestamps: true })
export class Whitelist {
  @Prop({ required: true, unique: true })
  domain: string;
}

export const WhitelistSchema = SchemaFactory.createForClass(Whitelist);
