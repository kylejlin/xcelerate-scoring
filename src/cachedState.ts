import { StateType } from "./types/states";
import { Season, MeetSummary } from "./types/misc";

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

  season: Season;
}

export interface AthletesMenuCachedState {
  kind: StateType.AthletesMenu;

  season: Season;
}

export interface PasteAthletesCachedState {
  kind: StateType.PasteAthletes;

  season: Season;
  spreadsheetData: string;
}

export interface AddAthletesCachedState {
  kind: StateType.AddAthletes;

  season: Season;
  wereAthletesPasted: boolean;
}

export interface AssistantsMenuCachedState {
  kind: StateType.AssistantsMenu;

  season: Season;
}

export interface SeasonMeetsCachedState {
  kind: StateType.SeasonMeets;

  season: Season;
  pendingMeetName: string;
}

export interface EditMeetCachedState {
  kind: StateType.EditMeet;

  season: Season;
  meetSummary: MeetSummary;
}

export interface ViewMeetCachedState {
  kind: StateType.ViewMeet;

  season: Season;
  meetSummary: MeetSummary;
}
