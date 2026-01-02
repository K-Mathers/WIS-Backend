/*
  Warnings:

  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EmailCodeProps" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- DropForeignKey
ALTER TABLE "VerificationToken" DROP CONSTRAINT "VerificationToken_userId_fkey";

-- AlterTable
ALTER TABLE "EmailCode" ADD COLUMN     "EmailCodeProps" "EmailCodeProps" NOT NULL DEFAULT 'VERIFY_EMAIL';

-- DropTable
DROP TABLE "VerificationToken";
