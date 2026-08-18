-- CreateTable
CREATE TABLE "colleges" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "directorTitle" TEXT NOT NULL,
    "signatureImage" TEXT,
    "logoImage" TEXT,
    "signatureVariant" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "decidedBy" TEXT,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colleges_slug_key" ON "colleges"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_collegeId_userId_key" ON "memberships"("collegeId", "userId");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: college_settings' singleton row becomes the first real college
INSERT INTO "colleges" ("id", "slug", "name", "nameEn", "affiliation", "province", "director", "directorTitle", "signatureImage", "logoImage", "signatureVariant", "status", "createdAt", "updatedAt")
SELECT 'college-licec', 'licec', "name", "nameEn", "affiliation", "province", "director", "directorTitle", "signatureImage", "logoImage", "signatureVariant", 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "college_settings" WHERE "id" = 1;

-- AlterTable: activities gains collegeId, backfilled to the migrated college
ALTER TABLE "activities" ADD COLUMN "collegeId" TEXT;
UPDATE "activities" SET "collegeId" = 'college-licec';
ALTER TABLE "activities" ALTER COLUMN "collegeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "activities_collegeId_idx" ON "activities"("collegeId");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: submissions gains collegeId, denormalized from its activity
ALTER TABLE "submissions" ADD COLUMN "collegeId" TEXT;
UPDATE "submissions" s SET "collegeId" = a."collegeId" FROM "activities" a WHERE a."id" = s."activityId";
ALTER TABLE "submissions" ALTER COLUMN "collegeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "submissions_collegeId_idx" ON "submissions"("collegeId");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: certificate_records gains collegeId, denormalized from its activity
ALTER TABLE "certificate_records" ADD COLUMN "collegeId" TEXT;
UPDATE "certificate_records" c SET "collegeId" = a."collegeId" FROM "activities" a WHERE a."id" = c."activityId";
ALTER TABLE "certificate_records" ALTER COLUMN "collegeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "certificate_records_collegeId_idx" ON "certificate_records"("collegeId");

-- AddForeignKey
ALTER TABLE "certificate_records" ADD CONSTRAINT "certificate_records_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "colleges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable: superseded by colleges
DROP TABLE "college_settings";
