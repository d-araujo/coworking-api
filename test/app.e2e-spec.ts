import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Coworking API - Fluxo Completo (e2e)', () => {
  let app: INestApplication;
  let accessToken: string; // Variável global do bloco para armazenar o JWT entre os testes

  // Objeto de teste com e-mail dinâmico (Date.now()) para evitar conflitos a cada execução
  const userTest = {
    name: 'Usuário Teste E2E',
    email: `e2e_${Date.now()}@exemplo.com`,
    password: 'senhaForte123',
  };

  // Roda UMA VEZ antes de iniciar os testes: sobe a aplicação NestJS em memória
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Aplica as validações do Class-Validator nos DTOs igual ao servidor real (main.ts)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  // TESTE 1: Criação de conta
  it('1. Deve registrar um novo usuário com sucesso (201)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/register') // Dispara requisição POST para a rota de cadastro
      .send(userTest) // Envia os dados no corpo (body)
      .expect(201); // Valida se o status retornado é 201 (Created)
  });

  // TESTE 2: Validação de e-mail duplicado
  it('2. Deve recusar cadastro com e-mail duplicado (500)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userTest) // Reenvia os mesmos dados do teste 1
      .expect(500); // O Prisma lança exceção P2002 no banco, gerando erro 500
  });

  // TESTE 3: Login e captura do JWT
  it('3. Deve fazer login e retornar o access_token (201)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userTest.email,
        password: userTest.password,
      })
      .expect(201);

    // Garante que o corpo da resposta possui a propriedade 'access_token'
    expect(response.body).toHaveProperty('access_token');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    accessToken = response.body.access_token; // Salva o token para uso nos próximos testes
  });

  // TESTE 4: Acesso autorizado com Bearer Token
  it('4. Deve acessar uma rota protegida enviando o Token (200)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/auth/profile') // Rota protegida por Guard
      .set('Authorization', `Bearer ${accessToken}`) // Envia o cabeçalho de autenticação
      .expect(200); // Espera resposta 200 OK
  });

  // TESTE 5: Bloqueio de requisição sem Token
  it('5. Deve bloquear acesso à rota protegida sem Token (401)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/auth/profile') // Tenta acessar a rota protegida sem enviar o cabeçalho Authorization
      .expect(401); // Espera bloqueio 401 Unauthorized
  });

  // Roda UMA VEZ ao final de tudo: encerra a aplicação e liberta as conexões do banco
  afterAll(async () => {
    await app.close();
  });
});
