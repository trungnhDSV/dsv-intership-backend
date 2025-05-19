import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PDFDocument } from 'src/schemas/pdf-document.schema';

@Injectable()
export class PdfDocumentService {
  constructor(
    @InjectModel(PDFDocument.name)
    private readonly pdfModel: Model<PDFDocument>,
  ) {}
  async create(dto: CreatePDFDocumentDto): Promise<PDFDocument> {
    return await this.pdfModel.create({
      ...dto,
      uploadedAt: new Date(),
    });
  }

  async findAllByOwner(ownerId: string) {
    return this.pdfModel.find({ ownerId }).sort({ uploadedAt: -1 });
  }
}
