import { IsEmail, IsString } from 'class-validator';

export class OAuthCheckDto {
  @IsEmail()
  email: string;
  @IsString()
  fullName: string;
}
