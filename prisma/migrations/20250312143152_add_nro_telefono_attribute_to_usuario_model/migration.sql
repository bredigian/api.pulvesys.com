/*
  Warnings:

  - Added the required column `nro_telefono` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "nro_telefono" TEXT NOT NULL;
