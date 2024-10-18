import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initializeE2ETest } from './initializeE2ETest';
import { SeedService } from 'src/users/seed';

describe('FormsController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let mongod: MongoMemoryServer;
    let projectId: string;

    beforeAll(async () => {
        ({ mongod, app } = await initializeE2ETest(mongod, app));
        
        const testAdmin = SeedService.testAdmin;

        // Log in to get the auth token
        const loginResponse = await request(app.getHttpServer())
            .post('/v2/auth/login')
            .send({ email: testAdmin.email, password: testAdmin.password })
            .expect(201);

        authToken = loginResponse.body.accessToken;

        // Create a project
        const projectCreation = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Test Project', description: 'Test Description' })
            .expect(201);

        projectId = projectCreation.body.id;

    });

    afterAll(async () => {
        await mongod.stop();
        await app.close();
    });

    it('/forms (POST)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const response = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        expect(response.body.name).toBe(createFormDto.name);
        expect(response.body.description).toBe(createFormDto.description);
    });

    it('/forms/:formId (GET)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        const response = await request(app.getHttpServer())
            .get(`/forms/${createdForm.body._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe(createFormDto.name);
        expect(response.body.description).toBe(createFormDto.description);
    });

    it('/forms/:formId (PATCH)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        const updateFormDto = {
            name: 'Updated Form',
            description: 'Updated Description',
        };

        const response = await request(app.getHttpServer())
            .patch(`/forms/${createdForm.body._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateFormDto)
            .expect(200);

        expect(response.body.name).toBe(updateFormDto.name);
        expect(response.body.description).toBe(updateFormDto.description);
    });

    it('/forms/:formId (DELETE)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        const response = await request(app.getHttpServer())
            .delete(`/forms/${createdForm.body._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.message).toBe('Form deleted successfully');
    });

    it('/forms/:formId/save-form (POST)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        const saveFormDto = { draft: [{ field: 'value' }] };

        const response = await request(app.getHttpServer())
            .post(`/forms/${createdForm.body.id}/save-form`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(saveFormDto)
            .expect(201);

        expect(response.body.success).toBe(true);
    });

    it('/forms/:formId/publish (PATCH)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        // draft form
        await request(app.getHttpServer())
            .post(`/forms/${createdForm.body.id}/save-form`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ data: [{ field: 'value' }] })
            .expect(201);

        const response = await request(app.getHttpServer())
            .patch(`/forms/${createdForm.body.id}/publish`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('isPublished', true);
    });

    it('/forms/:formId/lock (POST)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        const response = await request(app.getHttpServer())
            .post(`/forms/${createdForm.body.id}/lock`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(201);

    });

    it('/forms/:formId/keep-alive (POST)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        // Expect to Conflict because the form is not locked
        const response = await request(app.getHttpServer())
            .post(`/forms/${createdForm.body.id}/keep-alive`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(409);

    });

    it('/forms/:formId/release-lock (POST)', async () => {
        const createFormDto = {
            name: 'Test Form',
            description: 'Test Description',
            projectId,
        };

        const createdForm = await request(app.getHttpServer())
            .post('/forms')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createFormDto)
            .expect(201);

        // Expect to Conflict because the form is not locked
        const response = await request(app.getHttpServer())
            .post(`/forms/${createdForm.body.id}/release-lock`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(409);

    });

});