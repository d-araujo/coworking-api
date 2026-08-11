import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// 1. Força a leitura do arquivo .env antes de qualquer coisa
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 2. Cria a piscina de conexões (Pool) com a URL do banco
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 3. Passa o pool para o adaptador do Prisma
    const adapter = new PrismaPg(pool);

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
