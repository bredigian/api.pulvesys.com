/*
  Warnings:

  - You are about to drop the column `refesh_token` on the `Sesion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refresh_token]` on the table `Sesion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Sesion_refesh_token_key";

-- AlterTable
ALTER TABLE "Sesion" DROP COLUMN "refesh_token",
ADD COLUMN     "refresh_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_refresh_token_key" ON "Sesion"("refresh_token");
