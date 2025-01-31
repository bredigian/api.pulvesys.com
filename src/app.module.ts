import { AplicacionesModule } from './aplicaciones/aplicaciones.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CamposModule } from './campos/campos.module';
import { ConfigModule } from '@nestjs/config';
import { ConsumoProductoModule } from './consumo-producto/consumo-producto.module';
import { CultivosModule } from './cultivos/cultivos.module';
import { DetallesModule } from './detalles/detalles.module';
import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { PulverizacionesModule } from './pulverizaciones/pulverizaciones.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { LotesModule } from './lotes/lotes.module';
import { CoordinadasModule } from './coordinadas/coordinadas.module';
import { AuthModule } from './auth/auth.module';
import { SesionesModule } from './sesiones/sesiones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ProductosModule,
    CamposModule,
    CultivosModule,
    TratamientosModule,
    DetallesModule,
    PulverizacionesModule,
    AplicacionesModule,
    ConsumoProductoModule,
    LotesModule,
    CoordinadasModule,
    AuthModule,
    SesionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
