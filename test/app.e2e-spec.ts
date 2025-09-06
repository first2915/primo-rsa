import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

import * as supertest from 'supertest';
const request = supertest.default;

describe('Crypto (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/get-encrypt-data (POST) and /get-decrypt-data (POST)', async () => {
    const payload = 'hello hello testing 123';
    const enc = await request(app.getHttpServer())
      .post('/get-encrypt-data')
      .send({ payload })
      .expect(201);
    expect(enc.body.successful).toBe(true);
    const { data1, data2 } = enc.body.data;

    const dec = await request(app.getHttpServer())
      .post('/get-decrypt-data')
      .send({ data1, data2 })
      .expect(201);
    expect(dec.body.successful).toBe(true);
    expect(dec.body.data.payload).toBe(payload);
  });

  afterAll(async () => {
    await app.close();
  });
});
