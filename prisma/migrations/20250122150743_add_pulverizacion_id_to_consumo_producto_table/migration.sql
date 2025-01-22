/*
  Warnings:

  - Added the required column `pulverizacion_id` to the `Aplicacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pulverizacion_id` to the `ConsumoProducto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Aplicacion" ADD COLUMN     "pulverizacion_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ConsumoProducto" ADD COLUMN     "pulverizacion_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_pulverizacion_id_fkey" FOREIGN KEY ("pulverizacion_id") REFERENCES "Pulverizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducto" ADD CONSTRAINT "ConsumoProducto_pulverizacion_id_fkey" FOREIGN KEY ("pulverizacion_id") REFERENCES "Pulverizacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
