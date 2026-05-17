import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExecucaoUseCases } from './execucao.use-cases';
import { ExecucaoRepository } from '../../infrastructure/database/repositories/execucao.repository';
import { MessagingService } from '../../infrastructure/messaging/messaging.service';
import { ExecucaoORM, StatusExecucao } from '../../infrastructure/database/entities/execucao.orm-entity';

const mockRepository = {
  criar: jest.fn(),
  buscarPorOsId: jest.fn(),
  listarTodas: jest.fn(),
  atualizar: jest.fn(),
};

const mockMessaging = { publicar: jest.fn() };

describe('ExecucaoUseCases', () => {
  let useCases: ExecucaoUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecucaoUseCases,
        { provide: ExecucaoRepository, useValue: mockRepository },
        { provide: MessagingService, useValue: mockMessaging },
      ],
    }).compile();

    useCases = module.get<ExecucaoUseCases>(ExecucaoUseCases);
    jest.clearAllMocks();
  });

  describe('entrarNaFila()', () => {
    it('deve criar execução na fila', async () => {
      mockRepository.buscarPorOsId.mockResolvedValue(null);
      mockRepository.criar.mockResolvedValue({ osId: 'uuid-1', status: StatusExecucao.NA_FILA });
      mockRepository.atualizar.mockResolvedValue(undefined);
      mockMessaging.publicar.mockResolvedValue(undefined);

      await useCases.entrarNaFila('uuid-1');

      expect(mockRepository.criar).toHaveBeenCalledWith('uuid-1');
    });

    it('deve ignorar se OS já estiver na fila', async () => {
      mockRepository.buscarPorOsId.mockResolvedValue({ osId: 'uuid-1' });

      await useCases.entrarNaFila('uuid-1');

      expect(mockRepository.criar).not.toHaveBeenCalled();
    });
  });

  describe('finalizar()', () => {
    it('deve finalizar execução e publicar evento', async () => {
      const execucao = { osId: 'uuid-1', status: StatusExecucao.EM_REPARO } as ExecucaoORM;
      mockRepository.buscarPorOsId.mockResolvedValue(execucao);
      mockRepository.atualizar.mockResolvedValue(undefined);
      mockMessaging.publicar.mockResolvedValue(undefined);

      await useCases.finalizar('uuid-1', 'Técnico João', 'Reparo concluído');

      expect(mockRepository.atualizar).toHaveBeenCalledWith('uuid-1', expect.objectContaining({
        status: StatusExecucao.FINALIZADA,
        tecnicoResponsavel: 'Técnico João',
      }));
      expect(mockMessaging.publicar).toHaveBeenCalledWith('execucao.finalizada',
        expect.objectContaining({ osId: 'uuid-1' })
      );
    });

    it('deve lançar NotFoundException se execução não existir', async () => {
      mockRepository.buscarPorOsId.mockResolvedValue(null);
      await expect(useCases.finalizar('nao-existe', 'Técnico')).rejects.toThrow(NotFoundException);
    });

    it('deve ignorar se já estiver FINALIZADA', async () => {
      const execucao = { osId: 'uuid-1', status: StatusExecucao.FINALIZADA } as ExecucaoORM;
      mockRepository.buscarPorOsId.mockResolvedValue(execucao);

      await useCases.finalizar('uuid-1', 'Técnico');

      expect(mockRepository.atualizar).not.toHaveBeenCalled();
    });
  });

  describe('cancelar()', () => {
    it('deve cancelar execução existente', async () => {
      const execucao = { osId: 'uuid-1', status: StatusExecucao.EM_REPARO } as ExecucaoORM;
      mockRepository.buscarPorOsId.mockResolvedValue(execucao);
      mockRepository.atualizar.mockResolvedValue(undefined);

      await useCases.cancelar('uuid-1', 'OS cancelada');

      expect(mockRepository.atualizar).toHaveBeenCalledWith('uuid-1',
        expect.objectContaining({ status: StatusExecucao.CANCELADA })
      );
    });

    it('deve ignorar se execução não existir', async () => {
      mockRepository.buscarPorOsId.mockResolvedValue(null);
      await expect(useCases.cancelar('nao-existe', 'motivo')).resolves.not.toThrow();
    });

    it('deve ignorar se já estiver CANCELADA', async () => {
      const execucao = { osId: 'uuid-1', status: StatusExecucao.CANCELADA } as ExecucaoORM;
      mockRepository.buscarPorOsId.mockResolvedValue(execucao);

      await useCases.cancelar('uuid-1', 'motivo');

      expect(mockRepository.atualizar).not.toHaveBeenCalled();
    });
  });

  describe('buscarPorOsId()', () => {
    it('deve retornar execução existente', async () => {
      const execucao = { osId: 'uuid-1', status: StatusExecucao.NA_FILA } as ExecucaoORM;
      mockRepository.buscarPorOsId.mockResolvedValue(execucao);
      const result = await useCases.buscarPorOsId('uuid-1');
      expect(result.osId).toBe('uuid-1');
    });

    it('deve lançar NotFoundException se não encontrar', async () => {
      mockRepository.buscarPorOsId.mockResolvedValue(null);
      await expect(useCases.buscarPorOsId('nao-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listarTodas()', () => {
    it('deve retornar lista', async () => {
      mockRepository.listarTodas.mockResolvedValue([{ osId: 'uuid-1' }, { osId: 'uuid-2' }]);
      const result = await useCases.listarTodas();
      expect(result).toHaveLength(2);
    });
  });
});
