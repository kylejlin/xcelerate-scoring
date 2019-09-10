import Option from "./Option";

export interface SeasonSummary {
  id: string;
  name: string;
}

export interface FullName {
  firstName: string;
  lastName: string;
}

export interface SeasonSpec {
  name: string;
  minGrade: number;
  maxGrade: number;
  schools: string[];
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

export interface RaceDivisions {
  schools: string[];
  minGrade: number;
  maxGrade: number;
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

export interface HypotheticalAthlete {
  firstName: string;
  lastName: string;
  grade: Option<number>;
  gender: Option<Gender>;
  school: Option<string>;
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
