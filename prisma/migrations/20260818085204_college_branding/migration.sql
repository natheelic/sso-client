-- AlterTable
ALTER TABLE "college_settings" ADD COLUMN     "logoImage" TEXT,
ADD COLUMN     "signatureImage" TEXT,
ADD COLUMN     "signatureVariant" INTEGER NOT NULL DEFAULT 0;
