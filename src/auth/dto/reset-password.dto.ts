import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'O formato do e-mail é inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'O código de verificação é obrigatório.' })
  code!: string;

  @IsString()
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  @MinLength(6, { message: 'A nova senha deve ter pelo menos 6 caracteres.' })
  newPassword!: string;
}
