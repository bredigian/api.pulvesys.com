-- CreateEnum
CREATE TYPE "UNIDAD" AS ENUM ('LITROS', 'GRAMOS');

-- CreateTable
CREATE TABLE "Pulverizacion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "detalle_id" TEXT NOT NULL,

    CONSTRAINT "Pulverizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Detalle" (
    "id" TEXT NOT NULL,
    "campo_id" TEXT NOT NULL,
    "lotes" TEXT[],
    "hectareas" DOUBLE PRECISION NOT NULL,
    "cultivo_id" TEXT NOT NULL,
    "tratamiento_id" TEXT NOT NULL,

    CONSTRAINT "Detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "unidad" "UNIDAD" NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aplicacion" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "dosis" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Aplicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsumoProducto" (
    "id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "valor_teorico" DOUBLE PRECISION NOT NULL,
    "valor_real" DOUBLE PRECISION,
    "valor_devolucion" DOUBLE PRECISION,

    CONSTRAINT "ConsumoProducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hectareas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Campo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cultivo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Cultivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoTratamiento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoTratamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PulverizacionProductos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PulverizacionProductos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pulverizacion_id_key" ON "Pulverizacion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Detalle_id_key" ON "Detalle"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_id_key" ON "Producto"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Aplicacion_id_key" ON "Aplicacion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ConsumoProducto_id_key" ON "ConsumoProducto"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Campo_id_key" ON "Campo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Cultivo_id_key" ON "Cultivo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TipoTratamiento_id_key" ON "TipoTratamiento"("id");

-- CreateIndex
CREATE INDEX "_PulverizacionProductos_B_index" ON "_PulverizacionProductos"("B");

-- AddForeignKey
ALTER TABLE "Pulverizacion" ADD CONSTRAINT "Pulverizacion_detalle_id_fkey" FOREIGN KEY ("detalle_id") REFERENCES "Detalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_campo_id_fkey" FOREIGN KEY ("campo_id") REFERENCES "Campo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_cultivo_id_fkey" FOREIGN KEY ("cultivo_id") REFERENCES "Cultivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Detalle" ADD CONSTRAINT "Detalle_tratamiento_id_fkey" FOREIGN KEY ("tratamiento_id") REFERENCES "TipoTratamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aplicacion" ADD CONSTRAINT "Aplicacion_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsumoProducto" ADD CONSTRAINT "ConsumoProducto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PulverizacionProductos" ADD CONSTRAINT "_PulverizacionProductos_A_fkey" FOREIGN KEY ("A") REFERENCES "Producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PulverizacionProductos" ADD CONSTRAINT "_PulverizacionProductos_B_fkey" FOREIGN KEY ("B") REFERENCES "Pulverizacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
