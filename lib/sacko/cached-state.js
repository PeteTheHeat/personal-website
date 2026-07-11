import "server-only";

import { unstable_cache } from "next/cache";
import { getChallengeState } from "./store.js";

export const SACKO_STATE_CACHE_TAG = "sacko-tracker-state";

export const getCachedChallengeState = unstable_cache(
  getChallengeState,
  ["sacko-tracker-state-v1"],
  {
    revalidate: 10,
    tags: [SACKO_STATE_CACHE_TAG],
  },
);
