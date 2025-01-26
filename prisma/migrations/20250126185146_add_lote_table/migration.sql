-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "color" TEXT NOT NULL,
    "campo_id" TEXT NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lote_id_key" ON "Lote"("id");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "Campo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
