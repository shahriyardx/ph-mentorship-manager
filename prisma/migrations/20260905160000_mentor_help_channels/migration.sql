-- Each instructor category now also gets a `help` forum and a `resources`
-- channel; store their ids so the dashboards can link to them.
ALTER TABLE "mentor" ADD COLUMN "helpChannelId" TEXT;
ALTER TABLE "mentor" ADD COLUMN "resourceChannelId" TEXT;
