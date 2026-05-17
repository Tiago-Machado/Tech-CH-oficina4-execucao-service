import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExecucaoORM, StatusExecucao } from '../entities/execucao.orm-entity';

@Injectable()
export class ExecucaoRepository {
  constructor(
    @InjectRepository(ExecucaoORM)
    private readonly repo: Repository<ExecucaoORM>,
  ) {}

  async criar(osId: string): Promise<ExecucaoORM> {
    const execucao = this.repo.create({ osId, status: StatusExecucao.NA_FILA });
    return this.repo.save(execucao);
  }

  async buscarPorOsId(osId: string): Promise<ExecucaoORM | null> {
    return this.repo.findOne({ where: { osId } });
  }

  async listarTodas(): Promise<ExecucaoORM[]> {
    return this.repo.find({ order: { criadoEm: 'DESC' } });
  }

  async atualizar(osId: string, dados: Partial<ExecucaoORM>): Promise<void> {
    await this.repo.update({ osId }, dados);
  }
}
