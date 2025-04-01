/*
  Warnings:

  - The primary key for the `Suscripcion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `payment_id` on the `Suscripcion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuario_id]` on the table `Suscripcion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `free_trial` to the `Suscripcion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('pending');

-- DropIndex
DROP INDEX "Suscripcion_id_key";

-- AlterTable
ALTER TABLE "Suscripcion" DROP CONSTRAINT "Suscripcion_pkey",
DROP COLUMN "payment_id",
ADD COLUMN     "free_trial" BOOLEAN NOT NULL,
ALTER COLUMN "id" DROP NOT NULL,
ADD CONSTRAINT "Suscripcion_pkey" PRIMARY KEY ("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Suscripcion_usuario_id_key" ON "Suscripcion"("usuario_id");
