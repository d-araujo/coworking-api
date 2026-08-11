import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'A capacidade deve ser um número inteiro.' })
  @Min(1, { message: 'A capacidade deve ser de pelo menos 1 pessoa.' })
  @IsOptional()
  capacity?: number;
}
