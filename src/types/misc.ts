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

export interface AthleteFilterOptions {
  schools: string[];
  minGrade: number;
  maxGrade: number;
}

export interface PendingAthleteEdit {
  athleteId: string;
  editedField: AthleteField;
  fieldValue: string;
}

export enum AthleteField {
  FirstName,
  LastName,
  Grade,
  Gender,
  School,
}

export interface AthleteRow {
  firstName: string;
  lastName: string;
  grade: Option<number>;
  gender: Option<Gender>;
}

export interface PendingAthleteRowEdit {
  athleteIndex: number;
  editedField: AthleteRowField;
  fieldValue: string;
}

export type AthleteRowField =
  | AthleteField.FirstName
  | AthleteField.LastName
  | AthleteField.Grade
  | AthleteField.Gender;

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
