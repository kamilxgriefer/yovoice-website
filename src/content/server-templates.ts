/**
 * Servers interface copy for the current internal tester build. Servers have
 * been open to every signed-in account since 2026-09-16 (app ADR-197:
 * appConfig/serversV1 callableAccess "all"); Podcast recording remains
 * disabled. The per-template tools lists are product direction, not a
 * per-feature status. Starter channels are the real seeded channels from the
 * app's server templates (English labels). `stage` names no build number.
 */
export const serverLaunchPolicy = {
  stage: "Internal testing · open to every signed-in account",
  backendStage: "Open to every signed-in account",
  freeOwnedServers: 5,
  premiumOwnedServers: 30,
  unlimitedServerJoins: true,
  familyOwnerLimit: 1,
  preservesExistingEntitlements: true,
} as const;

export const serverTemplates = [
  {
    id: "friends",
    name: "Friends",
    short: "Your inner circle",
    headline: "Good company. No agenda.",
    description: "A place for the group chat to find its voice. Drop into your lounge, make a plan, or just keep each other company.",
    space: "After hours",
    channel: "Lounge",
    privacy: "Invite-only by default",
    channels: ["Lounge", "general", "Events"],
    tools: ["Voice and text channels", "Events with RSVP", "Invites for your circle"],
    scene: "A friends server with voice, text, events and rules channels.",
    note: "Same people. A place to come back to.",
  },
  {
    id: "community",
    name: "Community",
    short: "A shared passion",
    headline: "Big ideas. A place to belong.",
    description: "Give your community a home beyond a single conversation. Bring people together around a stage, dedicated channels and events.",
    space: "The creative collective",
    channel: "LIVE Stage",
    privacy: "You choose the audience",
    channels: ["LIVE Stage", "Announcements", "Questions"],
    tools: ["Video and live stage direction", "Questions and events", "Roles and moderation"],
    scene: "A community server with a LIVE stage, topic channels, events and moderation.",
    note: "A shared interest. A stronger connection.",
  },
  {
    id: "podcast",
    name: "Podcast",
    short: "Conversations that stay",
    headline: "A little studio. A bigger story.",
    description: "Bring hosts, guests and listeners into one space. The planned studio connects live conversations, audience questions and episodes.",
    space: "Between the lines",
    channel: "LIVE Studio",
    privacy: "You choose the audience",
    channels: ["LIVE Studio", "Questions", "Episodes"],
    tools: ["Host and guest layout", "Questions and voting", "Episode planning; recording disabled"],
    scene: "A podcast server with hosts, guests and audience questions. Recording is disabled.",
    note: "From the first question to the final thought.",
  },
  {
    id: "family",
    name: "Family",
    short: "A little closer",
    headline: "Together, even from a distance.",
    description: "A quieter corner just for your family. Catch up, keep plans in one place and share the little moments worth keeping.",
    space: "Our family home",
    channel: "Lounge",
    privacy: "Invite-only by default",
    channels: ["Lounge", "Calendar", "Memories"],
    tools: ["Family lounge", "Calendar and shared lists", "Photos and voice memories"],
    scene: "A private family server with a shared calendar, shopping list and memories.",
    note: "Less catching up. More being there.",
  },
  {
    id: "company",
    name: "Company",
    short: "Work, with a human side",
    headline: "A team space. Not another tab.",
    description: "Keep conversations close to the work. A planned home for team meetings, shared files and focused channels with role-based access.",
    space: "Studio North",
    channel: "Meetings",
    privacy: "Invite-only by default",
    channels: ["Meetings", "Files", "HR · restricted"],
    tools: ["Meetings and screen-sharing direction", "Shared whiteboard direction", "Restricted HR and Management channels"],
    scene: "A company server with team channels and planned collaboration tools.",
    note: "Make room for the people behind the project.",
  },
] as const;

export type ServerTemplate = (typeof serverTemplates)[number];
export type ServerTemplateId = ServerTemplate["id"];

/** Roving focus for the preview tabs. No network or product action is taken. */
export function nextTemplateIndex(current: number, key: string): number {
  switch (key) {
    case "ArrowRight": return (current + 1) % serverTemplates.length;
    case "ArrowLeft": return (current - 1 + serverTemplates.length) % serverTemplates.length;
    case "Home": return 0;
    case "End": return serverTemplates.length - 1;
    default: return current;
  }
}
