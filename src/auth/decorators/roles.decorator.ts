import { SetMetadata } from '@nestjs/common';

// Essa é a chave secreta que o NestJS vai usar para achar o nosso "Post-it"
export const ROLES_KEY = 'roles';

// Essa é a função que vamos chamar em cima das rotas, ex: @Roles('ADMIN')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
