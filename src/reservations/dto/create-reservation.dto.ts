import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString({ message: 'O ID da sala deve ser um texto.' })
  @IsUUID('4', { message: 'O ID da sala deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O ID da sala é obrigatório.' })
  roomId!: string;

  @Type(() => Date)
  @IsDate({ message: 'A data inicial deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data inicial é obrigatória.' })
  startTime!: Date;

  @Type(() => Date)
  @IsDate({ message: 'A data final deve ser uma data válida.' })
  @IsNotEmpty({ message: 'A data final é obrigatória.' })
  endTime!: Date;
}
