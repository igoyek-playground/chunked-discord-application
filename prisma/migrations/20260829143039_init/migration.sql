-- CreateTable
CREATE TABLE "GuildUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstJoinedAt" DATETIME NOT NULL,
    "lastJoinedAt" DATETIME NOT NULL,
    "joinCount" INTEGER NOT NULL DEFAULT 1,
    "accountCreatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildUser_guildId_userId_key" ON "GuildUser"("guildId", "userId");
