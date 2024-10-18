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

        authToken = await loginAsAdmin(app);
        projectId = await createProject(app, authToken, 'Test Project', 'Test Description');
    });

    afterAll(async () => {
        await mongod.stop();
        await app.close();
    });

    it('/forms (POST)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);
        expect(createdForm.name).toBe(formDto.name);
        expect(createdForm.description).toBe(formDto.description);
    });

    it('/forms/:formId (GET)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);
        const fetchedForm = await getForm(app, authToken, createdForm._id);
        expect(fetchedForm.name).toBe(formDto.name);
        expect(fetchedForm.description).toBe(formDto.description);
    });

    it('/forms/:formId (PATCH)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const updateDto = { name: 'Updated Form', description: 'Updated Description' };
        const updatedForm = await updateForm(app, authToken, createdForm._id, updateDto);

        expect(updatedForm.name).toBe(updateDto.name);
        expect(updatedForm.description).toBe(updateDto.description);
    });

    it('/forms/:formId (DELETE)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const response = await deleteForm(app, authToken, createdForm._id);
        expect(response.message).toBe('Form deleted successfully');
    });

    it('/forms/:formId/save-form (POST)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const saveFormDto = { draft: [{ field: 'value' }] };
        const response = await saveFormDraft(app, authToken, createdForm._id, saveFormDto);

        expect(response.success).toBe(true);
    });

    it('/forms/:formId/publish (PATCH)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        // Save draft
        await saveFormDraft(app, authToken, createdForm._id, { draft: [{ field: 'value' }] });

        const publishedForm = await publishForm(app, authToken, createdForm._id);
        expect(publishedForm.isPublished).toBe(true);
    });

    it('/forms/:formId/lock (POST)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const response = await lockForm(app, authToken, createdForm._id);
        expect(response.message).toBe('Form locked successfully');
    });

    it('/forms/:formId/keep-alive (POST)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const response = await keepFormAlive(app, authToken, createdForm._id);
        expect(response.statusCode).toBe(409); // Conflict expected because the form isn't locked
    });

    it('/forms/:formId/release-lock (POST)', async () => {
        const formDto = { name: 'Test Form', description: 'Test Description', projectId };
        const createdForm = await createForm(app, authToken, formDto);

        const response = await releaseFormLock(app, authToken, createdForm._id);
        expect(response.statusCode).toBe(409); // Conflict expected because the form isn't locked
    });

});

// Utility functions for code reusability
async function loginAsAdmin(app: INestApplication): Promise<string> {
    const testAdmin = SeedService.testAdmin;
    const response = await request(app.getHttpServer())
        .post('/v2/auth/login')
        .send({ email: testAdmin.email, password: testAdmin.password })
        .expect(201);
    return response.body.accessToken;
}

async function createProject(app: INestApplication, token: string, name: string, description: string) {
    const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name, description })
        .expect(201);
    return response.body.id;
}

async function createForm(app: INestApplication, token: string, formDto: any) {
    const response = await request(app.getHttpServer())
        .post('/forms')
        .set('Authorization', `Bearer ${token}`)
        .send(formDto)
        .expect(201);
    return response.body;
}

async function getForm(app: INestApplication, token: string, formId: string) {
    const response = await request(app.getHttpServer())
        .get(`/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    return response.body;
}

async function updateForm(app: INestApplication, token: string, formId: string, updateDto: any) {
    const response = await request(app.getHttpServer())
        .patch(`/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(200);
    return response.body;
}

async function deleteForm(app: INestApplication, token: string, formId: string) {
    const response = await request(app.getHttpServer())
        .delete(`/forms/${formId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    return response.body;
}

async function saveFormDraft(app: INestApplication, token: string, formId: string, draftData: any) {
    const response = await request(app.getHttpServer())
        .post(`/forms/${formId}/save-form`)
        .set('Authorization', `Bearer ${token}`)
        .send(draftData)
        .expect(201);
    return response.body;
}

async function publishForm(app: INestApplication, token: string, formId: string) {
    const response = await request(app.getHttpServer())
        .patch(`/forms/${formId}/publish`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    return response.body;
}

async function lockForm(app: INestApplication, token: string, formId: string) {
    const response = await request(app.getHttpServer())
        .post(`/forms/${formId}/lock`)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
    return response.body;
}

async function keepFormAlive(app: INestApplication, token: string, formId: string) {
    return await request(app.getHttpServer())
        .post(`/forms/${formId}/keep-alive`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409); // Conflict expected
}

async function releaseFormLock(app: INestApplication, token: string, formId: string) {
    return await request(app.getHttpServer())
        .post(`/forms/${formId}/release-lock`)
        .set('Authorization', `Bearer ${token}`)
        .expect(409); // Conflict expected
}
