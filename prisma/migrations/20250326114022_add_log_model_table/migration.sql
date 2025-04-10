-- CreateEnum
CREATE TYPE "LOG" AS ENUM ('PULVERIZACION', 'PRODUCTO', 'CULTIVO', 'TRATAMIENTO', 'UBICACION', 'USUARIO', 'SUSCRIPCION');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "type" "LOG" NOT NULL,
    "description" TEXT NOT NULL,
    "usuario_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Log_id_key" ON "Log"("id");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
