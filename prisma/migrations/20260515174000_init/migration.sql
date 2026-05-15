CREATE TABLE "Player" (
  "puuid" TEXT NOT NULL,
  "gameName" TEXT,
  "tagLine" TEXT,
  "region" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("puuid")
);

CREATE TABLE "Agent" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "localizedName" TEXT NOT NULL,
  "role" TEXT,
  "iconUrl" TEXT,
  CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
  "matchId" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "queue" TEXT NOT NULL,
  "actId" TEXT,
  "mapName" TEXT,
  "startedAt" TIMESTAMP(3),
  "roundsPlayed" INTEGER NOT NULL,
  "winningTeamId" TEXT,
  "raw" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId")
);

CREATE TABLE "PlayerMatchStat" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "playerPuuid" TEXT NOT NULL,
  "agentId" TEXT,
  "region" TEXT NOT NULL,
  "actId" TEXT,
  "teamId" TEXT NOT NULL,
  "won" BOOLEAN NOT NULL,
  "rankTier" INTEGER,
  "rankBucket" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "rounds" INTEGER NOT NULL,
  "acs" DOUBLE PRECISION NOT NULL,
  "kills" INTEGER NOT NULL,
  "deaths" INTEGER NOT NULL,
  "assists" INTEGER NOT NULL,
  "kd" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerMatchStat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeltState" (
  "id" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "rankBucket" TEXT NOT NULL,
  "actId" TEXT NOT NULL,
  "holderPuuid" TEXT NOT NULL,
  "sourceMatchId" TEXT,
  "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BeltState_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BeltHistory" (
  "id" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "rankBucket" TEXT NOT NULL,
  "actId" TEXT NOT NULL,
  "previousHolderPuuid" TEXT,
  "newHolderPuuid" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "mvpAcs" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BeltHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionRun" (
  "id" TEXT NOT NULL,
  "region" TEXT NOT NULL,
  "queue" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "discovered" INTEGER NOT NULL DEFAULT 0,
  "imported" INTEGER NOT NULL DEFAULT 0,
  "skipped" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Player_region_idx" ON "Player"("region");
CREATE INDEX "Player_gameName_tagLine_idx" ON "Player"("gameName", "tagLine");
CREATE INDEX "Match_region_queue_actId_idx" ON "Match"("region", "queue", "actId");
CREATE INDEX "Match_startedAt_idx" ON "Match"("startedAt");
CREATE UNIQUE INDEX "PlayerMatchStat_matchId_playerPuuid_key" ON "PlayerMatchStat"("matchId", "playerPuuid");
CREATE INDEX "PlayerMatchStat_region_actId_idx" ON "PlayerMatchStat"("region", "actId");
CREATE INDEX "PlayerMatchStat_rankBucket_idx" ON "PlayerMatchStat"("rankBucket");
CREATE INDEX "PlayerMatchStat_agentId_idx" ON "PlayerMatchStat"("agentId");
CREATE INDEX "PlayerMatchStat_acs_idx" ON "PlayerMatchStat"("acs");
CREATE UNIQUE INDEX "BeltState_region_rankBucket_actId_key" ON "BeltState"("region", "rankBucket", "actId");
CREATE INDEX "BeltState_holderPuuid_idx" ON "BeltState"("holderPuuid");
CREATE INDEX "BeltHistory_region_rankBucket_actId_idx" ON "BeltHistory"("region", "rankBucket", "actId");
CREATE INDEX "BeltHistory_newHolderPuuid_idx" ON "BeltHistory"("newHolderPuuid");

ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_playerPuuid_fkey" FOREIGN KEY ("playerPuuid") REFERENCES "Player"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerMatchStat" ADD CONSTRAINT "PlayerMatchStat_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BeltState" ADD CONSTRAINT "BeltState_holderPuuid_fkey" FOREIGN KEY ("holderPuuid") REFERENCES "Player"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeltState" ADD CONSTRAINT "BeltState_sourceMatchId_fkey" FOREIGN KEY ("sourceMatchId") REFERENCES "Match"("matchId") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BeltHistory" ADD CONSTRAINT "BeltHistory_previousHolderPuuid_fkey" FOREIGN KEY ("previousHolderPuuid") REFERENCES "Player"("puuid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BeltHistory" ADD CONSTRAINT "BeltHistory_newHolderPuuid_fkey" FOREIGN KEY ("newHolderPuuid") REFERENCES "Player"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BeltHistory" ADD CONSTRAINT "BeltHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
