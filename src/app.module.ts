import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecucaoORM } from './infrastructure/database/entities/execucao.orm-entity';
import { ExecucaoRepository } from './infrastructure/database/repositories/execucao.repository';
import { MessagingService } from './infrastructure/messaging/messaging.service';
import { SagaConsumer } from './infrastructure/messaging/saga.consumer';
import { ExecucaoUseCases } from './application/use-cases/execucao.use-cases';
import { ExecucaoController } from './presentation/controllers/execucao.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [ExecucaoORM],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ExecucaoORM]),
  ],
  controllers: [ExecucaoController],
  providers: [ExecucaoRepository, MessagingService, SagaConsumer, ExecucaoUseCases],
})
export class AppModule {}
