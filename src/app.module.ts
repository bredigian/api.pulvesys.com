import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamposModule } from './campos/campos.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { CultivosModule } from './cultivos/cultivos.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductosModule,
    CamposModule,
    CultivosModule,
    TratamientosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
