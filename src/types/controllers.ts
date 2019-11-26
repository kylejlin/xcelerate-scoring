import React from "react";
import { User } from "../api";
import { EditableAthleteField, MeetSummary, Season, UserAccount } from "./misc";
import Option from "./Option";

export interface ControllerCollection {
  shared: SharedControllerMethods;

  searchForSeasonController: SearchForSeasonController;
  signInController: SignInController;
  userSeasonsController: UserSeasonsController;
  userProfileController: UserProfileController;
  createSeasonController: CreateSeasonController;
  seasonMenuController: SeasonMenuController;
  athletesMenuController: AthletesMenuController;
  pasteAthletesController: PasteAthletesController;
  addAthletesController: AddAthletesController;
  seasonMeetsController: SeasonMeetsController;
  editMeetController: EditMeetController;
  viewMeetController: ViewMeetController;
  assistantsMenuController: AssistantsMenuController;
}

export interface SharedControllerMethods {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(season: Season): void;
  navigateToAthletesMenu(
    user: Option<User>,
    season: Season,
    userHasAccessToSeason: Option<boolean>
  ): void;
  navigateToSeasonMeetsScreen({
    user,
    season,
  }: {
    user: Option<User>;
    season: Season;
  }): void;
}

export interface SearchForSeasonController {
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  editQuery(event: React.ChangeEvent<HTMLInputElement>): void;
  search(): void;
  viewSeason(season: Season): void;
}

export interface SignInController {
  signInWithGoogle(): void;
}

export interface UserSeasonsController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(season: Season): void;
  navigateToCreateSeasonScreen(): void;
}

export interface UserProfileController {
  navigateToUserSeasonsScreen(): void;
  signOut(): void;
  editPendingFirstName(event: React.ChangeEvent<HTMLInputElement>): void;
  editPendingLastName(event: React.ChangeEvent<HTMLInputElement>): void;
  savePendingName(): void;
}

export interface CreateSeasonController {
  navigateToUserSeasonsScreen(): void;
  editSeasonName(event: React.ChangeEvent<HTMLInputElement>): void;
  editPendingMinGrade(event: React.ChangeEvent<HTMLInputElement>): void;
  editPendingMaxGrade(event: React.ChangeEvent<HTMLInputElement>): void;
  validatePendingGrades(): void;
  editNewSchoolName(event: React.ChangeEvent<HTMLInputElement>): void;
  addNewSchool(): void;
  deleteSchool(school: string): void;
  createSeason(): void;
}

export interface SeasonMenuController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  navigateToAssistantsMenu(): void;
  navigateToSeasonMeetsScreen(): void;
}

export interface AthletesMenuController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(season: Season): void;
  navigateToPasteAthletesScreen(): void;
  navigateToManuallyAddAthletesScreen(): void;

  editFilterSchool(event: React.ChangeEvent): void;
  editFilterGrade(event: React.ChangeEvent): void;
  editFilterGender(event: React.ChangeEvent): void;
  editSortPreference(event: React.ChangeEvent): void;
  selectAthleteFieldToEditIfUserHasWriteAccess(
    athleteId: string,
    field: EditableAthleteField
  ): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  syncAndUnfocusEditedAthleteField(): void;

  showSpreadsheetData(): void;
  hideSpreadsheetData(): void;

  openDeleteAthletesSubscreen(): void;
  toggleAthleteDeletion(event: React.ChangeEvent, athleteId: number): void;
  giveUserFinalWarning(): void;
  abortAthleteDeletion(): void;
  confirmAthleteDeletion(): void;
  closeDeleteAthletesSubscreen(): void;
}

export interface PasteAthletesController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  editSpreadsheetData(event: React.ChangeEvent): void;
  editSchool(event: React.ChangeEvent): void;
  submitSpreadsheetData(): void;
}

export interface AddAthletesController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  swapFirstAndLastNames(): void;
  selectAthleteFieldToEdit(
    athleteIndex: number,
    editedRowField: EditableAthleteField
  ): void;
  syncAndUnfocusEditedAthleteField(): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  deleteAthlete(athleteIndex: number): void;
  appendDefaultHypotheticalAthlete(): void;
  addAthletes(): void;
}

export interface AssistantsMenuController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  back(): void;
  deleteAssistant(assistantId: string): void;
  editAssistantQuery(event: React.ChangeEvent<HTMLInputElement>): void;
  search(): void;
  addAssistant(assistant: UserAccount): void;
}

export interface SeasonMeetsController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(season: Season): void;
  viewMeet(meetSummary: MeetSummary): void;
  editMeet(meetSummary: MeetSummary): void;
  editPendingMeetName(event: React.ChangeEvent): void;
  addMeet(): void;
}

export interface EditMeetController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  back(): void;
  selectDivision(event: React.ChangeEvent): void;
  editPendingAthleteId(event: React.ChangeEvent): void;
  setInsertionIndex(insertionIndex: Option<number>): void;
  deleteAthlete(athleteId: number): void;
  dismissInsertionErrorMessage(): void;
}

export interface ViewMeetController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  back(): void;
  selectDivision(event: React.ChangeEvent<HTMLSelectElement>): void;
  selectResultType(event: React.ChangeEvent<HTMLSelectElement>): void;
}
