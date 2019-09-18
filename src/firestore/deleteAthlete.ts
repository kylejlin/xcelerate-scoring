import firebase from "../firebase";
import { Athlete } from "../types/misc";

const functions = firebase.functions();
const deleteAthletes = functions.httpsCallable("deleteAthletes");

export default function deleteAthlete(
  seasonId: string,
  athlete: Athlete
): Promise<void> {
  console.log("deleteAthlete", seasonId, athlete.id, parseInt(athlete.id, 10));
  return deleteAthletes({
    seasonId,
    athleteIds: [parseInt(athlete.id, 10)],
  }).then();
}
