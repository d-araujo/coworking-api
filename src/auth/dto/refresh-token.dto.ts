import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token opaco gerado no login',
    example: 'a1b2c3d4e5f67890...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
}
