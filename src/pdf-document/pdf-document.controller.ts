import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PdfDocumentService } from 'src/pdf-document/pdf-document.service';
import { S3Service } from 'src/s3/s3.service';
import { Annotation } from 'src/schemas/annotation.schema';
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class PdfDocumentController {
  constructor(
    private readonly pdfService: PdfDocumentService,
    private readonly s3Service: S3Service,
    @InjectModel(Annotation.name)
    private annotationModel: Model<Annotation>,
  ) {}

  @Post()
  async uploadMetadata(@Body() body: CreatePDFDocumentDto) {
    const data = await this.pdfService.create(body);
    return data;
  }

  @Get()
  async getAllByOwner(
    @Query('ownerId') ownerId: string,
    @Query('limit') limit = '10',
    @Query('offset') offset = '0',
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const doc = await this.pdfService.getAccessibleDocs(
      ownerId,
      +limit,
      +offset,
      sortOrder,
    );
    console.log('Get documents by owner w limit:', limit, 'offset:', offset);
    console.log('Documents found:', doc.length);
    return { documents: doc, total: doc.length };
  }
  @Get('count')
  async getTotalDocs(@Query('ownerId') ownerId: string) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }
    const total = await this.pdfService.getAccessibleDocs(ownerId);
    console.log('Total documents for owner:', ownerId, 'is', total.length);
    return { total: total.length };
  }

  @Get('presign')
  async getPresignedUrl(@Query('s3Key') s3Key: string) {
    if (!s3Key) {
      throw new Error('s3Key is required');
    }

    const url = await this.s3Service.generatePresignedGetUrl(s3Key);
    return { url };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.pdfService.getPdfDoc(id);
  }

  @Post(':id/annotations')
  async saveAnnotation(
    @Param('id') docId: string,
    @Body() body: { xfdf: string },
  ) {
    // 1. Upload XFDF lên S3
    const key = `annotations/${docId}.xfdf`;
    const s3Url = await this.s3Service.uploadXFDF(key, body.xfdf);

    console.log('S3 URL:', s3Url);

    // 2. Lưu meta vào MongoDB
    await this.annotationModel.findOneAndUpdate(
      { docId },
      {
        docId,
        s3Key: key,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    return { s3Url };
  }

  @Get(':id/annotations')
  async getAnnotation(@Param('id') docId: string) {
    // 1. Lấy meta từ MongoDB
    const annot = await this.annotationModel.findOne({ docId });
    if (!annot) return { xfdf: null, url: null };

    const url = await this.s3Service.generatePresignedGetUrl(annot.s3Key);
    return { url };
  }

  @Get(':id/members')
  async getMembers(@Param('id') docId: string) {
    return this.pdfService.getMembers(docId);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') docId: string,
    @Body() body: { userId: string; role: 'viewer' | 'editor' },
  ) {
    return this.pdfService.addMember(docId, body.userId, body.role);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') docId: string,
    @Param('userId') userId: string,
  ) {
    return this.pdfService.removeMember(docId, userId);
  }

  @Patch(':id/members/:userId')
  async updateMemberRole(
    @Param('id') docId: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'viewer' | 'editor' },
  ) {
    return this.pdfService.updateMemberRole(docId, userId, body.role);
  }
}
