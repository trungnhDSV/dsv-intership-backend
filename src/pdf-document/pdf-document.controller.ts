import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PdfDocumentService } from 'src/pdf-document/pdf-document.service';

@Controller('documents')
export class PdfDocumentController {
  constructor(private readonly pdfService: PdfDocumentService) {}

  @Post()
  async uploadMetadata(@Body() body: CreatePDFDocumentDto) {
    return this.pdfService.create(body);
  }

  @Get()
  async getAllByOwner(@Query('ownerId') ownerId: string) {
    return this.pdfService.findAllByOwner(ownerId);
  }
}
