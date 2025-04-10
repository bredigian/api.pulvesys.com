import { Plan, Usuario } from '@prisma/client';

export interface PayloadForInitPoint {
  usuario_id: Usuario['id'];
  usuario_email: Usuario['email'];
  plan: Plan;
}

export interface MPNotification {
  data: {
    id: string;
  };
  id: string;
  action: string;
  type: string;
}
