import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { CoreModule } from 'src/core.module';
import { ConfigModule } from '@nestjs/config';
import { MockRedisModule } from 'src/redis/redis.module';
import { SeedService } from 'src/users/seed';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

describe('ProjectsController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {

        mongod = await MongoMemoryServer.create({
            instance: {
                dbName: 'rdcp_test_db',
            },
            binary: {
                version: '6.0.0',
            }
        });
        const uri = mongod.getUri();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                MockRedisModule,
                MongooseModule.forRoot(uri),
                CoreModule,
            ],
        }).compile();
        const seed =  moduleFixture.get(SeedService);
        await seed.initAdmin();

        app = moduleFixture.createNestApplication({
        });

        app.enableVersioning({
            defaultVersion: [VERSION_NEUTRAL],
            type: VersioningType.URI
        });

        await app.init();

          
        // Log in to get the auth token using loginV2
        const loginResponse = await request(app.getHttpServer())
            .post('/v2/auth/login')
            .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
            .expect(201);

        authToken = loginResponse.body.accessToken;
    });

    afterAll(async () => {
        await mongod.stop();
        await app.close();
    });

    it('/projects (POST)', async () => {
        const createProjectDto = {
            name: 'Test Project',
            description: 'Test Description',
        };

        const response = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createProjectDto)
            .expect(201);

        expect(response.body.name).toBe(createProjectDto.name);
        expect(response.body.description).toBe(createProjectDto.description);
    });

    it('/projects (GET)', async () => {
        const response = await request(app.getHttpServer())
            .get('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
    });

    it('/projects/:id (GET)', async () => {
        const createProjectDto = {
            name: 'Test Project',
            description: 'Test Description',
        };

        const createdProject = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createProjectDto)
            .expect(201);

        const response = await request(app.getHttpServer())
            .get(`/projects/${createdProject.body.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(createProjectDto.name);
        expect(response.body.description).toBe(createProjectDto.description);
    });

    it('/projects/:id (PATCH)', async () => {
        const createProjectDto = {
            name: 'Test Project',
            description: 'Test Description',
        };

        const createdProject = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createProjectDto)
            .expect(201);

        const updateProjectDto = {
            id: createdProject.body.id,
            name: 'Updated Project',
            description: 'Updated Description',
        };

        const response = await request(app.getHttpServer())
            .patch(`/projects`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updateProjectDto)
            .expect(200);

        expect(response.body.message).toBe('Project updated successfully');
    });

    it('/projects/:id (DELETE)', async () => {
        const createProjectDto = {
            name: 'Test Project',
            description: 'Test Description',
        };

        const createdProject = await request(app.getHttpServer())
            .post('/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send(createProjectDto)
            .expect(201);

        const response = await request(app.getHttpServer())
            .delete(`/projects/${createdProject.body.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        expect(response.body.message).toBe('Project deleted successfully');
    });
});