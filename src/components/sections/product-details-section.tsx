"use client";

import { Crown, Hand, LockKeyhole, MessageCircle, Mic2, Radio, ShieldCheck, Sparkles, Trophy, UserPlus, Users } from "lucide-react";

const rows = [
  { icon: Radio, title: "Live broadcast", subtitle: "1,248 listeners", badge: "LIVE" },
  { icon: Mic2, title: "Current speakers", subtitle: "Host and 3 guests", badge: "4" },
  { icon: Hand, title: "Raised hands", subtitle: "Listeners waiting to speak", badge: "12" },
  { icon: ShieldCheck, title: "Moderator controls", subtitle: "Mute, remove and manage access", badge: "ON" },
];

export function ProductDetailsSection() {
  return (
    <section className="relative border-t border-white/[.06] bg-[#090615] py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <div id="community" className="grid gap-6 lg:grid-cols-2">
          <article className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow">Community Room</p>
            <h2 className="section-title">Feel the room, not the interface.</h2>
            <p className="section-copy">The Heart of the Community reacts to every voice. Speakers, listeners and shared energy become part of one living scene.</p>
            <div className="relative mt-10 aspect-[1.25/1] overflow-hidden rounded-[30px] border border-white/10 bg-[#100819]/85">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(192,38,255,.28),transparent_32%)]" />
              <div className="absolute left-[8%] top-[18%] flex items-center gap-3 rounded-2xl border border-fuchsia-300/20 bg-[#1a0d28]/88 px-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-700 text-xs font-bold">MA</div>
                <div><p className="text-xs font-bold">Maya</p><p className="text-[10px] text-fuchsia-300">Speaking now</p></div>
              </div>
              <div className="absolute left-1/2 top-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-[0_0_90px_rgba(192,38,255,.55)]">
                <Mic2 className="size-14" />
              </div>
              <div className="absolute bottom-[10%] left-1/2 flex -translate-x-1/2 gap-3">
                {[Mic2, MessageCircle, ShieldCheck, Users].map((Icon, i) => (
                  <button key={i} type="button" className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-[#170c23]/90 text-white/65 transition hover:bg-white/10 hover:text-white" aria-label={`Room control ${i+1}`}>
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow text-rose-400">Broadcast Room</p>
            <h2 className="section-title">Lead. Listen. Join.</h2>
            <p className="section-copy">Broadcast rooms give hosts structure without losing the humanity of a real conversation.</p>
            <div className="mt-9 space-y-4">
              {rows.map(({icon: Icon,title,subtitle,badge}) => (
                <div key={title} className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#130b1e]/75 p-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-500/12 text-rose-300"><Icon className="size-5"/></div>
                  <div className="flex-1"><p className="font-semibold">{title}</p><p className="mt-1 text-xs text-white/40">{subtitle}</p></div>
                  <span className="rounded-full border border-rose-400/15 bg-rose-400/10 px-3 py-1 text-[10px] font-bold text-rose-300">{badge}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center justify-between rounded-3xl border border-rose-400/15 bg-rose-500/[.08] p-5">
              <div><p className="text-xs font-bold uppercase tracking-[.2em] text-rose-300">Next speaker</p><p className="mt-2 text-lg font-bold">Alex requested the stage</p></div>
              <button type="button" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-fuchsia-50">Accept</button>
            </div>
          </article>
        </div>

        <div id="clubs" className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow">Clubs and friends</p>
            <h2 className="section-title">Find your people.</h2>
            <p className="section-copy">Build private clubs, meet new friends and stay close to creators and communities that matter.</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                [Crown,"Cybersecurity Hub","312 members","Join club"],
                [Users,"Gaming Nights","1.2K members","View club"],
                [MessageCircle,"Alex","Online now","Message"],
                [UserPlus,"Maya","Creator","Follow"],
              ].map(([Icon,title,subtitle,action]) => {
                const Comp = Icon as typeof Crown;
                return (
                  <div key={String(title)} className="rounded-3xl border border-white/10 bg-[#130b1e]/72 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300"><Comp className="size-5"/></div>
                    <h3 className="mt-5 text-lg font-bold">{String(title)}</h3>
                    <p className="mt-1 text-xs text-white/40">{String(subtitle)}</p>
                    <button type="button" className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white">{String(action)}</button>
                  </div>
                )
              })}
            </div>
          </article>

          <article id="achievements" className="glass-panel rounded-[36px] p-8 sm:p-10">
            <p className="eyebrow">Achievements</p>
            <h2 className="section-title">Every voice leaves a mark.</h2>
            <p className="section-copy">Unlock titles, collect achievements and show how you contribute to the communities around you.</p>
            <div className="mt-9 space-y-4">
              {[
                [Trophy,"First Speaker","Hosted your first live conversation","Unlocked",100],
                [Crown,"Community Builder","Help your club reach 100 members","82%",82],
                [Sparkles,"Voice of the Week","Become one of the most active speakers","Rare",38],
                [LockKeyhole,"Hidden achievement","Keep exploring YO Voice to discover it","Locked",8],
              ].map(([Icon,title,description,label,progress]) => {
                const Comp = Icon as typeof Trophy;
                return (
                  <div key={String(title)} className="rounded-3xl border border-white/10 bg-[#130b1e]/72 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/35 to-fuchsia-500/25 text-fuchsia-200"><Comp className="size-6"/></div>
                      <div className="flex-1">
                        <div className="flex justify-between gap-4"><h3 className="font-bold">{String(title)}</h3><span className="text-xs font-bold text-fuchsia-300">{String(label)}</span></div>
                        <p className="mt-1 text-xs text-white/40">{String(description)}</p>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{width:`${Number(progress)}%`}}/></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
