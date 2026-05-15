export const RANK_BUCKETS = [
  "Radiant",
  "Immortal",
  "Ascendant",
  "Diamond",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
  "Iron",
  "Unrated",
] as const;

export type RankBucket = (typeof RANK_BUCKETS)[number];

export function rankBucketFromTier(tier?: number | null): RankBucket {
  if (!tier || tier <= 0) return "Unrated";
  if (tier >= 27) return "Radiant";
  if (tier >= 24) return "Immortal";
  if (tier >= 21) return "Ascendant";
  if (tier >= 18) return "Diamond";
  if (tier >= 15) return "Platinum";
  if (tier >= 12) return "Gold";
  if (tier >= 9) return "Silver";
  if (tier >= 6) return "Bronze";
  return "Iron";
}
