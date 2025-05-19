import { Controller, Post, Body } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('upload-url')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  async generate(
    @Body() body: { fileName: string; fileType: string; userId: string },
  ) {
    const { fileName, fileType, userId } = body;
    console.log('Received body:', body);

    if (!fileName || !fileType || !userId) {
      throw new Error('Missing required fields');
    }

    return await this.s3Service.generateSingleUploadUrl(
      fileName,
      fileType,
      userId,
    );
  }
}
