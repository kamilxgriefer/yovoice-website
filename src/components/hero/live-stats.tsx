"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

import { getFirebaseFirestore } from "@/lib/firebase/config";

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
type PublicStats = {
  schemaVersion?: number;
  activeAccounts?: number;
  existingRooms?: number;
  updatedAt?: { seconds: number } | null;
};

// A scheduled writer can die quietly. If the document stops being refreshed
// we would otherwise keep presenting its last values as "right now" forever,
// which is the same lie in slower motion. Fifteen minutes is comfortably
// longer than the publish interval and short enough that nobody reads a
// number from a job that stopped an hour ago.
const MAX_STALENESS_SECONDS = 15 * 60;

function isFresh(stats: PublicStats): boolean {
  const seconds = stats.updatedAt?.seconds;
  if (typeof seconds !== "number") return false;
  return Date.now() / 1000 - seconds <= MAX_STALENESS_SECONDS;
}

function format(value: number): string {
  return value.toLocaleString("en-US");
}

export function LiveStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Failing to read this must never break the hero. The document is world
    // readable, but a network error, a blocked request or an offline visitor
    // should all land in exactly the same place: no line at all.
    try {
      const unsubscribe = onSnapshot(
        doc(getFirebaseFirestore(), "publicStats", "live"),
        (snapshot) => {
          if (cancelled) return;
          setStats(snapshot.exists() ? (snapshot.data() as PublicStats) : null);
        },
        () => {
          if (!cancelled) setStats(null);
        },
      );
      return () => {
        cancelled = true;
        unsubscribe();
      };
    } catch {
      return () => {
        cancelled = true;
      };
    }
  }, []);

  if (!stats || !isFresh(stats)) return null;

  const accounts = stats.activeAccounts;
  const rooms = stats.existingRooms;

  const showAccounts = typeof accounts === "number" && accounts > 0;
  const showRooms = typeof rooms === "number" && rooms > 0;

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
          {format(accounts as number)}{" "}
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
          {format(rooms as number)} {rooms === 1 ? "room" : "rooms"} on YO Voice
        </span>
      )}
    </motion.div>
  );
}
