"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Check,
  Clapperboard,
  House,
  MessageCircle,
  Move,
  UserPlus,
} from "lucide-react";

import { currentRelease } from "@/content/current-release";
import styles from "./tester-build-experience.module.css";

const surfaces = [
  {
    id: "home",
    label: "Home",
    icon: House,
    title: "Home starts with your people.",
    description:
      "Friends, recent Chats, a Voice Moment shortcut and a clear server-first invitation share one calm starting point. The familiar Hub remains the navigation foundation.",
    details: ["Friends stay visible at the top", "Recent private Chats are one step away", "Server creation replaces the old room entry"],
    image: "/screenshots/build-26/home-desktop.jpg",
    alt: "Build 26 capture of the YO Voice Home screen: the real desktop Hub, friends, Servers, Voice Moment and recent Chats.",
  },
  {
    id: "chats",
    label: "Chats",
    icon: MessageCircle,
    title: "Private conversation is easier to enter.",
    description:
      "Chats now places Add Friend beside New Message, keeps search and active contacts close, and gives shared photos or video a responsive full-screen viewer. Call setup and recovery changes are being exercised by internal testers.",
    details: ["A visible Add Friend route into Friends", "Full-screen private photo and video viewing", "Clearer send, retry and call recovery states"],
    image: "/screenshots/build-26/chats-desktop.jpg",
    alt: "Build 26 capture of the YO Voice Chats screen: the real Hub, search, Add Friend, New Message and recent conversations.",
  },
  {
    id: "friends",
    label: "Friends",
    icon: UserPlus,
    title: "Finding someone has a clear place.",
    description:
      "The redesigned Friends view separates adding new people from filtering the friends you already have, with direct tabs for online friends, requests and blocked accounts.",
    details: ["One primary Add Friend action", "Search explains who it filters", "All, Online, Requests and Blocked stay distinct"],
    image: "/screenshots/build-26/friends-desktop.jpg",
    alt: "Build 26 capture of the YO Voice Friends screen: Add Friend, search and the All, Online, Requests and Blocked tabs.",
  },
  {
    id: "yeels",
    label: "Yeels",
    icon: Clapperboard,
    title: "The media gets the space first.",
    description:
      "Yeels uses the same YO Moments language as Voice while keeping the photo or video readable. Creation supports text and link overlays that can be moved before publishing; user-supplied audio must be owned or licensed.",
    details: ["Voice and Yeels share one visual system", "Controls avoid covering the centre of the media", "Text and links can be positioned before publishing"],
    image: "/screenshots/build-26/yeels-desktop.jpg",
    alt: "Build 26 capture of the YO Voice Yeels screen: the real Hub, a media-first Yeel, creator details and conversation panel.",
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
        <p>Interface walkthrough · Build 26 captures</p>
        <h2 id="tester-build-experience-heading">One visual language, wherever you go.</h2>
        <div>
          <span>Captured in Build 26</span>
          <span>Current tester build {currentRelease.version}</span>
          <span>Hub preserved</span>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="App areas captured in Build 26">
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
                <p className={styles.counter}>0{index + 1} / 04</p>
                <h3>{selected.title}</h3>
                <p>{selected.description}</p>
                <ul role="list">
                  {selected.details.map((detail) => <li key={detail}><Check size={17} aria-hidden="true" />{detail}</li>)}
                </ul>
                {selected.id === "yeels" ? <span className={styles.dragNote}><Move size={16} aria-hidden="true" />Position overlays before publishing</span> : null}
                <Link href="/features">Explore the full feature set <ArrowRight size={17} aria-hidden="true" /></Link>
              </div>

              <figure className={styles.visual}>
                <Image src={selected.image} alt={selected.alt} width={1440} height={634} sizes="(max-width: 900px) 100vw, 62vw" />
                <figcaption>
                  Build 26 fixture-fed capture from source d1c036b7; sample names and content, with no live account data.
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
