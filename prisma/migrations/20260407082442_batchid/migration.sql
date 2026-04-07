/*
  Warnings:

  - Added the required column `batchId` to the `students_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "students_data" ADD COLUMN     "batchId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "students_data" ADD CONSTRAINT "students_data_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
