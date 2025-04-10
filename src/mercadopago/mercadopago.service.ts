import MercadoPagoConfig, { Payment, PreApproval } from 'mercadopago';

import { Injectable } from '@nestjs/common';
import { PayloadForInitPoint } from 'src/types/mercadopago.types';
import { PreApprovalGetData } from 'mercadopago/dist/clients/preApproval/get/types';
import { PreApprovalRequest } from 'mercadopago/dist/clients/preApproval/commonTypes';

@Injectable()
export class MercadopagoService {
  private client: MercadoPagoConfig;

  constructor() {
    this.client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    });
  }

  getClient() {
    return this.client;
  }

  async generatePreapproval(payload: PayloadForInitPoint) {
    const body: PreApprovalRequest = {
      back_url: process.env.APP_URL!,
      reason: `Suscripción a PLAN ${payload.plan.nombre.toUpperCase()} de PulveSys`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: payload.plan.valor,
        currency_id: 'ARS',
      },
      payer_email: payload.usuario_email,
      external_reference: payload.usuario_id,
      status: 'pending',
    };

    return await new PreApproval(this.client).create({ body });
  }

  async getPreapproval(id: PreApprovalGetData['id']) {
    return await new PreApproval(this.client).get({ id });
  }

  async unsuscribe(id: PreApprovalGetData['id']) {
    return await new PreApproval(this.client).update({
      id,
      body: { status: 'cancelled' },
    });
  }
}
