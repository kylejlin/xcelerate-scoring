import { User } from "../api";

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
  Season,
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

  user: Option<User>;
  query: string;
  isLoading: boolean;
  seasons: Option<Season[]>;
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

  user: User;
  fullName: Option<FullName>;
  doesUserExist: boolean;
}

export interface UserSeasonsState {
  kind: StateType.UserSeasons;
  screenNumber: number;

  user: User;
  seasons: Option<Season[]>;
}

export interface CreateSeasonState {
  kind: StateType.CreateSeason;
  screenNumber: number;

  user: User;
  seasonName: string;
  minGrade: string;
  maxGrade: string;
  schools: string[];
  newSchoolName: string;
  isCreatingSeason: boolean;
}

export interface SeasonMenuState {
  kind: StateType.SeasonMenu;
  screenNumber: number;

  user: Option<User>;
  season: Season;
}

export interface AthletesMenuState {
  kind: StateType.AthletesMenu;
  screenNumber: number;

  user: Option<User>;
  doesUserHaveWriteAccess: boolean;
  season: Season;
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

  user: User;
  season: Season;
  spreadsheetData: string;
  schools: Option<string[]>;
  selectedSchool: Option<string>;
}

export interface AddAthletesState {
  kind: StateType.AddAthletes;
  screenNumber: number;

  user: User;
  season: Season;
  wereAthletesPasted: boolean;
  athletes: TentativeHypotheticalAthlete[];
  pendingAthleteEdit: Option<PendingHypotheticalAthleteEdit>;
  raceDivisions: Option<TeamsRecipe>;
  areAthletesBeingAdded: boolean;
}

export interface AssistantsMenuState {
  kind: StateType.AssistantsMenu;
  screenNumber: number;

  user: Option<User>;
  doesUserHaveWriteAccess: boolean;
  isUserOwner: boolean;
  season: Season;
  owner: Option<UserAccount>;
  assistants: Option<UserAccount[]>;
  assistantQuery: string;
  queryResults: Option<UserAccount[]>;
  areQueryResultsLoading: boolean;
}

export interface SeasonMeetsState {
  kind: StateType.SeasonMeets;
  screenNumber: number;

  user: Option<User>;
  doesUserHaveWriteAccess: boolean;
  season: Season;
  meets: Option<MeetSummary[]>;
  gradeBounds: Option<{ min: number; max: number }>;
  pendingMeetName: string;
}

export interface EditMeetState {
  kind: StateType.EditMeet;
  screenNumber: number;

  user: User;
  season: Season;
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

  user: Option<User>;
  season: Season;
  meetSummary: MeetSummary;

  divisionsRecipe: Option<RaceDivisionsRecipe>;
  orderedRaces: Option<number[][]>;
  viewedDivision: Option<RaceDivision>;
  viewedResultType: AthleteOrSchool;
  athletes: Option<Athlete[]>;
}
