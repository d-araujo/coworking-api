import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da sala é obrigatório.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição da sala é obrigatória.' })
  description!: string;

  @IsInt({ message: 'A capacidade deve ser um número inteiro.' })
  @Min(1, { message: 'A capacidade deve ser de pelo menos 1 pessoa.' })
  capacity!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
