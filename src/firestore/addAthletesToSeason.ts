import firebase from "../firebase";
import { Athlete, HypotheticalAthlete } from "../types/misc";

const db = firebase.firestore();

export default function addAthletesToSeason(
  athleteRows: HypotheticalAthlete[],
  seasonId: string
): Promise<void> {
  if (athleteRows.length > 0) {
    const seasonRef = db.collection("seasons").doc(seasonId);
    return db.runTransaction(transaction => {
      return transaction.get(seasonRef).then(seasonDoc => {
        const seasonData = seasonDoc.data();
        if (seasonData === undefined) {
          throw new Error(
            "Attempted to addAthletesToSeason on nonexistent season."
          );
        } else {
          const { athleteIdCounter } = seasonData;
          if ("number" === typeof athleteIdCounter) {
            const athletes: Athlete[] = athleteRows.map((row, i) => ({
              ...row,
              grade: row.grade.expect(
                "Attempted to addAthletesToSeason when athlete " +
                  i +
                  " did not have a grade."
              ),
              gender: row.gender.expect(
                "Attempted to addAthletesToSeason when athlete " +
                  i +
                  " did not have a gender."
              ),
              school: row.school.expect(
                "Attempted to addAthletesToSeason when athlete " +
                  i +
                  " did not have a school."
              ),
              id: zeroPadToFiveDigits(athleteIdCounter + i),
            }));
            const newAthleteIdCounter = athleteIdCounter + athleteRows.length;
            transaction.update(seasonRef, {
              athleteIdCounter: newAthleteIdCounter,
            });
            athletes.forEach(athlete => {
              const athleteRef = seasonRef
                .collection("athletes")
                .doc(athlete.id);
              transaction.set(athleteRef, athlete);
            });
          } else {
            throw new Error(
              "Invalid season document: athleteIdCounter is not a number."
            );
          }
        }
      });
    });
  } else {
    return Promise.resolve();
  }
}

function zeroPadToFiveDigits(number: number): string {
  const str = number.toString();
  if (str.length <= 5) {
    const missingDigits = 5 - str.length;
    return "0".repeat(missingDigits) + str;
  } else {
    throw new Error(
      "Attempted to zeroPadToFiveDigits a number that was " +
        str.length +
        " digits."
    );
  }
}
