import firebase from "../firebase";

import Option from "./Option";
import {
  Athlete,
  AthleteFilter,
  AthleteFilterOptions,
  HypotheticalAthlete,
  FullName,
  MeetSummary,
  PendingAthleteEdit,
  PendingAthleteDeletion,
  PendingHypotheticalAthleteEdit,
  SeasonSummary,
  AthleteOrSchool,
  AthleteDeletion,
  UserAccount,
} from "./misc";
import { Races, RaceDivision } from "./race";

export enum StateType {
  SearchForSeason,
  SignIn,
  WaitForSignInCompletion,
  UserProfile,
  UserSeasons,
  CreateSeason,
  SeasonMenu,
  AthletesMenu,
  PasteAthletes,
  AddAthletes,
  ManuallyAddAthlete,
  AssistantsMenu,
  SeasonMeets,
  EditMeet,
  ViewMeet,
}

export type AppState =
  | SearchForSeasonState
  | SignInState
  | WaitForSignInCompletionState
  | UserProfileState
  | UserSeasonsState
  | CreateSeasonState
  | SeasonMenuState
  | AthletesMenuState
  | PasteAthletesState
  | AddAthletesState
  | ManuallyAddAthleteState
  | AssistantsMenuState
  | SeasonMeetsState
  | EditMeetState
  | ViewMeetState;

export interface SearchForSeasonState {
  kind: StateType.SearchForSeason;
  screenNumber: number;

  user: Option<firebase.User>;
  query: string;
  isLoading: boolean;
  seasons: Option<SeasonSummary[]>;
}

export interface SignInState {
  kind: StateType.SignIn;
  screenNumber: number;
}

export interface WaitForSignInCompletionState {
  kind: StateType.WaitForSignInCompletion;
  screenNumber: number;
}

export interface UserProfileState {
  kind: StateType.UserProfile;
  screenNumber: number;

  user: firebase.User;
  fullName: Option<FullName>;
}

export interface UserSeasonsState {
  kind: StateType.UserSeasons;
  screenNumber: number;

  user: firebase.User;
  seasons: Option<SeasonSummary[]>;
}

export interface CreateSeasonState {
  kind: StateType.CreateSeason;
  screenNumber: number;

  user: firebase.User;
  seasonName: string;
  minGrade: string;
  maxGrade: string;
  schools: string[];
  newSchoolName: string;
}

export interface SeasonMenuState {
  kind: StateType.SeasonMenu;
  screenNumber: number;

  user: Option<firebase.User>;
  seasonSummary: SeasonSummary;
}

export interface AthletesMenuState {
  kind: StateType.AthletesMenu;
  screenNumber: number;

  user: Option<firebase.User>;
  doesUserHaveWriteAccess: boolean;
  seasonSummary: SeasonSummary;
  athletes: Option<Athlete[]>;
  athleteFilter: AthleteFilter;
  athleteFilterOptions: Option<AthleteFilterOptions>;
  shouldSortByLastName: boolean;
  pendingAthleteEdit: Option<PendingAthleteEdit>;
  pendingEditsBeingSyncedWithFirestore: (
    | PendingAthleteEdit
    | PendingAthleteDeletion)[];
  consideredAthleteDeletion: Option<AthleteDeletion>;
  isSpreadsheetDataShown: boolean;
}

export interface PasteAthletesState {
  kind: StateType.PasteAthletes;
  screenNumber: number;

  user: firebase.User;
  seasonSummary: SeasonSummary;
  spreadsheetData: string;
  schools: Option<string[]>;
  selectedSchool: Option<string>;
}

export interface AddAthletesState {
  kind: StateType.AddAthletes;
  screenNumber: number;

  user: firebase.User;
  seasonSummary: SeasonSummary;
  athletes: HypotheticalAthlete[];
  pendingAthleteEdit: Option<PendingHypotheticalAthleteEdit>;
  gradeBounds: Option<{ min: number; max: number }>;
}

export interface ManuallyAddAthleteState {
  kind: StateType.ManuallyAddAthlete;
  screenNumber: number;
}

export interface AssistantsMenuState {
  kind: StateType.AssistantsMenu;
  screenNumber: number;

  user: Option<firebase.User>;
  doesUserHaveWriteAccess: boolean;
  isUserOwner: boolean;
  seasonSummary: SeasonSummary;
  owner: Option<UserAccount>;
  assistants: Option<UserAccount[]>;
  assistantQuery: string;
  queryResults: Option<UserAccount[]>;
  areQueryResultsLoading: boolean;
}

export interface SeasonMeetsState {
  kind: StateType.SeasonMeets;
  screenNumber: number;

  user: Option<firebase.User>;
  doesUserHaveWriteAccess: boolean;
  seasonSummary: SeasonSummary;
  meets: Option<MeetSummary[]>;
  gradeBounds: Option<{ min: number; max: number }>;
  pendingMeetName: string;
}

export interface EditMeetState {
  kind: StateType.EditMeet;
  screenNumber: number;

  user: firebase.User;
  seasonSummary: SeasonSummary;
  meetSummary: MeetSummary;

  races: Option<Races>;
  editedDivision: Option<RaceDivision>;
  pendingAthleteId: string;
  insertionIndex: Option<number>;
  athletes: Option<Athlete[]>;
  athleteIdWhichCouldNotBeInserted: Option<string>;
}

export interface ViewMeetState {
  kind: StateType.ViewMeet;
  screenNumber: number;

  user: Option<firebase.User>;
  seasonSummary: SeasonSummary;
  meetSummary: MeetSummary;

  races: Option<Races>;
  viewedDivision: Option<RaceDivision>;
  viewedResultType: AthleteOrSchool;
  athletes: Option<Athlete[]>;
}
