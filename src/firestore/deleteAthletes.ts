import { deleteAthletes as deleteFirestoreAthletes } from "./private/cloudFunctions";

export default function deleteAthletes(
  seasonId: string,
  athleteIds: number[]
): Promise<void> {
  return deleteFirestoreAthletes({
    seasonId,
    athleteIds,
  }).then();
}
