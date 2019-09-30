import { StateType } from "./types/states";
import { SeasonSummary, MeetSummary } from "./types/misc";

export type CachedState =
  | SearchForSeasonCachedState
  | SignInCachedState
  | WaitForSignInCompletionCachedState
  | UserProfileCachedState
  | UserSeasonsCachedState
  | CreateSeasonCachedState
  | SeasonMenuCachedState
  | AthletesMenuCachedState
  | PasteAthletesCachedState
  | AddAthletesCachedState
  | AssistantsMenuCachedState
  | SeasonMeetsCachedState
  | EditMeetCachedState
  | ViewMeetCachedState;

export interface SearchForSeasonCachedState {
  kind: StateType.SearchForSeason;
}

export interface SignInCachedState {
  kind: StateType.SignIn;
}

export interface WaitForSignInCompletionCachedState {
  kind: StateType.Loading;
}

export interface UserProfileCachedState {
  kind: StateType.UserProfile;
}

export interface UserSeasonsCachedState {
  kind: StateType.UserSeasons;
}

export interface CreateSeasonCachedState {
  kind: StateType.CreateSeason;

  seasonName: string;
  minGrade: string;
  maxGrade: string;
  schools: string[];
  newSchoolName: string;
}

export interface SeasonMenuCachedState {
  kind: StateType.SeasonMenu;

  seasonSummary: SeasonSummary;
}

export interface AthletesMenuCachedState {
  kind: StateType.AthletesMenu;

  seasonSummary: SeasonSummary;
}

export interface PasteAthletesCachedState {
  kind: StateType.PasteAthletes;

  seasonSummary: SeasonSummary;
  spreadsheetData: string;
}

export interface AddAthletesCachedState {
  kind: StateType.AddAthletes;

  seasonSummary: SeasonSummary;
  wereAthletesPasted: boolean;
}

export interface AssistantsMenuCachedState {
  kind: StateType.AssistantsMenu;

  seasonSummary: SeasonSummary;
}

export interface SeasonMeetsCachedState {
  kind: StateType.SeasonMeets;

  seasonSummary: SeasonSummary;
  pendingMeetName: string;
}

export interface EditMeetCachedState {
  kind: StateType.EditMeet;

  seasonSummary: SeasonSummary;
  meetSummary: MeetSummary;
}

export interface ViewMeetCachedState {
  kind: StateType.ViewMeet;

  seasonSummary: SeasonSummary;
  meetSummary: MeetSummary;
}
