-- DropForeignKey
ALTER TABLE "Coordinada" DROP CONSTRAINT "Coordinada_lote_id_fkey";

-- DropForeignKey
ALTER TABLE "Lote" DROP CONSTRAINT "Lote_campo_id_fkey";

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "Campo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinada" ADD CONSTRAINT "Coordinada_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "Lote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
