"use client";

import { motion } from "framer-motion";

import { usePublicStats } from "@/hooks/use-public-stats";

// The hero used to say "2,481 people talking right now". That number was a
// string literal — nobody was talking, and on a pre-launch product the real
// figure was usually zero. This reads the only publicly readable document in
// the project, `publicStats/live`, which a scheduled Cloud Function writes
// through the Admin SDK from real count() aggregates and real voice sessions.
//
// Nothing here invents, rounds up, or holds a stale value forward. When a
// number is not available, or not yet true enough to mean anything, the line
// simply is not rendered — an absent claim beats a comfortable one.

// Field names match what the publisher actually writes, and the names are
// deliberate. Neither says "created": neither is a lifetime counter and both
// can go down. `activeAccounts` counts publicProfiles rather than users,
// because users retains banned, disabled and Auth-orphaned rows and overstates
// the product roughly two to one; the projection has Firebase Auth as its
// existence authority, so it can lag low but never high.
//
// There is deliberately no live "people talking now" field yet. Deriving it
// from voice-token expiry produced an error that grew with the thing being
// measured — a room of twelve an hour into a conversation would have published
// zero. It arrives once the LiveKit webhook is delivering, and it arrives once,
// correctly, rather than being redefined under the same name later.
function format(value: number): string {
  return value.toLocaleString("en-US");
}

export function LiveStats() {
  const state = usePublicStats();
  if (state.status !== "fresh") return null;

  const { activeAccounts: accounts, existingRooms: rooms } = state.stats;

  const showAccounts = accounts > 0;
  const showRooms = rooms > 0;

  if (!showAccounts && !showRooms) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-white/40"
    >
      {showAccounts && (
        <span>
          {format(accounts)}{" "}
          {accounts === 1 ? "person is here" : "people are here"}
        </span>
      )}

      {showAccounts && showRooms && (
        <span aria-hidden="true" className="text-white/20">
          ·
        </span>
      )}

      {showRooms && (
        <span>
          {format(rooms)} {rooms === 1 ? "room" : "rooms"} on YO Voice
        </span>
      )}
    </motion.div>
  );
}
