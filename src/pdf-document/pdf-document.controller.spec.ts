import { Test, TestingModule } from '@nestjs/testing';
import { PdfDocumentController } from './pdf-document.controller';

describe('PdfDocumentController', () => {
  let controller: PdfDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfDocumentController],
    }).compile();

    controller = module.get<PdfDocumentController>(PdfDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
