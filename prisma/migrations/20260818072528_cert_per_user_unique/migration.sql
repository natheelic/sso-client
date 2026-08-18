-- CreateIndex
CREATE UNIQUE INDEX "certificate_records_activityId_userId_key" ON "certificate_records"("activityId", "userId");
