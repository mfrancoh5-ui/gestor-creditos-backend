import { Test, TestingModule } from '@nestjs/testing';
import { CreditosController } from './creditos.controller';

describe('CreditosController', () => {
  let controller: CreditosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreditosController],
    }).compile();

    controller = module.get<CreditosController>(CreditosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
