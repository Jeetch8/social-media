import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostModule } from '@/post/post.module';
import { Neo4jModule } from 'nest-neo4j/dist';
import { PrismaService } from '@/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `.env.development`,
        }),
        PostModule,
        Neo4jModule.forRootAsync({
          imports: [ConfigModule],
          global: true,
          useFactory: (configService: ConfigService) => ({
            scheme: configService.get('NEO4J_DB_SCHEME'),
            host: configService.get('NEO4J_DB_HOST'),
            port: configService.get('NEO4J_DB_PORT'),
            username: configService.get('NEO4J_DB_USERNAME'),
            password: configService.get('NEO4J_DB_PASSWORD'),
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/user/ (GET)', async () => {
    const req = await request(app.getHttpServer()).get('/user/').expect(200);
    console.log(req.body);
  });
});
