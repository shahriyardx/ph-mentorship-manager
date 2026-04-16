-- AddForeignKey
ALTER TABLE "mentor" ADD CONSTRAINT "mentor_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
