import Option from "./Option";
import { RaceDivision, RaceDivisionUtil, RaceDivisionsRecipe } from "./race";

export interface SeasonSummary {
  id: string;
  name: string;
}

export interface FullName {
  firstName: string;
  lastName: string;
}

export interface UnidentifiedSeason {
  name: string;
  minGrade: number;
  maxGrade: number;
  schools: string[];
}

export interface Season extends UnidentifiedSeason {
  id: string;
}

export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  grade: number;
  gender: Gender;
  school: string;
}

export enum Gender {
  Male = "M",
  Female = "F",
}

export function isGender(possibleGender: string): possibleGender is Gender {
  return possibleGender === Gender.Male || possibleGender === Gender.Female;
}

export interface AthleteFilter {
  grade: Option<number>;
  gender: Option<Gender>;
  school: Option<string>;
}

export interface TeamsRecipe {
  schools: string[];
  minGrade: number;
  maxGrade: number;
}

export interface Team extends RaceDivision {
  school: string;
}

export function getOrderedTeams({
  schools,
  minGrade,
  maxGrade,
}: TeamsRecipe): Team[] {
  const orderedSchools = schools.slice().sort();
  const orderedDivisions = RaceDivisionUtil.DEPRECATED_getDivisions({
    min: minGrade,
    max: maxGrade,
  });
  return orderedSchools.flatMap(school =>
    orderedDivisions.map(division => ({ school, ...division }))
  );
}

export function areTeamsEqual(a: Team, b: Team): boolean {
  return a.grade === b.grade && a.gender === b.gender && a.school === b.school;
}

export interface PendingAthleteEdit {
  athleteId: string;
  editedField: EditableAthleteField;
  fieldValue: string;
}

export enum EditableAthleteField {
  FirstName,
  LastName,
  Grade,
  Gender,
  School,
}

export interface TentativeHypotheticalAthlete {
  firstName: string;
  lastName: string;
  grade: Option<number>;
  gender: Option<Gender>;
  school: Option<string>;
}

export interface HypotheticalAthlete {
  firstName: string;
  lastName: string;
  grade: number;
  gender: Gender;
  school: string;
}

export function finalizeTentativeAthlete(
  athlete: TentativeHypotheticalAthlete
): Option<HypotheticalAthlete> {
  const { grade, gender, school } = athlete;
  return Option.all([grade, gender, school]).map(([grade, gender, school]) => ({
    ...athlete,
    grade,
    gender,
    school,
  }));
}

// [orderedTeamIndex, firstName, lastName]
export type CompressedHypotheticalAthlete = [number, string, string];

export function compressHypotheticalAthlete(
  athlete: HypotheticalAthlete,
  teams: TeamsRecipe
): Option<CompressedHypotheticalAthlete> {
  const orderedTeams = getOrderedTeams(teams);
  const index = orderedTeams.findIndex(team => areTeamsEqual(team, athlete));
  if (index === -1) {
    return Option.none();
  } else {
    return Option.some([index, athlete.firstName, athlete.lastName]);
  }
}

// [id, orderedTeamIndex, firstName, lastName]
export type CompressedAthlete = [number, number, string, string];

export function compressAthlete(
  athlete: Athlete,
  teams: TeamsRecipe
): Option<CompressedAthlete> {
  const orderedTeams = getOrderedTeams(teams);
  const index = orderedTeams.findIndex(team => areTeamsEqual(team, athlete));
  if (index === -1) {
    return Option.none();
  } else {
    return Option.some([
      parseInt(athlete.id, 10),
      index,
      athlete.firstName,
      athlete.lastName,
    ]);
  }
}

export interface PendingHypotheticalAthleteEdit {
  athleteIndex: number;
  editedField: EditableAthleteField;
  fieldValue: string;
}

export interface PendingAthleteDeletion {
  athleteId: string;
}

export interface MeetSummary {
  name: string;
  id: string;
  timeCreated: Date;
}

export interface Meet extends MeetSummary, RaceDivisionsRecipe {
  divisionFinisherIds: number[][];
}

export enum AthleteOrSchool {
  Athlete = "Athlete",
  School = "School",
}

export interface AthleteDeletion {
  athlete: Athlete;
  isDeletable: boolean;
}

export interface UserAccount extends FullName {
  id: string;
}
