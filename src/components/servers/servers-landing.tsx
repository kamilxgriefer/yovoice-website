import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Layers3,
  LockKeyholeOpen,
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
            Friends, Community, Podcast, Family and Company share one compact
            server list, with a server rail beside the channels, in one calmer
            design in Dark and Pearl.
          </p>
          <div className={styles.heroActions}>
            <Link href="#server-types" className="premium-button">
              Explore five types <ArrowDown size={18} aria-hidden="true" />
            </Link>
            <Link href={`/updates#mobile-build-${currentRelease.buildNumber}-internal-testing`} className="premium-button-secondary">
              YO Voice {currentRelease.version} release <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.releaseNote}>
            <strong>{currentRelease.version}.</strong> {currentReleaseAvailability}
            {" "}This is not a public App Store or Google Play release.
          </p>
        </div>

        <figure className={styles.productFrame}>
          <div className={styles.frameTop} aria-hidden="true">
            <span /><span>Captured in YO Voice 3.0.0</span><span>87a2f996</span>
          </div>
          <Image
            src="/screenshots/build-35/create-server-desktop.webp"
            alt="YO Voice 3.0.0 capture of the Create your server screen in English at desktop width, showing five choices: For friends, For a community, For a podcast, For family and For a company."
            width={1440}
            height={800}
            preload
            sizes="(max-width: 900px) 100vw, 58vw"
          />
          <figcaption>
            YO Voice 3.0.0 capture from app commit 87a2f996, rendered in
            English by the app&apos;s preview harness on sample data, with
            no live account or server connection.
          </figcaption>
        </figure>
      </section>

      <ServerExplorer />

      <section className={styles.howSection} aria-labelledby="server-release-boundary">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>What testers can do today</p>
          <h2 id="server-release-boundary">Open to everyone signed in, with one clear boundary.</h2>
          <p>Servers have been open to every signed-in account since 16 September 2026. The app is still an internal tester release, and Podcast recording remains disabled.</p>
        </div>

        <ol role="list" className={styles.steps}>
          {[
            {
              icon: Layers3,
              title: "Servers are where your circles meet",
              text: "Home lists your servers, and the five-type selector is in the current tester build and the web app.",
            },
            {
              icon: Users,
              title: "The navigation you know stays",
              text: "The navigation stays where it was on mobile and desktop; a server rail beside the channels lets you switch servers without leaving the workspace.",
            },
            {
              icon: LockKeyholeOpen,
              title: "Creation, joining and channels are live",
              text: "Every signed-in account can create a Server, join one, send invites and use its voice and text channels. Podcast recording is the one piece still switched off.",
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
              Free accounts can own up to {serverLaunchPolicy.freeOwnedServers} Servers and Premium accounts up to {serverLaunchPolicy.premiumOwnedServers}; everyone can join without a limit. One Family Server per owner counts toward the same ownership allowance. These allowances are enforced by the server now that Servers are open.
            </p>
          </div>
          <Link href="/faq">Read the release answers <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
