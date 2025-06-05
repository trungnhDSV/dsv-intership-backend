// src/documents/dto/create-pdf-document.dto.ts
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';

class GoogleDriveInfo {
  @IsNotEmpty()
  @IsString()
  fileId: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

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

  @IsOptional()
  @ValidateNested()
  @Type(() => GoogleDriveInfo)
  googleDrive?: GoogleDriveInfo;
}
