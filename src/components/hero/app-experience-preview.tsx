import Image from "next/image";
import {
  AudioLines,
  Bell,
  Home,
  LayoutGrid,
  Mail,
  MessageCircle,
  Plus,
  UsersRound,
} from "lucide-react";

const dockItems = [
  { icon: Home, label: "Home", active: true },
  { icon: MessageCircle, label: "Chats", active: false },
  { icon: AudioLines, label: "Moments", active: false },
  { icon: LayoutGrid, label: "More", active: false },
] as const;

function DockPreview({ pearl = false }: { pearl?: boolean }) {
  return (
    <div
      className="app-dock-preview relative grid grid-cols-[1fr_1fr_82px_1fr_1fr] items-end px-2 pb-2 pt-3"
      data-theme={pearl ? "pearl" : "dark"}
    >
      {dockItems.map(({ icon: Icon, label, active }, index) => {
        const slot = index > 1 ? index + 1 : index;

        return (
          <span
            key={label}
            style={{ gridColumnStart: slot + 1 }}
            className={`relative z-10 flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[9px] font-extrabold ${
              active
                ? pearl
                  ? "bg-violet-100 text-[#35104f]"
                  : "bg-violet-500/20 text-white"
                : pearl
                  ? "text-[#594b63]"
                  : "text-[#9189a6]"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </span>
        );
      })}

      <span className="absolute left-1/2 top-[-21px] z-20 flex size-[76px] -translate-x-1/2 items-center justify-center rounded-full">
        <Image
          src="/logos/yo-voice-symbol.png"
          alt=""
          width={96}
          height={100}
          className="h-[70px] w-auto drop-shadow-[0_10px_22px_rgba(192,38,255,.36)]"
        />
      </span>
    </div>
  );
}

function PearlPeek() {
  return (
    <div className="absolute right-0 top-8 hidden w-[54%] rotate-[4deg] overflow-hidden rounded-[34px] border border-[#d6c8df] bg-[#f6f2f8] p-4 text-[#211629] shadow-[0_28px_90px_rgba(61,31,80,.26)] sm:block">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#6f1dce]">
            Pearl
          </span>
          <p className="mt-1 text-sm font-black">Calm by day</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full border border-[#d6c8df] bg-white text-[#6f1dce]">
          <Bell className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#d6c8df] bg-white p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#706078]">
          Voice identity
        </p>
        <p className="mt-2 text-sm font-black">Your Vibe travels with you</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9e1ef]">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#6f1dce] to-[#a117d8]" />
        </div>
      </div>

      <div className="mt-16">
        <DockPreview pearl />
      </div>
    </div>
  );
}

/**
 * A truthful interface illustration. It mirrors current production widgets,
 * but deliberately contains no names, audience totals or online claims that
 * could be mistaken for real platform activity.
 */
export function AppExperiencePreview() {
  return (
    <div
      role="img"
      aria-label="Illustrative YO Voice app preview showing Dark and Pearl themes, a persistent email-verification notice, Voice Moments, a Community Room card and the sculpted YO navigation dock. It contains no live user activity data."
      className="relative mx-auto w-full max-w-[560px] pb-9 sm:pb-12"
    >
      <div aria-hidden="true">
        <div className="absolute inset-x-[12%] top-[8%] h-[82%] rounded-full bg-fuchsia-500/12 blur-[90px]" />
        <PearlPeek />

        <div className="relative z-10 w-full max-w-[356px] overflow-hidden rounded-[34px] border border-[#342a43] bg-[linear-gradient(180deg,#130a22_0%,#080711_72%)] p-4 text-[#f8f5fc] shadow-[0_38px_120px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06)] sm:p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-fuchsia-100/75">
              Interface preview
            </span>
            <span className="text-[8px] font-bold text-[#958b9f]">
              No live activity shown
            </span>
          </div>

          <div className="mt-3 flex min-h-11 items-center gap-2.5 rounded-[15px] border border-[#ffc94d]/22 bg-[#2e2410] px-3 py-2 text-left">
            <Mail className="size-4 shrink-0 text-[#ffc94d]" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-[9px] font-bold leading-3.5 text-[#f8f5fc]">
              Your email isn&apos;t verified yet.
            </span>
            <span className="shrink-0 text-[8px] font-black text-[#ffc94d]">
              Verify now
            </span>
          </div>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <p className="text-[11px] text-[#b8afc2]">Good evening,</p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-black">
                Your voice
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full border border-[#342a43] bg-[#17121f] text-[#d986ff]">
              <Bell className="size-4" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-7">
            <p className="text-xs font-black">Moments from your circle</p>
            <div className="mt-3 flex items-start gap-4">
              <div className="text-center">
                <span className="relative flex size-12 items-center justify-center rounded-full border-2 border-[#7b2ff7] bg-[#21192b]">
                  <AudioLines className="size-5 text-[#d986ff]" aria-hidden="true" />
                  <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-[#080711] bg-[#7b2ff7]">
                    <Plus className="size-2.5" aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-2 block text-[8px] font-bold text-[#b8afc2]">Your Moment</span>
              </div>
              <div className="text-center">
                <span className="flex size-12 items-center justify-center rounded-full border-2 border-[#7b2ff7] bg-[#21192b]">
                  <UsersRound className="size-5 text-[#d986ff]" aria-hidden="true" />
                </span>
                <span className="mt-2 block text-[8px] font-bold text-[#b8afc2]">Your circle</span>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between">
            <p className="text-xs font-black">Rooms for you</p>
            <span className="text-[9px] font-extrabold text-[#d986ff]">View all</span>
          </div>

          <div className="relative mt-3 overflow-hidden rounded-[22px] border border-[#342a43] bg-[linear-gradient(135deg,#21192b,#4a126f_62%,#8a18c4)] p-4">
            <div className="absolute right-[-14%] top-[-50%] size-32 rounded-full bg-fuchsia-300/16 blur-3xl" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em]">
              <UsersRound className="size-3 text-[#d986ff]" aria-hidden="true" />
              Community room
            </span>
            <p className="relative mt-5 text-base font-black">Open conversation</p>
            <p className="relative mt-1 text-[10px] leading-4 text-[#d9d2e0]">
              Join the people here, talk naturally and keep the room moving.
            </p>
            <div className="relative mt-4 flex items-center justify-between">
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[8px] font-bold text-[#e8e1ee]">
                People here
              </span>
              <span className="rounded-xl bg-gradient-to-r from-[#7b2ff7] to-[#c026ff] px-3.5 py-2 text-[9px] font-black text-white shadow-[0_9px_24px_rgba(123,47,247,.34)]">
                Join
              </span>
            </div>
          </div>

          <div className="mt-14">
            <DockPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
