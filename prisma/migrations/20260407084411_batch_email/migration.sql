/*
  Warnings:

  - A unique constraint covering the columns `[email,batchId]` on the table `students_data` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "students_data_email_batchId_key" ON "students_data"("email", "batchId");
