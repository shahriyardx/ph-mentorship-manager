/*
  Warnings:

  - You are about to drop the column `name` on the `mentor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mentor" DROP COLUMN "name";

-- CreateTable
CREATE TABLE "students_data" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "students_data" ADD CONSTRAINT "students_data_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
