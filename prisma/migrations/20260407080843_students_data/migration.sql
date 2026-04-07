/*
  Warnings:

  - You are about to drop the column `name` on the `students_data` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `students_data` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "students_data" DROP COLUMN "name",
DROP COLUMN "phone";
