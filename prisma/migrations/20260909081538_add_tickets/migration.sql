-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "claimedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "closedById" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_channelId_key" ON "Ticket"("channelId");

-- CreateIndex
CREATE INDEX "Ticket_guildId_ownerId_status_idx" ON "Ticket"("guildId", "ownerId", "status");

-- CreateIndex
CREATE INDEX "Ticket_guildId_ownerId_categoryKey_status_idx" ON "Ticket"("guildId", "ownerId", "categoryKey", "status");
