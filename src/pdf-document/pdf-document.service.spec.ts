import { Test, TestingModule } from '@nestjs/testing';
import { PdfDocumentService } from './pdf-document.service';

describe('PdfDocumentService', () => {
  let service: PdfDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfDocumentService],
    }).compile();

    service = module.get<PdfDocumentService>(PdfDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
