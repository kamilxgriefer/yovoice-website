import {
  Crown,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  UsersRound,
} from "lucide-react";

const people = [
  {
    initials: "YO",
    role: "Host",
    speaking: true,
    muted: false,
    avatar: "from-fuchsia-400 to-violet-700",
  },
  {
    initials: "01",
    role: "Member",
    speaking: false,
    muted: false,
    avatar: "from-violet-400 to-indigo-700",
  },
  {
    initials: "02",
    role: "Member",
    speaking: false,
    muted: true,
    avatar: "from-purple-400 to-slate-700",
  },
] as const;

/**
 * An interface illustration, not a live room. The current product uses one
 * shared presence model, so this preview intentionally contains no audience
 * total, listener lane or stage hierarchy.
 */
export function CommunityRoomPreview() {
  return (
    <div
      role="img"
      aria-label="Illustrative YO Voice Community Room preview with one People here area and compact voice controls. No live audience data is shown."
      className="relative mx-auto mt-7 w-full max-w-[700px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,.34)] sm:mt-10 sm:rounded-[30px] sm:p-4"
    >
      <div className="pointer-events-none absolute inset-x-[16%] top-[-10%] h-48 rounded-full bg-[#7b2ff7]/18 blur-[75px]" />

      <div className="relative flex items-center justify-between px-1 pb-2 sm:pb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d986ff]">
          Current room model
        </span>
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
          Interface preview
        </span>
      </div>

      <div className="relative space-y-2.5 rounded-[19px] border border-white/[.04] bg-[#080711]/88 p-2.5 sm:space-y-3 sm:rounded-[24px] sm:p-3">
        <div className="relative overflow-hidden rounded-[19px] border border-[#7b2ff7]/35 bg-gradient-to-br from-[#21192b] via-[#321548] to-[#7117a2] px-4 py-4 sm:rounded-[22px] sm:px-5 sm:py-5">
          <div className="absolute right-[-8%] top-[-55%] size-40 rounded-full bg-fuchsia-300/18 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/85">
                <UsersRound className="size-3 text-[#d986ff]" aria-hidden="true" />
                Community Room
              </span>
              <p className="mt-4 truncate text-lg font-black text-white sm:text-xl">
                Open conversation
              </p>
              <p className="mt-1 max-w-md text-[11px] leading-4 text-white/70 sm:text-xs">
                Everyone joins the same room and can take part naturally.
              </p>
            </div>
            <span className="rounded-full border border-white/12 bg-black/20 px-2.5 py-1 text-[9px] font-black text-white/80">
              LIVE
            </span>
          </div>
        </div>

        <div className="rounded-[19px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:rounded-[22px] sm:p-3.5">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-[#d986ff]" aria-hidden="true" />
            <span className="flex-1 text-xs font-black text-white sm:text-sm">
              People here
            </span>
            <span className="text-[10px] font-bold text-[var(--text-tertiary)]">
              One shared room
            </span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-2.5">
            {people.map((person) => (
              <div
                key={person.initials}
                className={`relative rounded-2xl border bg-[var(--surface-raised)] px-1.5 py-3 text-center sm:px-3 ${
                  person.speaking
                    ? "border-[#d986ff]/75 shadow-[0_0_22px_rgba(217,134,255,.18)]"
                    : "border-[var(--border)]"
                }`}
              >
                <div className="relative mx-auto w-fit">
                  <div
                    className={`rounded-full border p-[2px] ${
                      person.speaking ? "border-[#d986ff]" : "border-white/15"
                    }`}
                  >
                    <div
                      className={`flex size-11 items-center justify-center rounded-full bg-gradient-to-br ${person.avatar} text-[10px] font-black text-white sm:size-14 sm:text-xs`}
                    >
                      {person.initials}
                    </div>
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[var(--surface-raised)] text-white ${
                      person.muted ? "bg-[var(--border-strong)]" : "bg-[#7b2ff7]"
                    }`}
                  >
                    {person.muted ? (
                      <MicOff className="size-2.5" aria-hidden="true" />
                    ) : (
                      <Mic className="size-2.5" aria-hidden="true" />
                    )}
                  </span>
                </div>

                <div className="mt-2 flex min-w-0 items-center justify-center gap-1">
                  {person.role === "Host" ? (
                    <Crown className="size-2.5 shrink-0 text-amber-300" aria-hidden="true" />
                  ) : null}
                  <span className="truncate text-[9px] font-bold text-white sm:text-[11px]">
                    {person.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-2">
          <RoomAction icon={Mic} label="Mute" active />
          <RoomAction icon={MessageCircle} label="Chat" />
          <RoomAction icon={UsersRound} label="People" />
          <RoomAction icon={PhoneOff} label="Leave" danger />
        </div>
      </div>
    </div>
  );
}

function RoomAction({
  icon: Icon,
  label,
  active = false,
  danger = false,
}: {
  icon: typeof Mic;
  label: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col items-center justify-center gap-1.5 py-1 text-center">
      <span
        className={`flex size-9 items-center justify-center rounded-full border sm:size-10 ${
          danger
            ? "border-rose-400/25 bg-rose-400/12 text-rose-300"
            : active
              ? "border-[#d986ff]/40 bg-[#7b2ff7] text-white shadow-[0_8px_22px_rgba(123,47,247,.28)]"
              : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--text-secondary)]"
        }`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="truncate text-[8px] font-bold text-[var(--text-secondary)] sm:text-[9px]">
        {label}
      </span>
    </span>
  );
}
