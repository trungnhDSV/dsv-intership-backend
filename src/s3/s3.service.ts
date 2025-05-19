import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async generateSingleUploadUrl(
    fileName: string,
    fileType: string,
    userId: string,
  ) {
    const extension = fileName.split('.').pop();
    const s3Key = `users/${userId}/documents/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 60 });
    return { url, s3Key };
  }

  async generatePresignedGetUrl(s3Key: string): Promise<string> {
    console.log('Generating presigned URL for S3 key:', s3Key);
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: s3Key,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: 300, // URL có hiệu lực 5 phút
    });
  }
}
