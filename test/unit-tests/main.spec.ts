import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';

describe('Main', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should start the application', async () => {
    expect(app).toBeDefined();
  });

  /*
  it('should listen on port 3000', async () => {
    const server = app.getHttpServer();

    jest.setTimeout(5000);

    const address = server.address();

    expect(address).toBeDefined();
    expect(address?.port).toBe(3000);
  });
  */
});