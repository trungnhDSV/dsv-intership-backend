import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PdfDocumentService } from 'src/pdf-document/pdf-document.service';
import { S3Service } from 'src/s3/s3.service';

@Controller('documents')
export class PdfDocumentController {
  constructor(
    private readonly pdfService: PdfDocumentService,
    private readonly s3Service: S3Service,
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
    console.log('getAllByOwner', {
      ownerId,
      limit,
      offset,
      sortOrder,
    });
    return this.pdfService.getPdfDocs(ownerId, +limit, +offset, sortOrder);
  }

  @Get('presign')
  async getPresignedUrl(@Query('s3Key') s3Key: string) {
    console.log('getPresignedUrl', { s3Key });
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
}
