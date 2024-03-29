import {
  SharedControllerMethods,
  AthletesMenuController,
} from "../../types/controllers";

import { StateType } from "../../types/states";

import {
  Gender,
  EditableAthleteField,
  PendingAthleteEdit,
} from "../../types/misc";

import getAthleteFieldValue from "../../getAthleteFieldValue";

import updateAthletesIfPendingEditIsValid from "../../updateAthletesIfPendingEditIsValid";

import areAthletesEqual from "../../areAthletesEqual";

import { api } from "../../api";

import Option from "../../types/Option";
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
        .pushScreen(StateType.PasteAthletes, {
          user: screen.state.user.expect(
            "Attempted to navigateToPasteAthletesScreen when user was not logged in."
          ),
          season: screen.state.season,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        })
        .then(screen => {
          api.getSeason(screen.state.season.id).then(season => {
            screen.update({ schools: Option.some(season.schools) });
          });
        });
    },
    navigateToManuallyAddAthletesScreen() {
      const screen = getCurrentScreen();
      screen
        .pushScreen(StateType.AddAthletes, {
          user: screen.state.user.expect(
            "Attempted to navigateToManuallyAddAthletesScreen when user was not logged in."
          ),
          season: screen.state.season,
          wereAthletesPasted: false,
          athletes: [],
          pendingAthleteEdit: Option.none(),
          raceDivisions: Option.none(),
          areAthletesBeingAdded: false,
        })
        .then(screen => {
          api.getSeason(screen.state.season.id).then(season => {
            screen.update({ raceDivisions: Option.some(season) });
          });
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
        const teams = screen.state.teamsRecipe.expect(
          "Attempted to syncAndUnfocusEditedAthleteField when teams recipe has not yet loaded."
        );
        api
          .updateAthletes(
            screen.state.season.id,
            [
              updatedAthletes.find(
                athlete => athlete.id === pendingEdit.athleteId
              )!,
            ],
            teams
          )
          .then(() => {
            screen.update({
              pendingEditsBeingSyncedWithFirestore: screen.state.pendingEditsBeingSyncedWithFirestore.filter(
                edit => edit !== pendingEdit
              ),
            });
          });
      }
    },
    showSpreadsheetData() {
      const screen = getCurrentScreen();
      screen.update({ isSpreadsheetDataShown: true });
    },
    hideSpreadsheetData() {
      const screen = getCurrentScreen();
      screen.update({ isSpreadsheetDataShown: false });
    },
    openDeleteAthletesSubscreen() {
      const screen = getCurrentScreen();
      let expirationCallback: (() => void) | null = null;
      const subscreenExpiration: Promise<void> = new Promise(resolve => {
        expirationCallback = resolve;
      });
      screen.update({
        deleteAthletes: Option.some({
          undeletableIds: Option.none(),
          idsConsideredForDeletion: [],
          expirationCallback: expirationCallback!,
          isUserBeingGivenFinalWarning: false,
          areAthletesBeingDeleted: false,
        }),
      });
      const { undeletableIds } = api.openUndeletableIdsHandleUntil(
        screen.state.season.id,
        Promise.race([subscreenExpiration, screen.expiration])
      );
      undeletableIds.onUpdate(undeletableIds => {
        screen.update(prevState => ({
          deleteAthletes: prevState.deleteAthletes.map(deleteAthletes => ({
            ...deleteAthletes,
            undeletableIds: Option.some(undeletableIds),
          })),
        }));
      });
    },
    toggleAthleteDeletion(event: React.ChangeEvent, athleteId: number) {
      const isConsideringDeletion = (event.target as HTMLInputElement).checked;
      const screen = getCurrentScreen();
      const deleteAthletesState = screen.state.deleteAthletes.expect(
        "Attempted to toggleAthleteDeletion when subscreen was not open."
      );
      screen.update({
        deleteAthletes: Option.some({
          ...deleteAthletesState,
          idsConsideredForDeletion: isConsideringDeletion
            ? deleteAthletesState.idsConsideredForDeletion.concat([athleteId])
            : deleteAthletesState.idsConsideredForDeletion.filter(
                id => id !== athleteId
              ),
        }),
      });
    },
    giveUserFinalWarning() {
      const screen = getCurrentScreen();
      screen.update({
        deleteAthletes: screen.state.deleteAthletes.map(deleteAthletes => ({
          ...deleteAthletes,
          isUserBeingGivenFinalWarning: true,
        })),
      });
    },
    abortAthleteDeletion() {
      const screen = getCurrentScreen();
      screen.update({
        deleteAthletes: screen.state.deleteAthletes.map(deleteAthletes => ({
          ...deleteAthletes,
          isUserBeingGivenFinalWarning: false,
        })),
      });
    },
    confirmAthleteDeletion() {
      const screen = getCurrentScreen();
      const seasonId = screen.state.season.id;
      const {
        idsConsideredForDeletion: idsToDelete,
      } = screen.state.deleteAthletes.expect(
        "Attempted to submitAthletesForDeletion when delete athletes subscreen was not open."
      );
      screen.update({
        deleteAthletes: screen.state.deleteAthletes.map(deleteAthletes => ({
          ...deleteAthletes,
          areAthletesBeingDeleted: true,
        })),
      });
      api.deleteAthletes(seasonId, idsToDelete).then(() => {
        screen.update({ deleteAthletes: Option.none() });
      });
    },
    closeDeleteAthletesSubscreen() {
      const screen = getCurrentScreen();
      const deleteAthletesState = screen.state.deleteAthletes.expect(
        "Attempted to closeDeleteAthletesSubscreen when subscreen was not open."
      );
      deleteAthletesState.expirationCallback();
      screen.update({
        deleteAthletes: Option.none(),
      });
    },
  };
}
