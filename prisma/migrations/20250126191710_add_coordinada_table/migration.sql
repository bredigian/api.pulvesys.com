/*
  Warnings:

  - You are about to drop the column `latitud` on the `Lote` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Lote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lote" DROP COLUMN "latitud",
DROP COLUMN "longitud";

-- CreateTable
CREATE TABLE "Coordinada" (
    "id" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "lote_id" TEXT NOT NULL,

    CONSTRAINT "Coordinada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Coordinada_id_key" ON "Coordinada"("id");

-- AddForeignKey
ALTER TABLE "Coordinada" ADD CONSTRAINT "Coordinada_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
