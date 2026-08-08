"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/use-auth";

type NotificationType =
  | "friendRequest"
  | "friendAccepted"
  | "follow"
  | "clubInvite"
  | "clubInviteAccepted"
  | "roomInvite"
  | "broadcastInvite"
  | "directMessage"
  | "mention"
  | "reply";

// Mirrors app_notification.dart's NotificationType — same Firestore field
// names under users/{uid}.notificationPreferences, same opt-out default
// (absent key = enabled). 'achievementUnlocked'/'moderation'/'system' are
// deliberately left out here too, same as the Flutter preferences screen —
// there's nothing to opt out of for those.
const GROUPS: {
  title: string;
  types: { id: NotificationType; label: string }[];
}[] = [
  {
    title: "Friends & follows",
    types: [
      { id: "friendRequest", label: "Friend requests" },
      { id: "friendAccepted", label: "Friend request accepted" },
      { id: "follow", label: "New followers" },
    ],
  },
  {
    title: "Clubs",
    types: [
      { id: "clubInvite", label: "Club invitations" },
      { id: "clubInviteAccepted", label: "Club invitation accepted" },
    ],
  },
  {
    title: "Rooms",
    types: [
      { id: "roomInvite", label: "Room invitations" },
      { id: "broadcastInvite", label: "Podcast invitations" },
    ],
  },
  {
    title: "Messages",
    types: [
      { id: "directMessage", label: "Direct messages" },
      { id: "mention", label: "Mentions" },
      { id: "reply", label: "Replies" },
    ],
  },
];

type BrowserPermission = "unsupported" | NotificationPermission;

export default function NotificationsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Set<NotificationType>>(new Set());
  // Lazy initializer, not an effect — this only ever READS the browser's
  // existing permission state, it never prompts, so there's nothing here
  // that needs to run after mount instead of during initial render.
  const [permission, setPermission] = useState<BrowserPermission>(() =>
    typeof window === "undefined" || !("Notification" in window)
      ? "unsupported"
      : Notification.permission,
  );

  useEffect(() => {
    if (!user) return;
    const ref = doc(getFirebaseFirestore(), "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const raw = snapshot.data()?.notificationPreferences;
      setPreferences(
        raw && typeof raw === "object" ? (raw as Record<string, boolean>) : {},
      );
    });
    return unsubscribe;
  }, [user]);

  async function toggle(type: NotificationType, enabled: boolean) {
    if (!user || pending.has(type)) return;
    setPending((prev) => new Set(prev).add(type));
    try {
      await updateDoc(doc(getFirebaseFirestore(), "users", user.uid), {
        [`notificationPreferences.${type}`]: enabled,
      });
    } finally {
      setPending((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    }
  }

  // Only ever called from the button's onClick below — never on mount,
  // never automatically. Browsers themselves refuse a permission prompt
  // that isn't triggered by a real user gesture, but the point stands
  // independent of that enforcement.
  async function requestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="mt-1 text-sm text-white/45">
        Choose which activity sends you a push notification. In-app activity
        is always recorded in your notification center regardless of these
        settings.
      </p>

      <div className="glass-panel mt-6 flex items-center gap-4 rounded-[28px] p-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
          {permission === "granted" ? (
            <BellRing className="size-5" />
          ) : (
            <Bell className="size-5" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Browser notifications
          </p>
          <p className="mt-0.5 text-xs text-white/45">
            {permission === "unsupported" &&
              "Not supported in this browser."}
            {permission === "granted" && "Enabled for this browser."}
            {permission === "denied" &&
              "Blocked — enable it from your browser's site settings."}
            {permission === "default" && "Not enabled yet."}
          </p>
        </div>
        {permission === "default" && (
          <button
            type="button"
            onClick={requestPermission}
            className="premium-button min-h-10 shrink-0 px-4 text-xs"
          >
            Enable
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold text-white">{group.title}</h2>
            <div className="glass-panel mt-2 divide-y divide-white/10 rounded-[24px]">
              {group.types.map(({ id, label }) => {
                const enabled = preferences[id] !== false;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-white/85">
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={label}
                      disabled={pending.has(id)}
                      onClick={() => toggle(id, !enabled)}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
                        enabled ? "bg-fuchsia-500" : "bg-white/15"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 size-5 rounded-full bg-white transition ${
                          enabled ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
