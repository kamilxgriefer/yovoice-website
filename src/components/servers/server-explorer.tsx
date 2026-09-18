"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import {
  AudioLines,
  BriefcaseBusiness,
  Check,
  Hash,
  Heart,
  LockKeyhole,
  Mic2,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

import {
  nextTemplateIndex,
  serverLaunchPolicy,
  serverTemplates,
} from "@/content/server-templates";
import styles from "./servers-landing.module.css";

const icons = {
  friends: Users,
  community: Sparkles,
  podcast: Mic2,
  family: Heart,
  company: BriefcaseBusiness,
};

// On narrow screens the tabs scroll horizontally. A focused tab is brought
// fully into its strip, whose scroll-padding keeps the keyboard focus ring
// (outline plus offset) inside the visible area instead of clipping it.
function revealTab(tab: HTMLButtonElement) {
  tab.scrollIntoView({ block: "nearest", inline: "nearest" });
}

export function ServerExplorer() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = nextTemplateIndex(index, event.key);
    setSelectedIndex(next);
    buttons.current[next]?.focus();
  }

  return (
    <section className={styles.explorer} id="server-types" aria-labelledby="server-types-heading">
      <div className={styles.explorerHeading}>
        <div>
          <p className={styles.eyebrow}>One interface. Five starting points.</p>
          <h2 id="server-types-heading">Who is your server for?</h2>
        </div>
        <p>
          The current tester build includes the selector and workspace, and
          every signed-in account can create, join and use a Server. Podcast
          recording remains disabled.
        </p>
      </div>

      <div className={styles.typePicker} role="tablist" aria-label="Server types">
        {serverTemplates.map((template, index) => {
          const Icon = icons[template.id];
          return (
            <button
              key={template.id}
              type="button"
              role="tab"
              id={`type-${template.id}`}
              aria-controls={`preview-${template.id}`}
              aria-selected={selectedIndex === index}
              tabIndex={selectedIndex === index ? 0 : -1}
              ref={(element) => {
                buttons.current[index] = element;
              }}
              onClick={() => setSelectedIndex(index)}
              onFocus={(event) => revealTab(event.currentTarget)}
              onKeyDown={(event) => moveFocus(event, index)}
              className={styles.typeButton}
              data-theme={template.id}
            >
              <Icon size={22} aria-hidden="true" />
              <span>
                <strong>{template.name}</strong>
                <small>{template.short}</small>
              </span>
              <Check className={styles.selectedCheck} size={16} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {serverTemplates.map((template, index) => {
        const Icon = icons[template.id];
        return (
          <div
            key={template.id}
            id={`preview-${template.id}`}
            role="tabpanel"
            aria-labelledby={`type-${template.id}`}
            hidden={index !== selectedIndex}
            tabIndex={0}
            className={styles.previewPanel}
            data-theme={template.id}
          >
            {index === selectedIndex ? (
              <div className={styles.templateDetail}>
                <div className={styles.templateLead}>
                  <span className={styles.templateIcon}><Icon aria-hidden="true" /></span>
                  <p className={styles.panelKicker}>{template.space}</p>
                  <h3>{template.headline}</h3>
                  <p>{template.description}</p>
                  <span className={styles.privacy}><LockKeyhole size={15} aria-hidden="true" />{template.privacy}</span>
                </div>

                <div className={styles.templateColumns}>
                  <div>
                    <p className={styles.toolsLabel}>Starter channels</p>
                    <ul role="list">
                      {template.channels.map((channel, channelIndex) => (
                        <li key={channel}>
                          {channelIndex === 0 ? <AudioLines size={17} aria-hidden="true" /> : <Hash size={17} aria-hidden="true" />}
                          {channel}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className={styles.toolsLabel}>Product direction</p>
                    <ul role="list">
                      {template.tools.map((tool) => <li key={tool}><Check size={17} aria-hidden="true" />{tool}</li>)}
                    </ul>
                  </div>
                </div>

                <div className={styles.panelGate} role="note">
                  <ShieldAlert size={20} aria-hidden="true" />
                  <p>
                    <strong>{serverLaunchPolicy.backendStage}.</strong> You can create this kind of Server, join one, send invites and use its voice and text channels in the current tester build. The tools listed are product direction; Podcast recording remains disabled.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
