import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initializeE2ETest } from './initializeE2ETest';
import { SeedService } from 'src/users/seed';
import { ProjectRoleEnum } from 'src/projects/entities/project-role.enum';
import { addCollaborator, createProject, deleteProject, loginUser } from './testHelpers';

describe('Authorization (e2e)', () => {
    let app: INestApplication;
    let mongod: MongoMemoryServer;
    let projectId: string;
    let authToken: string;

    beforeAll(async () => {
        ({ mongod, app } = await initializeE2ETest(mongod, app));

        // Login as user 1 (Admin/Creator)
        authToken = await loginUser(app, SeedService.testUsers[0]);

        // Create a project
        projectId = await createProject(app, 'Test Project', 'Test Description', authToken);

        // Add collaborators
        await addCollaborator(app, authToken, projectId, SeedService.testUsers[1], ProjectRoleEnum.MANAGER);
        await addCollaborator(app, authToken, projectId, SeedService.testUsers[2], ProjectRoleEnum.EDITOR);
        await addCollaborator(app, authToken, projectId, SeedService.testUsers[3], ProjectRoleEnum.ANALYST);
    });

    afterAll(async () => {
        await mongod.stop();
        await app.close();
    });

    it('should return 403 when user is not a collaborator', async () => {
        const authTokenUser5 = await loginUser(app, SeedService.testUsers[4]);

        await request(app.getHttpServer())
            .get(`/projects/${projectId}`)
            .set('Authorization', `Bearer ${authTokenUser5}`)
            .expect(403);
    });

    it('should return 403 when user is not an owner and tries to delete project', async () => {
        for (let i = 1; i < 4; i++) {
            const userToken = await loginUser(app, SeedService.testUsers[i]);
            await deleteProject(app, projectId, userToken, 403);
        }
    });

    it('should return 204 when user is an owner and tries to delete project', async () => {
        await deleteProject(app, projectId, authToken, 200);
    });
});
