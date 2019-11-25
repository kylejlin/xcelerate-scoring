import { Api } from "..";

import addAssistantToSeason from "./addAssistantToSeason";
import addAthletesToSeason from "./addAthletesToSeason";
import addMeetToSeason from "./addMeetToSeason";
import appendAction from "./appendAction";
import createSeason from "./createSeason";
import createUserAccount from "./createUserAccount";
import deleteAssistantFromSeason from "./deleteAssistantFromSeason";
import deleteAthletes from "./deleteAthletes";
import doesUserAccountExist from "./doesUserAccountExist";
import getMeet from "./getMeet";
import getSeason from "./getSeason";
import getSeasonMeets from "./getSeasonMeets";
import getSeasonOwnerAndAssistants from "./getSeasonOwnerAndAssistants";
import getUserName from "./getUserName";
import getUserSeasonPermissions from "./getUserSeasonPermissions";
import getUserSeasons from "./getUserSeasons";
import onAuthStateChanged from "./onAuthStateChanged";
import openMeetHandleUntil from "./openMeetHandleUntil";
import openSeasonAthletesHandleUntil from "./openSeasonAthletesHandleUntil";
import openUndeletableIdsHandleUntil from "./openUndeletableIdsHandleUntil";
import searchForSeason from "./searchForSeason";
import searchForUser from "./searchForUser";
import signIntoGoogleWithRedirect from "./signIntoGoogleWithRedirect";
import signOut from "./signOut";
import updateAthletes from "./updateAthletes";
import updateUserName from "./updateUserName";

const api: Api = {
  addAssistantToSeason,
  addAthletesToSeason,
  addMeetToSeason,
  appendAction,
  createSeason,
  createUserAccount,
  deleteAssistantFromSeason,
  deleteAthletes,
  doesUserAccountExist,
  getMeet,
  getSeason,
  getSeasonMeets,
  getSeasonOwnerAndAssistants,
  getUserName,
  getUserSeasonPermissions,
  getUserSeasons,
  onAuthStateChanged,
  openMeetHandleUntil,
  openSeasonAthletesHandleUntil,
  openUndeletableIdsHandleUntil,
  searchForSeason,
  searchForUser,
  signIntoGoogleWithRedirect,
  signOut,
  updateAthletes,
  updateUserName,
};

export default api;
