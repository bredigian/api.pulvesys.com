-- CreateTable
CREATE TABLE "RecoverToken" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expireIn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoverToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoverToken_id_key" ON "RecoverToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RecoverToken_token_key" ON "RecoverToken"("token");

-- AddForeignKey
ALTER TABLE "RecoverToken" ADD CONSTRAINT "RecoverToken_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
