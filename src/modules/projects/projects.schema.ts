import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "../user/user.schema";

export type ProjectDocument = HydratedDocument<Project>;
export type CollaboratorDocument = HydratedDocument<Collaborator>;

export enum ProjectRoleEnum {
    OWNER = 'owner',
    MANAGER = 'manager',
    EDITOR = 'editor',
    ANALYST = 'analyst',
    ANALYST_VIEW_ONLY = 'analyst_view_only',
}

@Schema()
export class Collaborator {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true }) // Reference to the User schema
    userId: Types.ObjectId;

    @Prop({ type: [String], enum: ProjectRoleEnum, required: true })
    roles: ProjectRoleEnum[];
}

export const CollaboratorSchema = SchemaFactory.createForClass(Collaborator);

@Schema({ timestamps: true })
export class Project {
    
    constructor(project: Partial<Project>) {
        Object.assign(this, project);
    }

    @Prop({ type: Types.ObjectId, auto: true }) 
    _id: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: [CollaboratorSchema], default: [] })
    collaborators: Collaborator[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);




