import firebase from "../firebase";

import Option from "./Option";
import {
  Athlete,
  AthleteFilter,
  TeamsRecipe,
  TentativeHypotheticalAthlete,
  FullName,
  MeetSummary,
  PendingAthleteEdit,
  PendingHypotheticalAthleteEdit,
  SeasonSummary,
  AthleteOrSchool,
  UserAccount,
} from "./misc";
import { RaceDivision, RaceDivisionsRecipe, RaceAction } from "./race";

export enum StateType {
  SearchForSeason,
  SignIn,
  Loading,
  UserProfile,
  UserSeasons,
  CreateSeason,
  SeasonMenu,
  AthletesMenu,
  PasteAthletes,
  AddAthletes,
  AssistantsMenu,
  SeasonMeets,
  EditMeet,
  ViewMeet,
}

export type AppState =
  | SearchForSeasonState
  | SignInState
  | LoadingState
  | UserProfileState
  | UserSeasonsState
  | CreateSeasonState
  | SeasonMenuState
  | AthletesMenuState
  | PasteAthletesState
  | AddAthletesState
  | AssistantsMenuState
  | SeasonMeetsState
  | EditMeetState
  | ViewMeetState;

export type StateOf<Kind extends AppState["kind"]> = Extract<
  AppState,
  { kind: Kind }
>;

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

export interface LoadingState {
  kind: StateType.Loading;
  screenNumber: number;

  isWaitingForSignInCompletion: boolean;
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
  teamsRecipe: Option<TeamsRecipe>;
  shouldSortByLastName: boolean;
  pendingAthleteEdit: Option<PendingAthleteEdit>;
  pendingEditsBeingSyncedWithFirestore: PendingAthleteEdit[];
  deleteAthletes: Option<DeleteAthletesSubstate>;
  isSpreadsheetDataShown: boolean;
}

export interface DeleteAthletesSubstate {
  idsConsideredForDeletion: number[];
  undeletableIds: Option<number[]>;
  expirationCallback: () => void;
  isUserBeingGivenFinalWarning: boolean;
  areAthletesBeingDeleted: boolean;
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
  wereAthletesPasted: boolean;
  athletes: TentativeHypotheticalAthlete[];
  pendingAthleteEdit: Option<PendingHypotheticalAthleteEdit>;
  raceDivisions: Option<TeamsRecipe>;
  areAthletesBeingAdded: boolean;
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

  divisionsRecipe: Option<RaceDivisionsRecipe>;
  orderedRaces: Option<number[][]>;
  editedDivision: Option<RaceDivision>;
  pendingAthleteId: string;
  insertionIndex: Option<number>;
  athletes: Option<Athlete[]>;
  athleteIdWhichCouldNotBeInserted: Option<string>;
  pendingActions: RaceAction[];
}

export interface ViewMeetState {
  kind: StateType.ViewMeet;
  screenNumber: number;

  user: Option<firebase.User>;
  seasonSummary: SeasonSummary;
  meetSummary: MeetSummary;

  divisionsRecipe: Option<RaceDivisionsRecipe>;
  orderedRaces: Option<number[][]>;
  viewedDivision: Option<RaceDivision>;
  viewedResultType: AthleteOrSchool;
  athletes: Option<Athlete[]>;
}
