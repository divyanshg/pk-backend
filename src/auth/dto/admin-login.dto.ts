import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  passcode: string;
}
