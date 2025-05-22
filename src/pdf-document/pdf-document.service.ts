import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PDFDocument } from 'src/schemas/pdf-document.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class PdfDocumentService {
  constructor(
    @InjectModel(PDFDocument.name)
    private readonly pdfModel: Model<PDFDocument>,
    @InjectModel(User.name) //
    private readonly userModel: Model<User>,
  ) {}
  async create(dto: CreatePDFDocumentDto): Promise<PDFDocument> {
    const user = await this.userModel.findById(dto.ownerId);

    if (!user) throw new NotFoundException('User does not exist');

    const data = await this.pdfModel.create({
      ...dto,
      ownerName: user.fullName,
      // onwnerAvatar: user.avatar,
      uploadedAt: new Date(),
    });
    return data;
  }

  async getPdfDoc(id: string): Promise<PDFDocument> {
    const document = await this.pdfModel
      .findById(id)
      .populate('ownerId', 'fullName avatar');
    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async getPdfDocs(
    ownerId: string,
    limit: number,
    offset: number,
    sortOrder: 'asc' | 'desc',
  ) {
    const sortValue = sortOrder === 'asc' ? 1 : -1;
    const [documents, total] = await Promise.all([
      this.pdfModel
        .find({ ownerId })
        .sort({ uploadedAt: sortValue }) // Sort ASC/DESC
        .skip(offset)
        .limit(limit),
      this.pdfModel.countDocuments({ ownerId }),
    ]);
    console.log('TOTAL Documents founded:', total);
    return { documents, total };
  }
}
