import { Suscripcion } from '@prisma/client';

export type SuscripcionCreation = Omit<
  Suscripcion,
  'id' | 'createdAt' | 'updatedAt'
>;
