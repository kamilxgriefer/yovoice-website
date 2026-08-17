import {
  AudioLines,
  ChevronDown,
  ChevronUp,
  Crown,
  Headphones,
  MessageCircle,
  Mic,
  MicOff,
  PhoneOff,
  Users,
} from "lucide-react";

const speakers = [
  {
    initials: "MA",
    name: "Maya",
    role: "Host",
    speaking: true,
    muted: false,
    avatar: "from-fuchsia-500 to-violet-700",
  },
  {
    initials: "AL",
    name: "Alex",
    role: "Speaker",
    speaking: false,
    muted: false,
    avatar: "from-violet-500 to-indigo-700",
  },
  {
    initials: "NO",
    name: "Noah",
    role: "Speaker",
    speaking: false,
    muted: true,
    avatar: "from-purple-500 to-slate-700",
  },
] as const;

export function CommunityRoomPreview() {
  return (
    <div
      role="img"
      aria-label="Product preview of a YO Voice Community Room with the room topic, three people on stage, a listener strip and voice controls."
      className="relative mx-auto mt-7 w-full max-w-[700px] overflow-hidden rounded-[22px] border border-[#3A2C49] bg-[#07040c] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:mt-10 sm:rounded-[30px] sm:p-4"
    >
      <div className="pointer-events-none absolute inset-x-[18%] top-[-8%] h-48 rounded-full bg-[#8A2BE2]/15 blur-[75px]" />

      <div className="relative mb-2 flex items-center justify-between px-1 sm:mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200/70">
          New room experience
        </span>
        <span className="text-[10px] font-semibold text-white/55">
          Product preview
        </span>
      </div>

      <div className="relative space-y-2.5 rounded-[18px] border border-white/[0.04] bg-[#05030A]/80 p-2 sm:space-y-3 sm:rounded-[24px] sm:p-3">
        <div className="flex items-center gap-2 px-1 py-0.5 sm:gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full text-white/90">
            <ChevronDown className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black text-white sm:text-xs">
              Late night voices
            </p>
            <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#C026FF]">
              Community live
            </p>
          </div>
          <RoomCount value="3" label="Speaking" />
          <RoomCount value="12" label="Listeners" />
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-[#8A2BE2]/40 bg-gradient-to-br from-[#8A2BE2]/35 to-[#171121] px-4 py-3.5 sm:rounded-[22px] sm:px-5 sm:py-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(192,38,255,0.2),transparent_36%)]" />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-[9px] border border-[#8A2BE2]/45 bg-[#8A2BE2]/18 text-[#C026FF]">
                  <Users className="size-3.5" aria-hidden="true" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                  Community Room
                </span>
              </div>

              <p className="mt-2.5 truncate font-[family-name:var(--font-display)] text-lg font-black text-white sm:text-xl">
                Late night voices
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/65 sm:text-xs">
                Stories, ideas and the kind of conversation that keeps going.
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-[18px] border border-[#3A2C49]/90 bg-[#0E0915]/95 p-3 sm:rounded-[22px] sm:p-3.5">
          <div className="flex items-center gap-2">
            <AudioLines className="size-4 text-[#C026FF]" aria-hidden="true" />
            <span className="flex-1 text-xs font-black text-white sm:text-sm">
              On stage
            </span>
            <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#8A2BE2]/20 px-2 text-[10px] font-black text-white/85">
              3
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
            {speakers.map((speaker, index) => (
              <div
                key={speaker.name}
                className={`relative rounded-2xl border bg-[#171121]/95 px-2 py-3 text-center sm:px-3 ${
                  speaker.speaking
                    ? "border-[#8A2BE2]/80 shadow-[0_0_22px_rgba(138,43,226,0.22)]"
                    : "border-[#3A2C49]"
                } ${
                  index === 2
                    ? "col-span-2 w-[calc(50%-0.25rem)] justify-self-center sm:col-span-1 sm:w-full"
                    : ""
                }`}
              >
                <div className="relative mx-auto w-fit">
                  <div
                    className={`rounded-full border p-[2px] ${
                      speaker.speaking
                        ? "border-[#C026FF]"
                        : "border-white/15"
                    }`}
                  >
                    <div
                      className={`flex size-12 items-center justify-center rounded-full bg-gradient-to-br ${speaker.avatar} text-xs font-black text-white sm:size-14`}
                    >
                      {speaker.initials}
                    </div>
                  </div>

                  <span
                    className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[#171121] text-white ${
                      speaker.muted ? "bg-[#3A2C49]" : "bg-[#8A2BE2]"
                    }`}
                  >
                    {speaker.muted ? (
                      <MicOff className="size-2.5" aria-hidden="true" />
                    ) : (
                      <Mic className="size-2.5" aria-hidden="true" />
                    )}
                  </span>
                </div>

                <div className="mt-2 flex min-w-0 items-center justify-center gap-1">
                  {speaker.role === "Host" ? (
                    <Crown
                      className="size-2.5 shrink-0 text-amber-300"
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="truncate text-[10px] font-bold text-white sm:text-[11px]">
                    {speaker.name}
                  </span>
                </div>
                <span className="mt-0.5 block text-[10px] font-semibold text-white/60">
                  {speaker.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-11 items-center rounded-[16px] border border-[#3A2C49] bg-[#171121]/95 px-3 sm:rounded-[18px] sm:px-4">
          <Headphones
            className="mr-2 size-4 shrink-0 text-[#C026FF]"
            aria-hidden="true"
          />
          <div className="flex -space-x-2" aria-hidden="true">
            {["LU", "SA", "EM"].map((initials, index) => (
              <span
                key={initials}
                className={`flex size-6 items-center justify-center rounded-full border-2 border-[#171121] text-[7px] font-black text-white ${
                  index === 0
                    ? "bg-violet-700"
                    : index === 1
                      ? "bg-fuchsia-800"
                      : "bg-indigo-800"
                }`}
              >
                {initials}
              </span>
            ))}
          </div>
          <span className="ml-3 flex-1 text-[11px] font-extrabold text-white sm:text-xs">
            12 listening
          </span>
          <span className="text-[10px] font-bold text-white/75 sm:text-[11px]">
            People
          </span>
          <ChevronUp className="ml-1 size-3.5 text-[#C026FF]" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-4 gap-1.5 rounded-[18px] border border-[#2B1937] bg-[#09050F]/95 p-2 sm:gap-2 sm:p-2.5">
          <RoomControl icon={Mic} label="Mute" active />
          <RoomControl icon={MessageCircle} label="Chat" />
          <RoomControl icon={Users} label="People" />
          <RoomControl icon={PhoneOff} label="Leave" danger />
        </div>
      </div>
    </div>
  );
}

type RoomControlProps = {
  icon: typeof Mic;
  label: string;
  active?: boolean;
  danger?: boolean;
};

function RoomControl({ icon: Icon, label, active, danger }: RoomControlProps) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <span
        className={`flex size-9 items-center justify-center rounded-full border sm:size-10 ${
          danger
            ? "border-rose-400/25 bg-rose-500/18 text-rose-300"
            : active
              ? "border-[#C026FF]/35 bg-[#8A2BE2] text-white shadow-[0_0_18px_rgba(138,43,226,0.25)]"
              : "border-white/10 bg-white/[0.06] text-white/70"
        }`}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="truncate text-[10px] font-bold text-white/65">
        {label}
      </span>
    </div>
  );
}

function RoomCount({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex min-w-11 flex-col items-center rounded-xl border border-[#3A2C49] bg-[#171121]/85 px-2 py-1 sm:min-w-13">
      <span className="text-[11px] font-black leading-none text-white sm:text-xs">
        {value}
      </span>
      <span className="mt-1 text-[9px] font-bold leading-none text-white/60 sm:text-[10px]">
        {label}
      </span>
    </span>
  );
}
