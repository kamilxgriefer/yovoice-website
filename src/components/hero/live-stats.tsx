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

type PublicStats = {
  peopleTalkingNow?: number;
  accountsCreated?: number;
  roomsCreated?: number;
  updatedAt?: { seconds: number } | null;
};

// A scheduled writer can die quietly. If the document stops being refreshed
// we would otherwise keep presenting its last values as "right now" forever,
// which is the same lie in slower motion. Fifteen minutes is comfortably
// longer than the publish interval and short enough that nobody reads a
// number from a job that stopped an hour ago.
const MAX_STALENESS_SECONDS = 15 * 60;

// A live count is only worth showing when someone is actually there. Below
// this it is hidden entirely rather than rendered as "0 people talking right
// now" — the truth, but a self-defeating way to state it. The cumulative
// numbers have no such floor: they only ever grow, and a real small number is
// a fair thing to show.
const MIN_TALKING_TO_SHOW = 1;

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

  const talking = stats.peopleTalkingNow;
  const accounts = stats.accountsCreated;
  const rooms = stats.roomsCreated;

  const showTalking =
    typeof talking === "number" && talking >= MIN_TALKING_TO_SHOW;
  const showAccounts = typeof accounts === "number" && accounts > 0;
  const showRooms = typeof rooms === "number" && rooms > 0;

  if (!showTalking && !showAccounts && !showRooms) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-white/40"
    >
      {showTalking && (
        <span className="inline-flex items-center gap-2">
          <span className="relative flex size-1.5" aria-hidden="true">
            <motion.span
              className="absolute inset-0 rounded-full bg-emerald-400"
              animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <span className="relative size-1.5 rounded-full bg-emerald-400" />
          </span>
          {format(talking as number)}{" "}
          {talking === 1 ? "person talking right now" : "people talking right now"}
        </span>
      )}

      {showTalking && (showAccounts || showRooms) && (
        <span aria-hidden="true" className="text-white/20">
          ·
        </span>
      )}

      {showAccounts && (
        <span>
          {format(accounts as number)}{" "}
          {accounts === 1 ? "person has joined" : "people have joined"}
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
