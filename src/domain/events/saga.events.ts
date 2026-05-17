export const OS_EVENTS = {
  OS_APROVADA: 'os.aprovada',
  OS_CANCELADA: 'os.cancelada',
} as const;

export const EXECUCAO_EVENTS = {
  EXECUCAO_INICIADA: 'execucao.iniciada',
  EXECUCAO_FINALIZADA: 'execucao.finalizada',
  EXECUCAO_FALHOU: 'execucao.falhou',
} as const;

export interface OsAprovadaEvent {
  osId: string;
}

export interface OsCanceladaEvent {
  osId: string;
  motivo: string;
}
