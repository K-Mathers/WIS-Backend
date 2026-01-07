-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
