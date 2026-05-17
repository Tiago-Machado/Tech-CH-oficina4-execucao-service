import { Test, TestingModule } from '@nestjs/testing';
import { ExecucaoController } from './execucao.controller';
import { ExecucaoUseCases } from '../../application/use-cases/execucao.use-cases';
import { StatusExecucao } from '../../infrastructure/database/entities/execucao.orm-entity';

const mockUseCases = {
  listarTodas: jest.fn(),
  buscarPorOsId: jest.fn(),
  finalizar: jest.fn(),
};

describe('ExecucaoController', () => {
  let controller: ExecucaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecucaoController],
      providers: [{ provide: ExecucaoUseCases, useValue: mockUseCases }],
    }).compile();

    controller = module.get<ExecucaoController>(ExecucaoController);
    jest.clearAllMocks();
  });

  it('health() deve retornar status ok', () => {
    const result = controller.health();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('execucao-service');
  });

  it('listar() deve retornar lista de execuções', async () => {
    mockUseCases.listarTodas.mockResolvedValue([{ osId: 'uuid-1' }]);
    const result = await controller.listar();
    expect(result).toHaveLength(1);
  });

  it('buscar() deve retornar execução por osId', async () => {
    mockUseCases.buscarPorOsId.mockResolvedValue({ osId: 'uuid-1', status: StatusExecucao.NA_FILA });
    const result = await controller.buscar('uuid-1');
    expect(result.osId).toBe('uuid-1');
  });

  it('finalizar() deve chamar useCases.finalizar', async () => {
    mockUseCases.finalizar.mockResolvedValue(undefined);
    await controller.finalizar('uuid-1', 'Técnico João', 'Reparo ok');
    expect(mockUseCases.finalizar).toHaveBeenCalledWith('uuid-1', 'Técnico João', 'Reparo ok');
  });

  it('finalizar() deve usar técnico padrão se não informado', async () => {
    mockUseCases.finalizar.mockResolvedValue(undefined);
    await controller.finalizar('uuid-1', undefined as any, undefined);
    expect(mockUseCases.finalizar).toHaveBeenCalledWith('uuid-1', 'Técnico', undefined);
  });
});
