import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Notifications</h1>
      <p className="mt-1 text-sm text-white/45">
        Notification preferences aren&apos;t wired up yet — they&apos;ll live
        here once we add a preferences document to Firestore.
      </p>

      <div className="glass-panel mt-6 flex items-center gap-4 rounded-[28px] p-7">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-500/20 text-fuchsia-200">
          <Bell className="size-5" />
        </div>
        <p className="text-sm text-white/50">Coming soon.</p>
      </div>
    </div>
  );
}
