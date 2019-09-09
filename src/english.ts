import { Gender } from "./types/misc";
import { RaceDivision } from "./types/race";

export function getGenderSubjectPronoun(gender: Gender): string {
  switch (gender) {
    case Gender.Male:
      return "he";
    case Gender.Female:
      return "she";
  }
}

export function describeDivisionInEnglish(division: RaceDivision): string {
  const grade = addAppropriateOrdinalSuffix(division.grade);
  const gender = childWithGender(division.gender);
  return grade + " grade " + gender;
}

export function addAppropriateOrdinalSuffix(grade: number): string {
  switch (grade % 10) {
    case 1:
      return grade + "st";
    case 2:
      return grade + "nd";
    case 3:
      return grade + "rd";
    default:
      return grade + "th";
  }
}

export function childWithGender(gender: Gender): string {
  switch (gender) {
    case Gender.Male:
      return "boy";
    case Gender.Female:
      return "girl";
  }
}
