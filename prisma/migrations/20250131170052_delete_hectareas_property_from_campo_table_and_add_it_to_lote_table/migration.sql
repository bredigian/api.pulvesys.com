/*
  Warnings:

  - You are about to drop the column `hectareas` on the `Campo` table. All the data in the column will be lost.
  - You are about to drop the column `hectareas` on the `Detalle` table. All the data in the column will be lost.
  - Added the required column `hectareas` to the `Lote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campo" DROP COLUMN "hectareas";

-- AlterTable
ALTER TABLE "Detalle" DROP COLUMN "hectareas";

-- AlterTable
ALTER TABLE "Lote" ADD COLUMN     "hectareas" DOUBLE PRECISION NOT NULL;
