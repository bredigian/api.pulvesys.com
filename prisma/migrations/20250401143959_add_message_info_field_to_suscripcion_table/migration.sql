-- CreateEnum
CREATE TYPE "SUBSCRIPTION_MESSAGE" AS ENUM ('welcome', 'warning', 'cancelled', 'disabled');

-- AlterTable
ALTER TABLE "Suscripcion" ADD COLUMN     "message_info" "SUBSCRIPTION_MESSAGE" NOT NULL DEFAULT 'welcome';
