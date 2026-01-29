import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { CrearCreditoPlanADto } from './dto/crear-credito-plan-a.dto';

@Controller('creditos')
export class CreditosController {
  constructor(private readonly service: CreditosService) {}

  // =========================
  // LISTAR (paginado + filtros)
  // GET /api/creditos?page=1&pageSize=10&estado=ACTIVE&clienteId=1
  // =========================
  @Get()
  listar(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('estado') estado?: string,
    @Query('clienteId') clienteId?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    const clienteIdNum = clienteId ? parseInt(clienteId, 10) : undefined;

    return this.service.listarPaginado({
      page: pageNum,
      pageSize: pageSizeNum,
      estado,
      clienteId: clienteIdNum,
    });
  }

  // =========================
  // CUOTAS OPERATIVAS (bandeja/calendario)
  // IMPORTANTE: debe ir ANTES de @Get(':id')
  //
  // GET /api/creditos/cuotas
  //   ?estado=PENDING
  //   &vencidas=true
  //   &fecha=YYYY-MM-DD
  //   &clienteId=1
  //   &creditoId=2
  //   &page=1
  //   &pageSize=20
  // =========================
  @Get('cuotas')
  listarCuotasOperativas(
    @Query('estado') estado?: string,
    @Query('vencidas') vencidas?: string,
    @Query('fecha') fecha?: string, // YYYY-MM-DD
    @Query('clienteId') clienteId?: string,
    @Query('creditoId') creditoId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;

    const clienteIdNum = clienteId ? parseInt(clienteId, 10) : undefined;
    const creditoIdNum = creditoId ? parseInt(creditoId, 10) : undefined;

    const vencidasBool =
      vencidas === 'true' || vencidas === '1' || vencidas === 'yes';

    return this.service.listarCuotasOperativas({
      estado,
      vencidas: vencidasBool,
      fecha,
      clienteId: clienteIdNum,
      creditoId: creditoIdNum,
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }

  // =========================
  // DETALLE (cliente + cuotas + pagos)
  // GET /api/creditos/:id
  // =========================
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerDetalle(id);
  }

  // =========================
  // CREAR PLAN A
  // POST /api/creditos/plan-a
  // =========================
  @Post('plan-a')
  crearPlanA(@Body() dto: CrearCreditoPlanADto) {
    return this.service.crearPlanA(dto);
  }
}
