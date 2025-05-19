import { Module } from '@nestjs/common';
import { PdfDocumentController } from './pdf-document.controller';
import { PdfDocumentService } from './pdf-document.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PDFDocument,
  PDFDocumentSchema,
} from 'src/schemas/pdf-document.schema';

@Module({
  controllers: [PdfDocumentController],
  providers: [PdfDocumentService],
  imports: [
    MongooseModule.forFeature([
      { name: PDFDocument.name, schema: PDFDocumentSchema },
    ]),
  ],
})
export class PdfDocumentModule {}
