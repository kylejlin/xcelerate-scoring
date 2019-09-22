import { deleteAthletes } from "./private/cloudFunctions";
import { Athlete } from "../types/misc";

export default function deleteAthlete(
  seasonId: string,
  athlete: Athlete
): Promise<void> {
  return deleteAthletes({
    seasonId,
    athleteIds: [parseInt(athlete.id, 10)],
  }).then();
}
