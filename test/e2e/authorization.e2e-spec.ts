import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initializeE2ETest } from './initializeE2ETest';
import { SeedService } from 'src/users/seed';
import { ProjectRoleEnum } from 'src/projects/entities/project-role.enum';

describe('Authorization (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let projectId: string;
    let authToken: string;

    beforeAll(async () => {
        ({ mongod, app } = await initializeE2ETest(mongod, app));

        // Login as user 1 (Admin/Creator)
        authToken = await loginUser(SeedService.testUsers[0]);

        // Create a project
        projectId = await createProject('Test Project', 'Test Description', authToken);

        // Add collaborators
        await addCollaborator(SeedService.testUsers[1], ProjectRoleEnum.MANAGER);
        await addCollaborator(SeedService.testUsers[2], ProjectRoleEnum.EDITOR);
        await addCollaborator(SeedService.testUsers[3], ProjectRoleEnum.ANALYST);
    });

    afterAll(async () => {
        await mongod.stop();
        await app.close();
    });

    it('should return 403 when user is not a collaborator', async () => {
        const authTokenUser5 = await loginUser(SeedService.testUsers[4]);

        await request(app.getHttpServer())
            .get(`/projects/${projectId}`)
            .set('Authorization', `Bearer ${authTokenUser5}`)
            .expect(403);
    });

    // Helper function for logging in a user
    const loginUser = async (user: { email: string, password: string }): Promise<string> => {
        const loginResponse = await request(app.getHttpServer())
            .post('/v2/auth/login')
            .send({ email: user.email, password: user.password })
            .expect(201);

        expect(loginResponse.body.accessToken).toBeDefined();
        return loginResponse.body.accessToken;
    };

    // Helper function to create a project
    const createProject = async (name: string, description: string, token: string): Promise<string> => {
        const projectResponse = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${token}`)
            .send({ name, description })
            .expect(201);

        expect(projectResponse.body.id).toBeDefined();
        return projectResponse.body.id;
    };

    // Helper function to fetch a user and add as collaborator
    const addCollaborator = async (user: { email: string }, role: ProjectRoleEnum): Promise<void> => {
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
});
