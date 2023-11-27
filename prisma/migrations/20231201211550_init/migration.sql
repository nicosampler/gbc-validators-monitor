-- CreateTable
CREATE TABLE "Validator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "WithdrawalAddress" (
    "address" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "missedAttestations" INTEGER NOT NULL DEFAULT 5,
    "underPerformance" INTEGER NOT NULL DEFAULT 90,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Config_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockRewards" (
    "blockNumber" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timeStamp" DATETIME NOT NULL,
    "blockMiner" TEXT NOT NULL,
    "blockReward" TEXT NOT NULL,
    "uncleInclusionReward" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "messageId" INTEGER,
    "lastClaimed" DATETIME
);

-- CreateTable
CREATE TABLE "_UserToValidator" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserToValidator_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserToValidator_B_fkey" FOREIGN KEY ("B") REFERENCES "Validator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserToWithdrawalAddress" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserToWithdrawalAddress_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserToWithdrawalAddress_B_fkey" FOREIGN KEY ("B") REFERENCES "WithdrawalAddress" ("address") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_userId_key" ON "Config"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_userId_key" ON "User"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_chatId_key" ON "User"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToValidator_AB_unique" ON "_UserToValidator"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToValidator_B_index" ON "_UserToValidator"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToWithdrawalAddress_AB_unique" ON "_UserToWithdrawalAddress"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToWithdrawalAddress_B_index" ON "_UserToWithdrawalAddress"("B");
