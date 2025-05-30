import { Module } from '@nestjs/common';
import { PdfDocumentController } from './pdf-document.controller';
import { PdfDocumentService } from './pdf-document.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PDFDocument,
  PDFDocumentSchema,
} from 'src/schemas/pdf-document.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Annotation, AnnotationSchema } from 'src/schemas/annotation.schema';
import { S3Service } from 'src/s3/s3.service';

@Module({
  controllers: [PdfDocumentController],
  providers: [PdfDocumentService, S3Service],
  imports: [
    MongooseModule.forFeature([
      { name: PDFDocument.name, schema: PDFDocumentSchema },
      { name: User.name, schema: UserSchema },
      { name: Annotation.name, schema: AnnotationSchema },
    ]),
  ],
})
export class PdfDocumentModule {}
