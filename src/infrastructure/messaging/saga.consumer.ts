import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ExecucaoUseCases } from '../../application/use-cases/execucao.use-cases';
import { OS_EVENTS, OsAprovadaEvent, OsCanceladaEvent } from '../../domain/events/saga.events';

@Injectable()
export class SagaConsumer implements OnModuleInit {
  private readonly logger = new Logger(SagaConsumer.name);

  constructor(
    private readonly messaging: MessagingService,
    private readonly useCases: ExecucaoUseCases,
  ) {}

  async onModuleInit(): Promise<void> {
    await new Promise((r) => setTimeout(r, 3000));
    await this.registrarConsumers();
  }

  private async registrarConsumers(): Promise<void> {
    // OS aprovada → entrar na fila
    await this.messaging.assinar(
      'execucao-service.os.aprovada',
      OS_EVENTS.OS_APROVADA,
      async (payload: OsAprovadaEvent) => {
        this.logger.log(`OS aprovada recebida: ${payload.osId}`);
        await this.useCases.entrarNaFila(payload.osId);
      },
    );

    // OS cancelada → cancelar execução (compensação)
    await this.messaging.assinar(
      'execucao-service.os.cancelada',
      OS_EVENTS.OS_CANCELADA,
      async (payload: OsCanceladaEvent) => {
        this.logger.warn(`OS cancelada: ${payload.osId}`);
        await this.useCases.cancelar(payload.osId, payload.motivo);
      },
    );
  }
}
