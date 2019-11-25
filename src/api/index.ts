import firebase from "../firebase";

import Option from "../types/Option";

import DEFAULT_IMPLEMENTATIONS from "./defaultImplementations";

import {
  Athlete,
  FullName,
  HypotheticalAthlete,
  Meet,
  MeetSummary,
  Season,
  SeasonSpec,
  TeamsRecipe,
  UserAccount,
} from "../types/misc";
import { RaceAction, RaceDivisionsRecipe } from "../types/race";
import { getStubbableApi } from "./StubbableApi";

export interface Api {
  onAuthStateChanged(
    callback: (user: firebase.User | null) => void
  ): firebase.Unsubscribe;

  signIntoGoogleWithRedirect(): void;

  signOut(): Promise<void>;

  addAssistantToSeason(assistantId: string, seasonId: string): Promise<void>;

  addAthletesToSeason(
    athletes: HypotheticalAthlete[],
    seasonId: string,
    teams: TeamsRecipe
  ): Promise<void>;

  addMeetToSeason(meetName: string, seasonId: string): Promise<MeetSummary>;

  appendAction(
    seasonId: string,
    meetId: string,
    action: RaceAction
  ): Promise<void>;

  createSeason(season: SeasonSpec): Promise<Season>;

  createUserAccount(user: firebase.User, fullName: FullName): Promise<void>;

  deleteAssistantFromSeason(
    assistantId: string,
    seasonId: string
  ): Promise<void>;

  deleteAthletes(seasonId: string, athleteIds: number[]): Promise<void>;

  doesUserAccountExist(user: firebase.User): Promise<boolean>;

  getMeet(seasonId: string, meetId: string): Promise<MeetSummary>;

  getSeason(seasonId: string): Promise<Season>;

  getSeasonMeets(seasonId: string): Promise<MeetSummary[]>;

  getSeasonOwnerAndAssistants(
    seasonId: string
  ): Promise<[UserAccount, UserAccount[]]>;

  getUserName(user: firebase.User): Promise<Option<FullName>>;

  getUserSeasonPermissions(
    user: firebase.User,
    seasonId: string
  ): Promise<{ isOwner: boolean; hasWriteAccess: boolean }>;

  getUserSeasons(user: firebase.User): Promise<Season[]>;

  openMeetHandleUntil(
    seasonId: string,
    meetId: string,
    waitForStopListeningSignal: Promise<void>
  ): {
    raceDivisions: Promise<RaceDivisionsRecipe>;
    meet: {
      onUpdate(listener: (meet: Meet) => void): void;
    };
  };

  openSeasonAthletesHandleUntil(
    seasonId: string,
    waitForStopListeningSignal: Promise<void>
  ): {
    teamsRecipe: Promise<TeamsRecipe>;
    athletes: {
      onUpdate(listener: (athletes: Athlete[]) => void): void;
    };
  };

  openUndeletableIdsHandleUntil(
    seasonId: string,
    waitForStopListeningSignal: Promise<void>
  ): {
    undeletableIds: {
      onUpdate(listener: (undeletableIds: number[]) => void): void;
    };
  };

  searchForSeason(query: string): Promise<Season[]>;

  searchForUser(query: string): Promise<UserAccount[]>;

  updateAthletes(
    seasonId: string,
    athletes: Athlete[],
    teams: TeamsRecipe
  ): Promise<void>;

  updateUserName(user: firebase.User, fullName: FullName): Promise<void>;
}

export type ApiFnId = keyof Api;

export const api: Api = getStubbableApi(DEFAULT_IMPLEMENTATIONS);
