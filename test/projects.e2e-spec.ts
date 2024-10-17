import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule, dbModule } from '../src/app.module';
import { CoreModule } from 'src/core.module';
import { ConfigModule } from '@nestjs/config';
import { MockRedisModule } from 'src/redis/redis.module';
import { SeedService } from 'src/users/seed';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';

describe('ProjectsController (e2e)', () => {
    let app: INestApplication;
    let authToken: string;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                }),
                MockRedisModule,
                dbModule,
                CoreModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        const seed = app.get(SeedService);
        seed.initAdmin();
        
        app.enableVersioning({
            defaultVersion: '1',
            type: VersioningType.URI
        });
          
        // Log in to get the auth token using loginV2
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
            .expect(201);

        console.log(loginResponse.body);
        authToken = loginResponse.body.jwt;
    });

    afterAll(async () => {
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