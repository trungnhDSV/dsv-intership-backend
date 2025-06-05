import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreatePDFDocumentDto } from 'src/pdf-document/dtos/create-pdf-document.dto';
import { PDFDocument } from 'src/schemas/pdf-document.schema';
import { User } from 'src/schemas/user.schema';

export interface MemberInfoDto {
  fullName: string;
  email: string;
  role: 'owner' | 'viewer' | 'editor';
  id: string;
}

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

  async getAccessibleDocs(
    userId: string,
    limit?: number,
    offset?: number,
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    // Query: doc mà (ownerId = userId) hoặc (members có userId & role = viewer/editor)
    // Sử dụng $or để lấy cả 2 loại

    const objUserId = new mongoose.Types.ObjectId(userId);

    console.log(
      'Fetching documents for userId:',
      'limit:',
      limit,
      'offset:',
      offset,
    );

    console.log(limit, offset);

    if (limit === undefined || offset === undefined)
      return this.pdfModel
        .find({
          $or: [
            { ownerId: objUserId },
            {
              members: {
                $elemMatch: {
                  userId: objUserId,
                  role: { $in: ['editor', 'viewer'] },
                },
              },
            },
          ],
        })
        .sort({ uploadedAt: sortOrder === 'asc' ? 1 : -1 })
        .exec();

    console.log('Fetching documents with limit and offset:');
    return this.pdfModel
      .find({
        $or: [
          { ownerId: objUserId },
          {
            members: {
              $elemMatch: {
                userId: objUserId,
                role: { $in: ['editor', 'viewer'] },
              },
            },
          },
        ],
      })
      .sort({ uploadedAt: sortOrder === 'asc' ? 1 : -1 })
      .skip(offset)
      .limit(limit)
      .exec();
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

  private async formatMembers(doc: PDFDocument): Promise<MemberInfoDto[]> {
    await doc.populate('members.userId', 'fullName email');
    const owner = await this.userModel.findById(doc.ownerId);
    console.log('Owner:', owner);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    const members: MemberInfoDto[] = doc.members.map((m: any) => ({
      fullName: m.userId.fullName,
      email: m.userId.email,
      role: m.role,
      id: m.userId._id.toString(),
    }));

    return [
      {
        fullName: owner.fullName,
        email: owner.email,
        role: 'owner',
        id: owner.id.toString(),
      },
      ...members,
    ];
  }

  async getMembers(docId: string): Promise<MemberInfoDto[]> {
    const doc = await this.pdfModel.findById(docId);
    if (!doc) throw new NotFoundException('Document not found');
    return this.formatMembers(doc);
  }

  async addMember(
    docId: string,
    userId: string,
    role: 'viewer' | 'editor',
  ): Promise<MemberInfoDto[]> {
    const doc = await this.pdfModel.findById(docId);
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.ownerId.toString() === userId)
      throw new BadRequestException('Cannot add owner as member');
    if (doc.members.some((m) => m.userId.toString() === userId))
      throw new BadRequestException('User is already a member');

    doc.members.push({ userId: new mongoose.Types.ObjectId(userId), role });
    await doc.save();
    return this.formatMembers(doc);
  }

  async removeMember(docId: string, userId: string): Promise<MemberInfoDto[]> {
    const doc = await this.pdfModel.findById(docId);
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.ownerId.toString() === userId)
      throw new BadRequestException('Cannot remove owner');
    doc.members = doc.members.filter((m) => m.userId.toString() !== userId);
    await doc.save();
    return this.formatMembers(doc);
  }

  async updateMemberRole(
    docId: string,
    userId: string,
    role: 'viewer' | 'editor',
  ): Promise<MemberInfoDto[]> {
    const doc = await this.pdfModel.findById(docId);
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.ownerId.toString() === userId)
      throw new BadRequestException('Cannot update owner role');
    const member = doc.members.find((m) => m.userId.toString() === userId);
    if (!member) throw new NotFoundException('Member not found');
    member.role = role;
    await doc.save();
    return this.formatMembers(doc);
  }
}
