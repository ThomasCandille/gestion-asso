-- AlterTable
ALTER TABLE "CommunicationCampaign" ADD COLUMN     "sheetId" TEXT,
ADD COLUMN     "sheetUrl" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "sheetId" TEXT,
ADD COLUMN     "sheetUrl" TEXT;
