import { MercadopagoService } from './mercadopago.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [MercadopagoService],
})
export class MercadopagoModule {}
