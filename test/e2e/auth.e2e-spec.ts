import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initializeE2ETest } from './initializeE2ETest';
import { access } from 'fs';

describe('AuthenticationController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    ({ mongod, app } = await initializeE2ETest(mongod, app));
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });

  it('/auth/login (POST)', async () => {
    const loginDto = {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201);

    expect(response.body).toHaveProperty('jwt');
  });

  it('/v2/auth/login (POST)', async () => {
    const loginDto = {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    };

    const response = await request(app.getHttpServer())
      .post('/v2/auth/login')
      .send(loginDto)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('/auth/refresh (POST)', async () => {
    const refreshToken = 'some-refresh-token';

    const loginResponse = await request(app.getHttpServer())
        .post('/v2/auth/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
        .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('/auth/refresh (POST) - should return 401 if no refresh token is provided', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);
  });

  it('/auth/register (GET)', async () => {
    const email = 'newuser@example.com';

    const response = await request(app.getHttpServer())
      .get('/auth/register')
      .query({ email })
      .expect(200);

    expect(response.body).toHaveProperty("success", true );
  });

  it('/auth/register (POST) - should forbid registration for domains not registered in the system', async () => {
    const accountSetupDto = {
      email: 'newuser@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(accountSetupDto)
      .expect(403);

  });
});