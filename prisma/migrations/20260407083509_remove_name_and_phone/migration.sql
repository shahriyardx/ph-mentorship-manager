/*
  Warnings:

  - You are about to drop the column `name` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student" DROP COLUMN "name",
DROP COLUMN "phone";
