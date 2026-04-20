-- DropForeignKey
ALTER TABLE "mentor" DROP CONSTRAINT "mentor_batchId_fkey";

-- AddForeignKey
ALTER TABLE "mentor" ADD CONSTRAINT "mentor_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
