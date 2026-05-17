import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum StatusExecucao {
  NA_FILA = 'NA_FILA',
  EM_DIAGNOSTICO = 'EM_DIAGNOSTICO',
  EM_REPARO = 'EM_REPARO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

@Entity('execucoes')
export class ExecucaoORM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'os_id', unique: true })
  osId: string;

  @Column({ type: 'enum', enum: StatusExecucao, default: StatusExecucao.NA_FILA })
  status: StatusExecucao;

  @Column({ name: 'tecnico_responsavel', nullable: true })
  tecnicoResponsavel?: string;

  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  @Column({ name: 'iniciado_em', nullable: true })
  iniciadoEm?: Date;

  @Column({ name: 'finalizado_em', nullable: true })
  finalizadoEm?: Date;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
