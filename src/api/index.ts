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
import { getStubbableApi, StubbableApi } from "./StubbableApi";

import { setHook } from "../testingHooks";

export interface Api {
  onAuthStateChanged(
    callback: (user: User | null) => void
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

  createUserAccount(userUid: string, fullName: FullName): Promise<void>;

  deleteAssistantFromSeason(
    assistantId: string,
    seasonId: string
  ): Promise<void>;

  deleteAthletes(seasonId: string, athleteIds: number[]): Promise<void>;

  doesUserAccountExist(userUid: string): Promise<boolean>;

  getMeet(seasonId: string, meetId: string): Promise<MeetSummary>;

  getSeason(seasonId: string): Promise<Season>;

  getSeasonMeets(seasonId: string): Promise<MeetSummary[]>;

  getSeasonOwnerAndAssistants(
    seasonId: string
  ): Promise<[UserAccount, UserAccount[]]>;

  getUserName(userUid: string): Promise<Option<FullName>>;

  getUserSeasonPermissions(
    userUid: string,
    seasonId: string
  ): Promise<{ isOwner: boolean; hasWriteAccess: boolean }>;

  getUserSeasons(userUid: string): Promise<Season[]>;

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

  updateUserName(userUid: string, fullName: FullName): Promise<void>;
}

export type ApiFnId = keyof Api;

export const api: StubbableApi = getStubbableApi(DEFAULT_IMPLEMENTATIONS);

export interface User {
  uid: firebase.User["uid"];
  displayName: firebase.User["displayName"];
}

setHook("api", api);
