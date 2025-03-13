/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuario_id` to the `Campo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `Cultivo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `Producto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `Pulverizacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `TipoTratamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "USUARIO_ROL" AS ENUM ('ADMIN', 'EMPRESA', 'INDIVIDUAL');

-- AlterTable
ALTER TABLE "Campo" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Cultivo" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pulverizacion" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TipoTratamiento" ADD COLUMN     "usuario_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "rol" "USUARIO_ROL" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Pulverizacion" ADD CONSTRAINT "Pulverizacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campo" ADD CONSTRAINT "Campo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cultivo" ADD CONSTRAINT "Cultivo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoTratamiento" ADD CONSTRAINT "TipoTratamiento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
