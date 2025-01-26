/*
  Warnings:

  - You are about to drop the column `latitud` on the `Coordinada` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `Coordinada` table. All the data in the column will be lost.
  - Added the required column `lat` to the `Coordinada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `Coordinada` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coordinada" DROP COLUMN "latitud",
DROP COLUMN "longitud",
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL;
