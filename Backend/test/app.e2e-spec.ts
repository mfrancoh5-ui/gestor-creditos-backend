import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - Health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /auth/login - Endpoint existe', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.local',
        password: 'admin123',
      });

    // Solo verificar que el endpoint existe y responde (sin validar estructura)
    expect([200, 401, 400]).toContain(response.status);
  });

  it('POST /clientes - Endpoint existe', async () => {
    const response = await request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', 'Bearer dummy-token')
      .send({
        nombres: 'Test',
        apellidos: 'User',
        dni: '12345678',
        telefono: '1234567890',
      });

    // Solo verificar que el endpoint existe
    expect([200, 201, 400, 401]).toContain(response.status);
  });
});
