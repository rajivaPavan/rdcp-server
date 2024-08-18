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
}

@Schema()
export class Collaborator {

    constructor(collaborator: Partial<Collaborator>) {
        Object.assign(this, collaborator);
    }

    // reference to Project
    @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
    project: Types.ObjectId;

    // reference to User
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user: Types.ObjectId;

    @Prop({ type: [String], enum: ProjectRoleEnum, required: true })
    roles: ProjectRoleEnum[];
}

export const CollaboratorSchema = SchemaFactory.createForClass(Collaborator);
export const ProjectSchema = SchemaFactory.createForClass(Project);




