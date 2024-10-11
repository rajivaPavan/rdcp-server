import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WhitelistedDomainDocument = HydratedDocument<WhitelistedDomain>;

@Schema({ timestamps: true })
export class WhitelistedDomain {
    constructor(partial: Partial<WhitelistedDomain>) {
        Object.assign(this, partial);
    }

    _id: Types.ObjectId;

    @Prop({ required: true })
    domain: string;
}

export const WhitelistedDomainSchema = SchemaFactory.createForClass(WhitelistedDomain);
