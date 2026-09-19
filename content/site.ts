/**
 * Site copy & links — edit freely. Anything marked PLACEHOLDER
 * is waiting on real details from Gowtham & Seshadhri.
 */

export const site = {
  name: "Kop Karuthu",
  tagline: "The Kop's opinion. In Tamil.",
  description:
    "Kop Karuthu is a Tamil Liverpool FC fan podcast: match previews, post-match reviews, live watchalongs, tactics and transfer talk, hosted by Gowtham & Seshadhri.",
  since: "2022-02-28",
  youtubeHandle: "@kopkaruthu",
  youtubeUrl: "https://www.youtube.com/@kopkaruthu",
  subscribeUrl: "https://www.youtube.com/@kopkaruthu?sub_confirmation=1",
  disclaimer:
    "Kop Karuthu is an independent fan podcast. We're not affiliated with, endorsed by or connected to Liverpool Football Club.",
};

export type Social = { label: string; handle: string; href: string; placeholder?: boolean };

export const socials: Social[] = [
  { label: "YouTube", handle: "@kopkaruthu", href: "https://www.youtube.com/@kopkaruthu" },
  { label: "X", handle: "@KopKaruthu_lfc", href: "https://x.com/KopKaruthu_lfc" },
  // PLACEHOLDER — replace with the real handle
  { label: "Instagram", handle: "@kopkaruthu", href: "https://www.instagram.com/", placeholder: true },
];

export const nav = [
  { href: "/", label: "Home" },
  { href: "/episodes", label: "Episodes" },
  { href: "/live", label: "Live" },
  { href: "/squad", label: "Squad" },
  { href: "/about", label: "About" },
] as const;

export const marqueeWords = [
  "Previews",
  "Reviews",
  "Watchalongs",
  "Tactics",
  "Transfers",
  "Opinions",
  "Banter",
  "Debates",
  "The Kop",
  "YNWA",
];

export const formats = [
  {
    key: "preview",
    title: "Previews",
    body: "Line-ups we'd pick, the opposition's weak spots, and a scoreline we'll regret predicting.",
  },
  {
    key: "review",
    title: "Reviews",
    body: "The morning after. Every player, every substitution, every decision the manager made — argued out.",
  },
  {
    key: "watchalong",
    title: "Watchalongs",
    body: "Live on YouTube while the match is on. Our reactions and your chat. No match footage, just the Kop in Tamil.",
  },
  {
    key: "tactics",
    title: "Tactics",
    body: "Build-up shapes, pressing triggers, who's inverting and why it isn't working. Football-brain hour.",
  },
  {
    key: "transfers",
    title: "Transfers",
    body: "Rumours, targets, outgoings and the squad holes nobody at the club seems to see.",
  },
  {
    key: "beyond",
    title: "Beyond LFC",
    body: "Liverpool Women's season, and daily World Cup 2026 round-ups when the whole world plays.",
  },
] as const;

export const hosts = [
  {
    key: "gowtham",
    name: "Gowtham",
    role: "Co-host",
    // PLACEHOLDER bio & take
    bio: "Co-host of Kop Karuthu. Placeholder bio: how the Liverpool story started, the favourite era, and the match that made it stick.",
    take: "Placeholder: Gowtham's hottest take goes here.",
  },
  {
    key: "seshadhri",
    name: "Seshadhri",
    role: "Co-host",
    // PLACEHOLDER bio & take
    bio: "Co-host of Kop Karuthu and keeper of the prediction league. Placeholder bio waiting on the real story.",
    take: "Placeholder: Seshadhri's hottest take goes here.",
  },
] as const;

export const timeline = [
  {
    date: "28 Feb 2022",
    title: "The channel goes live",
    body: "Kop Karuthu opens on YouTube: two Liverpool fans talking Liverpool, in Tamil.",
  },
  {
    date: "Aug 2024",
    title: "“Welcome back after a long time”",
    body: "After a quiet spell, the pods return for pre-season with Rohit joining, just as the Arne Slot era begins.",
  },
  {
    date: "2024",
    title: "Season reviews and the prediction league",
    body: "Full-season reviews, viewer-question episodes and a Kop Karuthu prediction league for the community.",
  },
  {
    date: "Oct 2025",
    title: "Picked up beyond the channel",
    body: "A Kop Karuthu reaction on X gets embedded by Football Insider in a piece on Alexander Isak.",
  },
  {
    date: "Jun 2026",
    title: "World Cup, every day",
    body: "Daily round-ups through the 2026 World Cup, with a Team of the Round and a group-stage review.",
  },
  {
    date: "2026/27",
    title: "Still talking",
    body: "Watchalongs on matchday, reviews the morning after. The Kop's opinion keeps coming.",
  },
];

/**
 * Worldwide Kop globe markers — illustrative, edit as you like.
 * [latitude, longitude]
 */
export const globeMarkers: { label: string; location: [number, number]; size: number }[] = [
  { label: "Chennai", location: [13.08, 80.27], size: 0.1 },
  { label: "Madurai", location: [9.93, 78.12], size: 0.05 },
  { label: "Coimbatore", location: [11.02, 76.96], size: 0.05 },
  { label: "Bengaluru", location: [12.97, 77.59], size: 0.06 },
  { label: "Jaffna", location: [9.66, 80.02], size: 0.05 },
  { label: "Colombo", location: [6.93, 79.85], size: 0.06 },
  { label: "Singapore", location: [1.35, 103.82], size: 0.06 },
  { label: "Kuala Lumpur", location: [3.14, 101.69], size: 0.05 },
  { label: "Dubai", location: [25.2, 55.27], size: 0.05 },
  { label: "London", location: [51.5, -0.12], size: 0.06 },
  { label: "Liverpool", location: [53.43, -2.96], size: 0.1 },
  { label: "Toronto", location: [43.65, -79.38], size: 0.05 },
  { label: "Sydney", location: [-33.87, 151.21], size: 0.05 },
];
