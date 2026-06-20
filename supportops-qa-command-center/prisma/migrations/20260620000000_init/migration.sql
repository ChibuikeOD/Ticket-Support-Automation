-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "productPurchased" TEXT,
    "ticketType" TEXT,
    "ticketSubject" TEXT,
    "ticketDescription" TEXT NOT NULL,
    "ticketStatus" TEXT,
    "resolution" TEXT,
    "priority" TEXT,
    "channel" TEXT,
    "firstResponseTime" TEXT,
    "timeToResolution" TEXT,
    "customerSatisfaction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'seeded',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "processedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "automationRunId" TEXT NOT NULL,
    "issueCategory" TEXT NOT NULL,
    "customerIntent" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "draftResponse" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "finalAction" TEXT NOT NULL,
    "escalationReason" TEXT NOT NULL,
    "policyChecksJson" TEXT NOT NULL,
    "guardrailReasonsJson" TEXT NOT NULL,
    "rawModelJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiAnalysis_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AiAnalysis_automationRunId_fkey" FOREIGN KEY ("automationRunId") REFERENCES "AutomationRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "aiAnalysisId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "editedResponse" TEXT,
    "reviewerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewDecision_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewDecision_aiAnalysisId_fkey" FOREIGN KEY ("aiAnalysisId") REFERENCES "AiAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PolicyRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ruleText" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ReportExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_externalId_key" ON "Ticket"("externalId");
