-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "dashboardLogChannelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "serverId" TEXT NOT NULL DEFAULT '';
