import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExecucaoUseCases } from '../../application/use-cases/execucao.use-cases';

@ApiTags('Execução')
@Controller('api/v1/execucoes')
export class ExecucaoController {
  constructor(private readonly useCases: ExecucaoUseCases) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as execuções' })
  listar() { return this.useCases.listarTodas(); }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() { return { status: 'ok', service: 'execucao-service', timestamp: new Date() }; }

  @Get(':osId')
  @ApiOperation({ summary: 'Buscar execução por OS ID' })
  buscar(@Param('osId') osId: string) { return this.useCases.buscarPorOsId(osId); }

  @Post(':osId/finalizar')
  @ApiOperation({ summary: 'Finalizar execução manualmente' })
  finalizar(
    @Param('osId') osId: string,
    @Body('tecnico') tecnico: string,
    @Body('observacoes') observacoes?: string,
  ) { return this.useCases.finalizar(osId, tecnico ?? 'Técnico', observacoes); }
}
