-- DropForeignKey
ALTER TABLE "Aplicacion" DROP CONSTRAINT "Aplicacion_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "Aplicacion" DROP CONSTRAINT "Aplicacion_pulverizacion_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsumoProducto" DROP CONSTRAINT "ConsumoProducto_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "ConsumoProducto" DROP CONSTRAINT "ConsumoProducto_pulverizacion_id_fkey";

-- DropForeignKey
ALTER TABLE "Detalle" DROP CONSTRAINT "Detalle_campo_id_fkey";

-- DropForeignKey
ALTER TABLE "Detalle" DROP CONSTRAINT "Detalle_cultivo_id_fkey";

-- DropForeignKey
ALTER TABLE "Detalle" DROP CONSTRAINT "Detalle_tratamiento_id_fkey";

-- DropForeignKey
ALTER TABLE "Pulverizacion" DROP CONSTRAINT "Pulverizacion_detalle_id_fkey";

-- AlterTable
ALTER TABLE "Aplicacion" ALTER COLUMN "producto_id" SET DEFAULT '-';

-- AlterTable
ALTER TABLE "ConsumoProducto" ALTER COLUMN "producto_id" SET DEFAULT '-';

-- AlterTable
ALTER TABLE "Detalle" ALTER COLUMN "campo_id" SET DEFAULT '-',
ALTER COLUMN "cultivo_id" SET DEFAULT '-',
ALTER COLUMN "tratamiento_id" SET DEFAULT '-';

-- AddForeignKey
ALTER TABLE "Pulverizacion" ADD CONSTRAINT "Pulverizacion_detalle_id_fkey" FOREIGN KEY ("detalle_id") REFERENCES "Detalle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "Campo"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_cultivo_id_fkey" FOREIGN KEY ("cultivo_id") REFERENCES "Cultivo"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_tratamiento_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "TipoTratamiento"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_pulverizacion_id_fkey" FOREIGN KEY ("pulverizacion_id") REFERENCES "Pulverizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducto" ADD CONSTRAINT "ConsumoProducto_pulverizacion_id_fkey" FOREIGN KEY ("pulverizacion_id") REFERENCES "Pulverizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducto" ADD CONSTRAINT "ConsumoProducto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
