import type { Metadata } from "next";
import { getPlTeams } from "@/lib/plteams";
import { TacticsBoard } from "@/components/tactics/TacticsBoard";

export const metadata: Metadata = {
  title: "Tactics board",
  description:
    "A full-size tactics board: pick any two Premier League squads or a custom XI, set the formation, drag players and the ball, draw the shape and step through it like slides.",
};

export default async function TacticsPage() {
  const teams = await getPlTeams();
  return <TacticsBoard teams={teams} />;
}
