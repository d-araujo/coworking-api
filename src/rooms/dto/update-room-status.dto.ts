import { IsBoolean } from 'class-validator';

export class UpdateRoomStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
