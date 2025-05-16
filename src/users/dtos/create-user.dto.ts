import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({ example: 'nam@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Nam Pham' })
  @IsString()
  password: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(8)
  fullName: string;
}
