/*
  Warnings:

  - You are about to drop the column `access_token` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Sesion" ALTER COLUMN "access_token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "access_token",
DROP COLUMN "refresh_token";
