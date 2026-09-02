import {
  ChevronDown,
  MessageCircle,
  MicOff,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

/**
 * A truthful two-step product illustration. Opening a room is a passive
 * preview; audio and presence start only after the explicit join action. Once
 * connected, the compact chat is visible by default and remains hideable.
 */
export function CommunityRoomPreview() {
  return (
    <div
      role="img"
      aria-label="Illustrative YO Voice Community Room flow. A passive Before you join preview appears before audio connects. After joining, compact room chat is visible by default and can be hidden. No live user data is shown."
      className="relative mx-auto mt-7 w-full max-w-[760px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-sunken)] p-2.5 shadow-[0_28px_80px_rgba(0,0,0,.34)] sm:mt-10 sm:rounded-[30px] sm:p-4"
    >
      <div className="pointer-events-none absolute inset-x-[12%] top-[-8%] h-52 rounded-full bg-[#7b2ff7]/18 blur-[80px]" />

      <div className="relative flex items-center justify-between gap-3 px-1 pb-2 sm:pb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d986ff]">
          Current room flow
        </span>
        <span className="text-right text-[10px] font-semibold text-[var(--text-tertiary)]">
          No audio before consent
        </span>
      </div>

      <div className="relative grid gap-2.5 sm:grid-cols-[1.04fr_.96fr] sm:gap-3">
        <div className="rounded-[20px] border border-[var(--border)] bg-[#080711]/92 p-3 sm:rounded-[24px] sm:p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#7b2ff7] text-[10px] font-black text-white">
              1
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d986ff]">
                Before you join
              </p>
              <p className="mt-0.5 text-[9px] text-[var(--text-tertiary)]">
                Look first. Connect when ready.
              </p>
            </div>
          </div>

          <div className="relative mt-3 overflow-hidden rounded-[18px] border border-[#7b2ff7]/38 bg-gradient-to-br from-[#21192b] via-[#321548] to-[#7117a2] p-4">
            <div className="absolute right-[-12%] top-[-55%] size-36 rounded-full bg-fuchsia-300/18 blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white/90">
                <UsersRound className="size-3 text-[#d986ff]" aria-hidden="true" />
                Community room
              </span>
              <span className="inline-flex rounded-full border border-[#57d99a]/30 bg-[#10271c] px-2.5 py-1 text-[8px] font-black text-[#57d99a]">
                Live now
              </span>
            </div>
            <p className="relative mt-6 text-base font-black text-white">
              Open conversation
            </p>
            <p className="relative mt-1 text-[10px] leading-4 text-white/70">
              See the topic and host before joining the voice session.
            </p>
          </div>

          <div className="mt-2.5 flex items-center gap-2.5 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7b2ff7]/18 text-[#d986ff]">
              <MicOff className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-black text-white">
                Microphone off
              </span>
              <span className="mt-0.5 block text-[9px] leading-3.5 text-[var(--text-tertiary)]">
                You enter muted by default.
              </span>
            </span>
          </div>

          <span className="mt-2.5 flex min-h-11 items-center justify-center rounded-[14px] bg-gradient-to-r from-[#7b2ff7] to-[#c026ff] px-4 text-[11px] font-black text-white shadow-[0_10px_28px_rgba(123,47,247,.28)]">
            Join conversation
          </span>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-3 sm:rounded-[24px] sm:p-4">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full border border-[#d986ff]/35 bg-[#7b2ff7]/18 text-[10px] font-black text-[#d986ff]">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#d986ff]">
                After joining
              </p>
              <p className="mt-0.5 text-[9px] text-[var(--text-tertiary)]">
                Chat starts open and stays compact.
              </p>
            </div>
            <ShieldCheck className="size-4 text-[#57d99a]" aria-hidden="true" />
          </div>

          <div className="mt-3 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[#0c0814]">
            <div className="flex min-h-11 items-center gap-2 border-b border-[var(--border)] px-3">
              <MessageCircle className="size-4 text-[#d986ff]" aria-hidden="true" />
              <span className="flex-1 text-[10px] font-black text-white">
                Room chat
              </span>
              <span className="text-[8px] font-bold text-[var(--text-tertiary)]">
                Visible by default
              </span>
              <ChevronDown className="size-4 text-[var(--text-secondary)]" aria-hidden="true" />
            </div>

            <div className="flex min-h-[132px] flex-col items-center justify-center px-4 text-center sm:min-h-[160px]">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#7b2ff7]/14 text-[#d986ff]">
                <MessageCircle className="size-4" aria-hidden="true" />
              </span>
              <p className="mt-2 text-[11px] font-black text-white">
                Start the conversation
              </p>
              <p className="mt-1 max-w-[190px] text-[9px] leading-4 text-[var(--text-tertiary)]">
                Hide the panel whenever you want more room for the conversation.
              </p>
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--border)] p-2.5">
              <span className="flex min-h-10 min-w-0 flex-1 items-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 text-[9px] text-[var(--text-tertiary)]">
                Say something…
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7b2ff7] text-white">
                <Send className="size-4" aria-hidden="true" />
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1 text-[8px] font-bold text-[var(--text-secondary)]">
              People here
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1 text-[8px] font-bold text-[var(--text-secondary)]">
              Fast local mute
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
