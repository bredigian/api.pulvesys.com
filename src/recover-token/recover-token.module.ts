import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecoverTokenService } from './recover-token.service';

@Module({
  providers: [RecoverTokenService, PrismaService],
})
export class RecoverTokenModule {}
