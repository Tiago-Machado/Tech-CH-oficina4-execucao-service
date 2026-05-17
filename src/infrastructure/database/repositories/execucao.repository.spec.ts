import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExecucaoRepository } from './execucao.repository';
import { ExecucaoORM, StatusExecucao } from '../entities/execucao.orm-entity';

const mockTypeOrmRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('ExecucaoRepository', () => {
  let repository: ExecucaoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecucaoRepository,
        { provide: getRepositoryToken(ExecucaoORM), useValue: mockTypeOrmRepo },
      ],
    }).compile();

    repository = module.get<ExecucaoRepository>(ExecucaoRepository);
    jest.clearAllMocks();
  });

  it('criar() deve persistir e retornar execução', async () => {
    const orm = { osId: 'uuid-1', status: StatusExecucao.NA_FILA };
    mockTypeOrmRepo.create.mockReturnValue(orm);
    mockTypeOrmRepo.save.mockResolvedValue(orm);

    const result = await repository.criar('uuid-1');
    expect(result.osId).toBe('uuid-1');
    expect(mockTypeOrmRepo.save).toHaveBeenCalledTimes(1);
  });

  it('buscarPorOsId() deve retornar null se não encontrar', async () => {
    mockTypeOrmRepo.findOne.mockResolvedValue(null);
    const result = await repository.buscarPorOsId('nao-existe');
    expect(result).toBeNull();
  });

  it('buscarPorOsId() deve retornar execução se encontrar', async () => {
    const orm = { osId: 'uuid-1', status: StatusExecucao.NA_FILA };
    mockTypeOrmRepo.findOne.mockResolvedValue(orm);
    const result = await repository.buscarPorOsId('uuid-1');
    expect(result?.osId).toBe('uuid-1');
  });

  it('listarTodas() deve retornar lista', async () => {
    mockTypeOrmRepo.find.mockResolvedValue([{ osId: 'uuid-1' }, { osId: 'uuid-2' }]);
    const result = await repository.listarTodas();
    expect(result).toHaveLength(2);
  });

  it('atualizar() deve chamar update', async () => {
    mockTypeOrmRepo.update.mockResolvedValue(undefined);
    await repository.atualizar('uuid-1', { status: StatusExecucao.FINALIZADA });
    expect(mockTypeOrmRepo.update).toHaveBeenCalledWith(
      { osId: 'uuid-1' }, { status: StatusExecucao.FINALIZADA }
    );
  });
});
