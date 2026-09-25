"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Check,
  House,
  MessageCircle,
  UserPlus,
} from "lucide-react";

import styles from "./tester-build-experience.module.css";

/**
 * The /updates interface walkthrough: three desktop-layout captures of
 * YO Voice 3.0.0 (34), the Slim redesign testers have had since 19 September
 * 2026. Each was rendered by the app's own preview harness from the released
 * source (f71a2ae2) in English, on sample data, with no account and no
 * network; docs/design/current-screenshots.md records how.
 *
 * Exactly one rail item is lit in each frame. Friends has no rail row of its
 * own in 3.0.0 — the app keeps More lit while it is open, as MainShell does —
 * so the Friends frame shows More selected, which is what a tester sees.
 *
 * Yeels is deliberately absent: the harness can only draw a placeholder still
 * for Yeel media, so there is no truthful Yeels capture to show.
 */
const surfaces = [
  {
    id: "home",
    label: "Home",
    icon: House,
    title: "Home starts with your people.",
    description:
      "Friends and their Voice Moments sit at the top, a Live now card shows which channel is live, and your recent Chats and servers are one step away — with a shortcut to record a Voice Moment beside them.",
    details: ["Your people, with their latest Voice Moments", "Live now shows the channel that is live", "Recent Chats and your servers on the same page"],
    image: "/screenshots/current/home-wide-slim.webp",
    alt: "YO Voice 3.0.0 Home in the desktop layout: the navigation rail with Home selected, a greeting, a Your people row, a Live now card, Here and now with a server, a Got a minute? prompt to record a Voice Moment, and Your recent chats.",
  },
  {
    id: "chats",
    label: "Chats",
    icon: MessageCircle,
    title: "Private conversation is easy to enter.",
    description:
      "Chats opens with search, then one row that starts with Add friend and New message and carries on through your friends, then your private conversations with unread counts, voice messages included.",
    details: ["Add friend beside New message", "Your friends one tap from a new conversation", "Unread counts on every conversation"],
    image: "/screenshots/current/chats-wide-slim.webp",
    alt: "YO Voice 3.0.0 Chats in the desktop layout: the navigation rail with Chats selected, a search field, Add friend and New message at the start of a row of friends, and a Messages list with unread counts.",
  },
  {
    id: "friends",
    label: "Friends",
    icon: UserPlus,
    title: "Finding someone has a clear place.",
    description:
      "Friends separates adding someone new from filtering the friends you already have, with direct filters for All, Online, Requests and Blocked, and a message button on every row.",
    details: ["One primary Add friend action", "Search explains who it filters", "All, Online, Requests and Blocked stay distinct"],
    image: "/screenshots/current/friends-wide-slim.webp",
    alt: "YO Voice 3.0.0 Friends in the desktop layout: the navigation rail with More selected, an Add friend button, the All, Online, Requests and Blocked filters, a search field for current friends, and a list of six friends with their status.",
  },
] as const;

// The tabs scroll horizontally on narrow screens. A focused tab is brought
// fully into its strip, whose scroll-padding keeps the keyboard focus ring
// (outline plus offset) inside the visible area instead of clipping it.
function revealTab(tab: HTMLButtonElement) {
  tab.scrollIntoView({ block: "nearest", inline: "nearest" });
}

export function TesterBuildExperience() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = surfaces[selectedIndex];

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? surfaces.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + surfaces.length) % surfaces.length;
    setSelectedIndex(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className={styles.section} aria-labelledby="tester-build-experience-heading">
      <div className={styles.heading}>
        <p>Interface walkthrough · YO Voice 3.0.0</p>
        <h2 id="tester-build-experience-heading">One visual language, wherever you go.</h2>
        <div>
          <span>Captured in YO Voice 3.0.0 (34)</span>
          <span>The Slim redesign</span>
          <span>Desktop layout</span>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="App areas captured in YO Voice 3.0.0">
        {surfaces.map((surface, index) => {
          const Icon = surface.icon;
          return (
            <button
              key={surface.id}
              type="button"
              id={`surface-tab-${surface.id}`}
              role="tab"
              aria-controls={`surface-panel-${surface.id}`}
              aria-selected={index === selectedIndex}
              tabIndex={index === selectedIndex ? 0 : -1}
              ref={(element) => { buttons.current[index] = element; }}
              onClick={() => setSelectedIndex(index)}
              onFocus={(event) => revealTab(event.currentTarget)}
              onKeyDown={(event) => moveFocus(event, index)}
            >
              <Icon size={19} aria-hidden="true" />
              {surface.label}
            </button>
          );
        })}
      </div>

      {surfaces.map((surface, index) => (
        <div
          key={surface.id}
          id={`surface-panel-${surface.id}`}
          role="tabpanel"
          aria-labelledby={`surface-tab-${surface.id}`}
          tabIndex={0}
          hidden={index !== selectedIndex}
          className={styles.panel}
        >
          {index === selectedIndex ? (
            <>
              <div className={styles.copy}>
                <p className={styles.counter}>0{index + 1} / 0{surfaces.length}</p>
                <h3>{selected.title}</h3>
                <p>{selected.description}</p>
                <ul role="list">
                  {selected.details.map((detail) => <li key={detail}><Check size={17} aria-hidden="true" />{detail}</li>)}
                </ul>
                <Link href="/features">Explore the full feature set <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>

              <figure className={styles.visual}>
                <Image src={selected.image} alt={selected.alt} width={2160} height={1350} sizes="(max-width: 980px) 100vw, 62vw" />
                <figcaption>
                  YO Voice 3.0.0 (34), app source f71a2ae2, rendered in English by the app&apos;s preview harness on sample data; no live account or network.
                </figcaption>
              </figure>
            </>
          ) : null}
        </div>
      ))}

      <p className={styles.creatorNote} role="note">
        Following is a Creator feature. Audience visibility is shown only for a Premium Creator profile after age verification and explicit opt-in; the website and app do not use a client-side toggle as proof of eligibility.
      </p>
    </section>
  );
}
