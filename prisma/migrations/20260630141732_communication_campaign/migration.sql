/*
  Warnings:

  - You are about to drop the column `channel` on the `CommunicationPost` table. All the data in the column will be lost.
  - The `status` column on the `CommunicationPost` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `campaignId` to the `CommunicationPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('IDEA', 'DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('POST', 'REEL', 'STORY', 'CAROUSEL');

-- AlterTable
ALTER TABLE "CommunicationPost" DROP COLUMN "channel",
ADD COLUMN     "campaignId" TEXT NOT NULL,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "mediaDescription" TEXT,
ADD COLUMN     "postType" "PostType" NOT NULL DEFAULT 'POST',
DROP COLUMN "status",
ADD COLUMN     "status" "CommunicationStatus" NOT NULL DEFAULT 'IDEA';

-- CreateTable
CREATE TABLE "CommunicationCampaign" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAssignee" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationCampaign_eventId_idx" ON "CommunicationCampaign"("eventId");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_idx" ON "CommunicationCampaign"("status");

-- CreateIndex
CREATE INDEX "PostAssignee_memberId_idx" ON "PostAssignee"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PostAssignee_postId_memberId_key" ON "PostAssignee"("postId", "memberId");

-- CreateIndex
CREATE INDEX "CommunicationPost_campaignId_idx" ON "CommunicationPost"("campaignId");

-- CreateIndex
CREATE INDEX "CommunicationPost_eventId_idx" ON "CommunicationPost"("eventId");

-- CreateIndex
CREATE INDEX "CommunicationPost_status_idx" ON "CommunicationPost"("status");

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPost" ADD CONSTRAINT "CommunicationPost_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAssignee" ADD CONSTRAINT "PostAssignee_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunicationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAssignee" ADD CONSTRAINT "PostAssignee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
