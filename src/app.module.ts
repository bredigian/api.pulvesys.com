import { AplicacionesModule } from './aplicaciones/aplicaciones.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CamposModule } from './campos/campos.module';
import { ConfigModule } from '@nestjs/config';
import { ConsumoProductoModule } from './consumo-producto/consumo-producto.module';
import { CoordinadasModule } from './coordinadas/coordinadas.module';
import { CultivosModule } from './cultivos/cultivos.module';
import { DetallesModule } from './detalles/detalles.module';
import { LotesModule } from './lotes/lotes.module';
import { Module } from '@nestjs/common';
import { ProductosModule } from './productos/productos.module';
import { PulverizacionesModule } from './pulverizaciones/pulverizaciones.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { TratamientosModule } from './tratamientos/tratamientos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HistorialModule } from './historial/historial.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { SuscripcionesModule } from './suscripciones/suscripciones.module';
import { PlanesModule } from './planes/planes.module';
import { RecoverTokenModule } from './recover-token/recover-token.module';

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
    UsuariosModule,
    HistorialModule,
    MercadopagoModule,
    SuscripcionesModule,
    PlanesModule,
    RecoverTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
