// testHelpers.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProjectRoleEnum } from 'src/projects/entities/project-role.enum';

export const deleteProject = async (app: INestApplication, projectId: string, token: string, expectedStatus: number): Promise<void> => {
    await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(expectedStatus);
};

export const loginUser = async (app: INestApplication, user: { email: string, password: string }): Promise<string> => {
    const loginResponse = await request(app.getHttpServer())
        .post('/v2/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(201);

    expect(loginResponse.body.accessToken).toBeDefined();
    return loginResponse.body.accessToken;
};

export const createProject = async (app: INestApplication, name: string, description: string, token: string): Promise<string> => {
    const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name, description })
        .expect(201);

    expect(projectResponse.body.id).toBeDefined();
    return projectResponse.body.id;
};

export const addCollaborator = async (app: INestApplication, authToken: string, projectId: string, user: { email: string }, role: ProjectRoleEnum): Promise<void> => {
    const userResponse = await request(app.getHttpServer())
        .get(`/users/search?email=${user.email}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

    expect(userResponse.body.length).toBe(1);
    const userId = userResponse.body[0].id;

    await request(app.getHttpServer())
        .post(`/projects/${projectId}/collaborators`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            users: [
                { id: userId, email: user.email }
            ],
            roles: [role]
        })
        .expect(201);
};