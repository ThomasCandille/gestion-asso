-- AlterTable
ALTER TABLE "BudgetEntry" ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "BudgetEntry_eventId_idx" ON "BudgetEntry"("eventId");

-- CreateIndex
CREATE INDEX "BudgetEntry_type_idx" ON "BudgetEntry"("type");

-- CreateIndex
CREATE INDEX "BudgetEntry_occurredAt_idx" ON "BudgetEntry"("occurredAt");
