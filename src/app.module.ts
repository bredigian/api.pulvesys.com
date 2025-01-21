import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamposModule } from './campos/campos.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductosModule,
    CamposModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
