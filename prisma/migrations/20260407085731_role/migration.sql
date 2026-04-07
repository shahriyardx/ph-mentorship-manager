-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'mentor');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';
