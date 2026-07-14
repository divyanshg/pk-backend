import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+91[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}
