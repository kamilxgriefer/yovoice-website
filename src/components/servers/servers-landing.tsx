import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

import { currentRelease, currentReleaseAvailability } from "@/content/current-release";
import { serverLaunchPolicy } from "@/content/server-templates";
import { ServerExplorer } from "./server-explorer";
import styles from "./servers-landing.module.css";

export function ServersLanding() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="server-hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} /> {serverLaunchPolicy.stage}
          </p>
          <h1 id="server-hero-title">
            A server for
            <span> every circle.</span>
          </h1>
          <p className={styles.heroDescription}>
            Friends, Community, Podcast, Family and Company now share one
            compact, responsive server-first interface, while the familiar
            YO Voice Hub stays in place.
          </p>
          <div className={styles.heroActions}>
            <Link href="#server-types" className={styles.primaryLink}>
              Explore five types <ArrowDown size={18} aria-hidden="true" />
            </Link>
            <Link href="/updates#mobile-build-26-internal-testing" className={styles.secondaryLink}>
              Build 26 status <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.releaseNote}>
            <strong>{currentRelease.version}.</strong> {currentReleaseAvailability}
            {" "}This is not a public App Store or Google Play release.
          </p>
        </div>

        <figure className={styles.productFrame}>
          <div className={styles.frameTop} aria-hidden="true">
            <span /><span>Build 26 capture</span><span>d1c036b7</span>
          </div>
          <Image
            src="/screenshots/build-26/servers-desktop.jpg"
            alt="Build 26 capture of the YO Voice Servers screen, showing the real Hub and five choices: Friends, Community, Podcast, Family and Company."
            width={1440}
            height={634}
            preload
            sizes="(max-width: 900px) 100vw, 58vw"
          />
          <figcaption>
            Build 26 fixture-fed capture from source d1c036b7. Sample profile
            and content; no live account or server connection.
          </figcaption>
        </figure>
      </section>

      <ServerExplorer />

      <section className={styles.howSection} aria-labelledby="server-release-boundary">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What testers see in Build 26</p>
          <h2 id="server-release-boundary">A clear direction, with a clear boundary.</h2>
          <p>The interface is in internal testing. Activation still waits for the server-side release gate.</p>
        </div>

        <ol role="list" className={styles.steps}>
          {[
            {
              icon: Layers3,
              title: "Servers replace the old entry points",
              text: "Home and the Hub lead into Servers, with the five-type selector included in the internal tester build.",
            },
            {
              icon: Users,
              title: "The Hub keeps its shape",
              text: "The established animated navigation remains the shared foundation on mobile and desktop; only the Rooms destination becomes Servers.",
            },
            {
              icon: LockKeyhole,
              title: "Backend activation stays gated",
              text: "Creation, membership, channel activity and Podcast recording are not presented as active until the backend gate is cleared.",
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <div className={styles.stepTop}><Icon size={25} aria-hidden="true" /><span>0{index + 1}</span></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.allowance} role="note">
          <span className={styles.allowanceIcon}><ShieldCheck aria-hidden="true" /></span>
          <div>
            <h3>Release policy preserved</h3>
            <p>
              Free accounts can own up to {serverLaunchPolicy.freeOwnedServers} Servers and Premium accounts up to {serverLaunchPolicy.premiumOwnedServers}; everyone can join without a limit. One Family Server per owner counts toward the same ownership allowance. These allowances are not active while the server backend remains gated.
            </p>
          </div>
          <Link href="/faq">Read the release answers <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
