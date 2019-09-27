import {
  SharedControllerMethods,
  AthletesMenuController,
} from "../../types/controllers";

import { StateType } from "../../types/states";

import getSeasonSchools from "../../firestore/getSeasonSchools";

import {
  Gender,
  EditableAthleteField,
  PendingAthleteEdit,
  Athlete,
} from "../../types/misc";

import getAthleteFieldValue from "../../getAthleteFieldValue";

import updateAthletesIfPendingEditIsValid from "../../updateAthletesIfPendingEditIsValid";

import areAthletesEqual from "../../areAthletesEqual";

import updateAthletes from "../../firestore/updateAthletes";

import isAthleteDeletable from "../../firestore/isAthleteDeletable";

import deleteAthlete from "../../firestore/deleteAthlete";
import Option from "../../types/Option";
import getSeasonRaceDivisions from "../../firestore/getSeasonRaceDivisions";
import { ScreenGuarantee } from "../../types/handle";

export default function getAthletesMenuController(
  { getCurrentScreen }: ScreenGuarantee<StateType.AthletesMenu>,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): AthletesMenuController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
    navigateToPasteAthletesScreen() {
      const screen = getCurrentScreen();
      screen
        .newScreen(StateType.PasteAthletes, {
          user: screen.state.user.expect(
            "Attempted to navigateToPasteAthletesScreen when user was not logged in."
          ),
          seasonSummary: screen.state.seasonSummary,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        })
        .then(screen => {
          getSeasonSchools(screen.state.seasonSummary.id).then(schools => {
            screen.update({ schools: Option.some(schools) });
          });
        });
    },
    navigateToManuallyAddAthletesScreen() {
      const screen = getCurrentScreen();
      screen
        .newScreen(StateType.AddAthletes, {
          user: screen.state.user.expect(
            "Attempted to navigateToManuallyAddAthletesScreen when user was not logged in."
          ),
          seasonSummary: screen.state.seasonSummary,
          wereAthletesPasted: false,
          athletes: [],
          pendingAthleteEdit: Option.none(),
          raceDivisions: Option.none(),
          areAthletesBeingAdded: false,
        })
        .then(screen => {
          getSeasonRaceDivisions(screen.state.seasonSummary.id).then(
            raceDivisions => {
              screen.update({ raceDivisions: Option.some(raceDivisions) });
            }
          );
        });
    },
    editFilterSchool(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const { value } = event.target as HTMLInputElement;
      const school: Option<string> =
        value === "" ? Option.none() : Option.some(value);
      screen.update({
        athleteFilter: { ...screen.state.athleteFilter, school },
      });
    },
    editFilterGrade(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const { value } = event.target as HTMLInputElement;
      const grade: Option<number> =
        value === "" ? Option.none() : Option.some(parseInt(value, 10));
      screen.update({
        athleteFilter: { ...screen.state.athleteFilter, grade },
      });
    },
    editFilterGender(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const { value } = event.target as HTMLInputElement;
      const gender: Option<Gender> =
        value === "" ? Option.none() : Option.some(value as Gender);
      screen.update({
        athleteFilter: { ...screen.state.athleteFilter, gender },
      });
    },
    editSortPreference(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const shouldSortByLastName =
        (event.target as HTMLInputElement).value === "Last";
      screen.update({ shouldSortByLastName });
    },
    selectAthleteFieldToEditIfUserHasWriteAccess(
      athleteId: string,
      editedField: EditableAthleteField
    ) {
      const screen = getCurrentScreen();
      if (screen.state.doesUserHaveWriteAccess) {
        const athletes = screen.state.athletes.expect(
          "Attempted to selectAthleteFieldToEdit when athletes have not yet loaded."
        );
        screen.update({
          pendingAthleteEdit: Option.some({
            athleteId,
            editedField,
            fieldValue: getAthleteFieldValue(
              athletes.find(athlete => athlete.id === athleteId)!,
              editedField
            ),
          }),
        });
      }
    },
    editSelectedAthleteField(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const edit = screen.state.pendingAthleteEdit.expect(
        "Attempted to editSelectedAthleteField when user was not editing a field."
      );
      const fieldValue = (event.target as HTMLInputElement).value;
      screen.update({
        pendingAthleteEdit: Option.some({ ...edit, fieldValue }),
      });
    },
    syncAndUnfocusEditedAthleteField() {
      const screen = getCurrentScreen();

      const athletes = screen.state.athletes.expect(
        "Attempted to syncAndUnfocusEditedAthleteField when athletes have not yet loaded."
      );
      const pendingEdit = screen.state.pendingAthleteEdit.expect(
        "Attempted to syncAndUnfocusEditedAthleteField when user was not editing a field."
      );
      const editedAthlete = athletes.find(
        athlete => athlete.id === pendingEdit.athleteId
      )!;
      const updatedAthletes = updateAthletesIfPendingEditIsValid(
        athletes,
        pendingEdit
      );
      const updatedAthlete = updatedAthletes.find(
        athlete => athlete.id === pendingEdit.athleteId
      )!;
      const shouldSyncWithFirestore = !areAthletesEqual(
        editedAthlete,
        updatedAthlete
      );
      screen.update({
        athletes: Option.some(updatedAthletes),
        pendingAthleteEdit: Option.none() as Option<PendingAthleteEdit>,
        pendingEditsBeingSyncedWithFirestore: screen.state.pendingEditsBeingSyncedWithFirestore.concat(
          shouldSyncWithFirestore ? [pendingEdit] : []
        ),
      });

      if (shouldSyncWithFirestore) {
        const teams = screen.state.raceDivisions.expect(
          "Attempted to syncAndUnfocusEditedAthleteField when teams recipe has not yet loaded."
        );
        updateAthletes(
          screen.state.seasonSummary.id,
          [
            updatedAthletes.find(
              athlete => athlete.id === pendingEdit.athleteId
            )!,
          ],
          teams
        ).then(() => {
          screen.update({
            pendingEditsBeingSyncedWithFirestore: screen.state.pendingEditsBeingSyncedWithFirestore.filter(
              edit => edit !== pendingEdit
            ),
          });
        });
      }
    },
    considerAthleteForDeletion(athlete: Athlete) {
      const screen = getCurrentScreen();
      isAthleteDeletable(screen.state.seasonSummary.id, athlete).then(
        isDeletable => {
          screen.update({
            consideredAthleteDeletion: Option.some({
              athlete,
              isDeletable,
            }),
          });
        }
      );
    },
    confirmAthleteDeletion() {
      const screen = getCurrentScreen();

      const seasonId = screen.state.seasonSummary.id;
      const deletedAthlete = screen.state.consideredAthleteDeletion.expect(
        "Attempted to confirmAthleteDeletion when user was not considering an athlete for deletion."
      ).athlete;
      const pendingDeletion = { athleteId: deletedAthlete.id };
      const athletes = screen.state.athletes.expect(
        "Attempted to confirmAthleteDeletion when athletes have not yet loaded."
      );
      screen.update({
        pendingEditsBeingSyncedWithFirestore: screen.state.pendingEditsBeingSyncedWithFirestore.concat(
          [pendingDeletion]
        ),
        athletes: Option.some(
          athletes.filter(athlete => athlete.id !== deletedAthlete.id)
        ),
        consideredAthleteDeletion: Option.none(),
      });
      deleteAthlete(seasonId, deletedAthlete).then(() => {
        screen.update({
          pendingEditsBeingSyncedWithFirestore: screen.state.pendingEditsBeingSyncedWithFirestore.filter(
            change => change !== pendingDeletion
          ),
        });
      });
    },
    cancelAthleteDeletion() {
      const screen = getCurrentScreen();
      screen.update({ consideredAthleteDeletion: Option.none() });
    },
    showSpreadsheetData() {
      const screen = getCurrentScreen();
      screen.update({ isSpreadsheetDataShown: true });
    },
    hideSpreadsheetData() {
      const screen = getCurrentScreen();
      screen.update({ isSpreadsheetDataShown: false });
    },
  };
}
