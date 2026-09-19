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
  creatorOnly?: boolean;
  types: { id: NotificationType; label: string }[];
}[] = [
  {
    title: "Friends",
    types: [
      { id: "friendRequest", label: "Friend requests" },
      { id: "friendAccepted", label: "Friend request accepted" },
    ],
  },
  {
    title: "Creator audience",
    creatorOnly: true,
    types: [{ id: "follow", label: "New followers" }],
  },
  {
    title: "Servers",
    types: [
      { id: "clubInvite", label: "Server invitations" },
      { id: "clubInviteAccepted", label: "Server invitation accepted" },
      { id: "roomInvite", label: "Voice channel invitations" },
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
  const [creatorAudienceProjection, setCreatorAudienceProjection] = useState<{
    uid: string;
    visible: boolean;
  } | null>(null);
  const creatorAudienceVisible =
    creatorAudienceProjection !== null &&
    creatorAudienceProjection.uid === user?.uid &&
    creatorAudienceProjection.visible;
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
      const data = snapshot.data();
      const raw = data?.notificationPreferences;
      setPreferences(
        raw && typeof raw === "object" ? (raw as Record<string, boolean>) : {},
      );
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const ref = doc(getFirebaseFirestore(), "publicProfiles", user.uid);
    return onSnapshot(
      ref,
      (snapshot) => {
        // This is the public, server-derived eligibility projection. Premium,
        // age verification and opt-in are deliberately not recomputed here.
        setCreatorAudienceProjection({
          uid,
          visible: snapshot.data()?.creatorAudienceVisible === true,
        });
      },
      () => setCreatorAudienceProjection({ uid, visible: false }),
    );
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
      <p className="mt-1 text-sm text-text-tertiary">
        Choose which activity sends you a push notification. In-app activity
        is always recorded in your notification center regardless of these
        settings.
      </p>

      <div className="panel mt-6 flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <div className="icon-tile">
          {permission === "granted" ? (
            <BellRing className="size-5" aria-hidden="true" />
          ) : (
            <Bell className="size-5" aria-hidden="true" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            Browser notifications
          </p>
          <p className="mt-0.5 text-xs text-text-tertiary">
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
            className="premium-button shrink-0"
          >
            Enable
          </button>
        )}
      </div>

      {!creatorAudienceVisible ? (
        <p data-tone="info" className="status-alert mt-4">
          Follower alerts appear only when the server marks a Premium Creator
          profile as age-verified and explicitly opted in to public audience
          visibility.
        </p>
      ) : null}

      <div className="mt-6 space-y-6">
        {GROUPS.filter((group) => !group.creatorOnly || creatorAudienceVisible).map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-bold text-white">{group.title}</h2>
            <div className="panel mt-2 divide-y divide-[var(--border)]">
              {group.types.map(({ id, label }) => {
                const enabled = preferences[id] !== false;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <span className="text-sm font-medium text-text-secondary">
                      {label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={label}
                      disabled={pending.has(id)}
                      onClick={() => toggle(id, !enabled)}
                      className="focus-ring relative h-11 w-12 shrink-0 rounded-xl disabled:opacity-50"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute left-0 top-2.5 h-6 w-11 rounded-full transition ${enabled ? "bg-[var(--primary)]" : "border border-border-strong bg-[var(--surface-raised)]"}`}
                      >
                        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${enabled ? "left-[22px]" : "left-0.5"}`} />
                      </span>
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
