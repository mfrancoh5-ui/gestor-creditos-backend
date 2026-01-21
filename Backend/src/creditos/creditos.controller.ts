import { Body, Controller, Post } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { CrearCreditoPlanADto } from './dto/crear-credito-plan-a.dto';

@Controller('creditos')
export class CreditosController {
  constructor(private readonly service: CreditosService) {}

  @Post('plan-a')
  crearPlanA(@Body() dto: CrearCreditoPlanADto) {
    return this.service.crearPlanA(dto);
  }
}
