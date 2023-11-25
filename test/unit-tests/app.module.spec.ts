import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    const appController = appModule.get<AppController>(AppController);
    const appService = appModule.get<AppService>(AppService);
    
    expect(appModule).toBeDefined();
    expect(appController).toBeDefined();
    expect(appService).toBeDefined();
  });
});