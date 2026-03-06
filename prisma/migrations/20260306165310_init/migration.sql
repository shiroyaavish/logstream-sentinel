-- CreateTable
CREATE TABLE "alert" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alert_type_user_id_createdAt_idx" ON "alert"("type", "user_id", "createdAt");

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
