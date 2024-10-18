import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { initializeE2ETest } from './initializeE2ETest';
import { SeedService } from 'src/users/seed';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    ({ mongod, app } = await initializeE2ETest(mongod, app));
    const testAdmin = SeedService.testAdmin;

    // Log in to get the auth token using loginV2
    const loginResponse = await request(app.getHttpServer())
      .post('/v2/auth/login')
      .send({ email: testAdmin.email, password: testAdmin.password })
      .expect(201);

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await mongod.stop();
    await app.close();
  });

  const createProjectDto = {
    name: 'Test Project',
    description: 'Test Description',
  };

  const updatedProjectDto = {
    name: 'Updated Project',
    description: 'Updated Description',
  };

  const createProject = async () => {
    return await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createProjectDto)
      .expect(201);
  };

  it('should create a new project (/projects POST)', async () => {
    const response = await createProject();

    expect(response.body.name).toBe(createProjectDto.name);
    expect(response.body.description).toBe(createProjectDto.description);
  });

  it('should get all projects (/projects GET)', async () => {
    await createProject();

    const response = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a project by ID (/projects/:id GET)', async () => {
    const createdProject = await createProject();

    const response = await request(app.getHttpServer())
      .get(`/projects/${createdProject.body.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createProjectDto.name);
    expect(response.body.description).toBe(createProjectDto.description);
  });

  it('should update a project by ID (/projects PATCH)', async () => {
    const createdProject = await createProject();

    const updateProjectDto = {
      id: createdProject.body.id,
      ...updatedProjectDto,
    };

    const response = await request(app.getHttpServer())
      .patch(`/projects`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateProjectDto)
      .expect(200);

    expect(response.body.message).toBe('Project updated successfully');
    expect(response.body.project.name).toBe(updatedProjectDto.name);
    expect(response.body.project.description).toBe(updatedProjectDto.description);
  });

  it('should delete a project by ID (/projects/:id DELETE)', async () => {
    const createdProject = await createProject();

    const response = await request(app.getHttpServer())
      .delete(`/projects/${createdProject.body.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.message).toBe('Project deleted successfully');
  });

  it('should return 404 for non-existent project ID (/projects/:id GET)', async () => {
    const nonExistentId = '5f8f8c44b54764421b7156f1';
    
    await request(app.getHttpServer())
      .get(`/projects/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should return 400 for invalid project creation (/projects POST)', async () => {
    const invalidCreateDto = { description: 'Missing name' };

    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidCreateDto)
      .expect(400);
  });

  it('should return 401 for unauthorized access to projects (/projects GET)', async () => {
    await request(app.getHttpServer())
      .get('/projects')
      .expect(401);
  });
});
