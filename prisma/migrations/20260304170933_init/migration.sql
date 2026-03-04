/*
  Warnings:

  - You are about to drop the column `timestamp` on the `session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "session_timestamp_idx";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "timestamp";
