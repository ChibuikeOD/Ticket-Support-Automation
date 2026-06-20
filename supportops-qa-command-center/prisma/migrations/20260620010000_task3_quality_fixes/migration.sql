-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReportExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportExport_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationRun" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReportExport" ("content", "createdAt", "format", "id", "runId") SELECT "content", "createdAt", "format", "id", "runId" FROM "ReportExport";
DROP TABLE "ReportExport";
ALTER TABLE "new_ReportExport" RENAME TO "ReportExport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "AiAnalysis_ticketId_idx" ON "AiAnalysis"("ticketId");

-- CreateIndex
CREATE INDEX "AiAnalysis_automationRunId_idx" ON "AiAnalysis"("automationRunId");

-- CreateIndex
CREATE INDEX "ReviewDecision_ticketId_idx" ON "ReviewDecision"("ticketId");

-- CreateIndex
CREATE INDEX "ReviewDecision_aiAnalysisId_idx" ON "ReviewDecision"("aiAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRule_name_key" ON "PolicyRule"("name");
