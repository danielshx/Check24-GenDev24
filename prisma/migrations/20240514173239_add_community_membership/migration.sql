-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Community" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Pin" (
    "index" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "community_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "Pin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pin_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "home_team" INTEGER NOT NULL,
    "away_team" INTEGER NOT NULL,
    "result_home" INTEGER,
    "result_away" INTEGER,
    "start_date" DATETIME NOT NULL,
    CONSTRAINT "Match_home_team_fkey" FOREIGN KEY ("home_team") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_away_team_fkey" FOREIGN KEY ("away_team") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "result_home" INTEGER NOT NULL,
    "result_away" INTEGER NOT NULL,
    CONSTRAINT "Bet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bet_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityMembership" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "community_id" INTEGER NOT NULL,
    CONSTRAINT "CommunityMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommunityMembership_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_community_id_user_id_key" ON "Pin"("community_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_user_id_match_id_key" ON "Bet"("user_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMembership_user_id_community_id_key" ON "CommunityMembership"("user_id", "community_id");
