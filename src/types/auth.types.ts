import { UUID } from 'node:crypto';

export interface Tokens {
  access_token: string;
  refresh_token: UUID;
  expireIn?: Date | string;
}
