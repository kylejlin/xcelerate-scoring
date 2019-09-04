import React from "react";

import {
  Athlete,
  AthleteField,
  AthleteRowField,
  MeetSummary,
  SeasonSummary,
} from "./misc";

export interface ControllerCollection {
  searchForSeasonController: SearchForSeasonController;
  signInController: SignInController;
  userSeasonsController: UserSeasonsController;
  userProfileController: UserProfileController;
  createSeasonController: CreateSeasonController;
  seasonMenuController: SeasonMenuController;
  athletesMenuController: AthletesMenuController;
  pasteAthletesController: PasteAthletesController;
  correctPastedAthletesController: CorrectPastedAthletesController;
  seasonMeetsController: SeasonMeetsController;
  editMeetController: EditMeetController;
}

export interface SharedControllerMethods {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
}

export interface SearchForSeasonController {
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  editQuery(event: React.ChangeEvent): void;
  search(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
}

export interface SignInController {
  signInWithGoogle(): void;
}

export interface UserSeasonsController {
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
  navigateToCreateSeasonScreen(): void;
}

export interface UserProfileController {
  navigateToUserSeasonsScreen(): void;
  signOut(): void;
  editPendingFirstName(event: React.ChangeEvent): void;
  editPendingLastName(event: React.ChangeEvent): void;
  savePendingName(): void;
}

export interface CreateSeasonController {
  navigateToUserSeasonsScreen(): void;
  editSeasonName(event: React.ChangeEvent): void;
  editPendingMinGrade(event: React.ChangeEvent): void;
  editPendingMaxGrade(event: React.ChangeEvent): void;
  validatePendingGrades(): void;
  editNewSchoolName(event: React.ChangeEvent): void;
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
  viewSeason(seasonSummary: SeasonSummary): void;
  navigateToPasteAthletesScreen(): void;
  navigateToManuallyAddAthleteScreen(): void;
  editFilterSchool(event: React.ChangeEvent): void;
  editFilterGrade(event: React.ChangeEvent): void;
  editFilterGender(event: React.ChangeEvent): void;
  editSortPreference(event: React.ChangeEvent): void;
  selectAthleteFieldToEdit(athleteId: string, field: AthleteField): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  syncAndUnfocusEditedAthleteField(): void;
  considerAthleteForDeletion(athlete: Athlete): void;
  cancelAthleteDeletion(): void;
  confirmAthleteDeletion(): void;
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

export interface CorrectPastedAthletesController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  selectAthleteFieldToEdit(
    athleteIndex: number,
    editedRowField: AthleteRowField
  ): void;
  syncAndUnfocusEditedAthleteField(): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  addAthletes(): void;
}

export interface SeasonMeetsController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
  viewMeet(meetSummary: MeetSummary): void;
  editMeet(meetSummary: MeetSummary): void;
  editPendingMeetName(event: React.ChangeEvent): void;
  addMeet(): void;
}

export interface EditMeetController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  back(): void;
  selectDivision(event: React.ChangeEvent): void;
  focusCorrectInput(event: React.FocusEvent): void;
  appendDigitToPendingAthleteId(event: React.ChangeEvent): void;
  handlePossibleBackspace(event: React.KeyboardEvent): void;
}
