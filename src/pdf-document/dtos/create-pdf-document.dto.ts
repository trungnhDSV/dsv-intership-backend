// src/documents/dto/create-pdf-document.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePDFDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  s3Key: string;

  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;
}
