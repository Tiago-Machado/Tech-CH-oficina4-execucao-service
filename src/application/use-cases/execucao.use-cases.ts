import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ExecucaoRepository } from '../../infrastructure/database/repositories/execucao.repository';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { StatusExecucao } from '../../infrastructure/database/entities/execucao.orm-entity';
import { EXECUCAO_EVENTS } from '../../domain/events/saga.events';

@Injectable()
export class ExecucaoUseCases {
  private readonly logger = new Logger(ExecucaoUseCases.name);

  constructor(
    private readonly repository: ExecucaoRepository,
    private readonly messaging: MessagingService,
  ) {}

  async entrarNaFila(osId: string): Promise<void> {
    const existente = await this.repository.buscarPorOsId(osId);
    if (existente) {
      this.logger.warn(`OS ${osId} já está na fila — ignorando`);
      return;
    }

    await this.repository.criar(osId);
    this.logger.log(`OS ${osId} entrou na fila`);

    // Simula fluxo automático com delays
    setTimeout(async () => {
      try {
        await this.repository.atualizar(osId, {
          status: StatusExecucao.EM_DIAGNOSTICO,
          iniciadoEm: new Date(),
        });
        this.logger.log(`OS ${osId} em diagnóstico`);

        setTimeout(async () => {
          try {
            await this.repository.atualizar(osId, { status: StatusExecucao.EM_REPARO });
            this.logger.log(`OS ${osId} em reparo`);

            setTimeout(async () => {
              try {
                await this.finalizar(osId, 'Técnico Automático', 'Reparo concluído');
              } catch (e) {
                this.logger.error(`Erro ao finalizar OS ${osId}`, e);
              }
            }, 5000);
          } catch (e) {
            this.logger.error(`Erro ao iniciar reparo OS ${osId}`, e);
          }
        }, 5000);
      } catch (e) {
        this.logger.error(`Erro ao iniciar diagnóstico OS ${osId}`, e);
      }
    }, 3000);
  }

  async finalizar(osId: string, tecnico: string, observacoes?: string): Promise<void> {
    const execucao = await this.repository.buscarPorOsId(osId);
    if (!execucao) throw new NotFoundException(`Execução para OS ${osId} não encontrada`);
    if (execucao.status === StatusExecucao.FINALIZADA) {
      this.logger.warn(`OS ${osId} já finalizada — ignorando`);
      return;
    }

    await this.repository.atualizar(osId, {
      status: StatusExecucao.FINALIZADA,
      tecnicoResponsavel: tecnico,
      observacoes,
      finalizadoEm: new Date(),
    });

    await this.messaging.publicar(EXECUCAO_EVENTS.EXECUCAO_FINALIZADA, {
      osId,
      tecnicoResponsavel: tecnico,
      observacoes,
    });

    this.logger.log(`OS ${osId} finalizada por ${tecnico}`);
  }

  async cancelar(osId: string, motivo: string): Promise<void> {
    const execucao = await this.repository.buscarPorOsId(osId);
    if (!execucao) return;
    if (execucao.status === StatusExecucao.CANCELADA) return; // evita loop

    await this.repository.atualizar(osId, {
      status: StatusExecucao.CANCELADA,
      observacoes: motivo,
    });
    this.logger.warn(`Execução cancelada para OS ${osId}`);
  }

  async buscarPorOsId(osId: string) {
    const execucao = await this.repository.buscarPorOsId(osId);
    if (!execucao) throw new NotFoundException(`Execução para OS ${osId} não encontrada`);
    return execucao;
  }

  async listarTodas() {
    return this.repository.listarTodas();
  }
}
