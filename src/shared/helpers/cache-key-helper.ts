export const getBlackListTokenCacheKey = (userId: string, jit: string) =>
  `auth:backlist_token_${userId}_${jit}`;

export const getRevokedTokenThresholdCacheKey = (userId: string) =>
  `auth:revoked_token_threshold_${userId}`;
