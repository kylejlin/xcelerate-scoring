import App from "../../App";

import {
  SharedControllerMethods,
  AthletesMenuController,
} from "../../types/controllers";

import {
  StateType,
  PasteAthletesState,
  AddAthletesState,
  AthletesMenuState,
} from "../../types/states";

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

import updateAthlete from "../../firestore/updateAthlete";

import isAthleteDeletable from "../../firestore/isAthleteDeletable";

import deleteAthlete from "../../firestore/deleteAthlete";
import Option from "../../types/Option";
import getSeasonRaceDivisions from "../../firestore/getSeasonRaceDivisions";

export default function getAthletesMenuController(
  app: App,
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
      if (app.state.kind === StateType.AthletesMenu) {
        app.newScreen<PasteAthletesState>({
          kind: StateType.PasteAthletes,

          user: app.state.user.expect(
            "Attempted to navigateToPasteAthletesScreen when user was not logged in."
          ),
          seasonSummary: app.state.seasonSummary,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        });

        getSeasonSchools(app.state.seasonSummary.id).then(schools => {
          if (app.state.kind === StateType.PasteAthletes) {
            app.setState(prevState => ({
              ...prevState,
              schools: Option.some(schools),
            }));
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToPasteAthletesScreen when user was not on AthletesMenu."
        );
      }
    },
    navigateToManuallyAddAthletesScreen() {
      const state = app.state as AthletesMenuState;
      app
        .newScreen<AddAthletesState>({
          kind: StateType.AddAthletes,
          user: state.user.expect(
            "Attempted to navigateToManuallyAddAthletesScreen when user was not logged in."
          ),
          seasonSummary: state.seasonSummary,
          wereAthletesPasted: false,
          athletes: [],
          pendingAthleteEdit: Option.none(),
          raceDivisions: Option.none(),
        })
        .update((state, updateScreen) => {
          getSeasonRaceDivisions(state.seasonSummary.id).then(raceDivisions => {
            updateScreen({ raceDivisions: Option.some(raceDivisions) });
          });
        });
    },
    editFilterSchool(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AthletesMenu) {
        const { value } = event.target as HTMLInputElement;
        const school: Option<string> =
          value === "" ? Option.none() : Option.some(value);
        app.setState({
          ...app.state,
          athleteFilter: { ...app.state.athleteFilter, school },
        });
      } else {
        throw new Error(
          "Attempted to editFilterSchool when user was not on AthletesMenu."
        );
      }
    },
    editFilterGrade(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AthletesMenu) {
        const { value } = event.target as HTMLInputElement;
        const grade: Option<number> =
          value === "" ? Option.none() : Option.some(parseInt(value, 10));
        app.setState({
          ...app.state,
          athleteFilter: { ...app.state.athleteFilter, grade },
        });
      } else {
        throw new Error(
          "Attempted to editFilterGrade when user was not on AthletesMenu."
        );
      }
    },
    editFilterGender(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AthletesMenu) {
        const { value } = event.target as HTMLInputElement;
        const gender: Option<Gender> =
          value === "" ? Option.none() : Option.some(value as Gender);
        app.setState({
          ...app.state,
          athleteFilter: { ...app.state.athleteFilter, gender },
        });
      } else {
        throw new Error(
          "Attempted to editFilterGender when user was not on AthletesMenu."
        );
      }
    },
    editSortPreference(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AthletesMenu) {
        const shouldSortByLastName =
          (event.target as HTMLInputElement).value === "Last";
        app.setState({ ...app.state, shouldSortByLastName });
      } else {
        throw new Error(
          "Attempted to editSortPreference when user was not on AthleteMenu."
        );
      }
    },
    selectAthleteFieldToEditIfUserHasWriteAccess(
      athleteId: string,
      editedField: EditableAthleteField
    ) {
      if (app.state.kind === StateType.AthletesMenu) {
        if (app.state.doesUserHaveWriteAccess) {
          const athletes = app.state.athletes.expect(
            "Attempted to selectAthleteFieldToEdit when athletes have not yet loaded."
          );
          app.setState({
            ...app.state,
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
      } else {
        throw new Error(
          "Attempted to selectAthleteFieldToEdit when user was not on AthleteMenu."
        );
      }
    },
    editSelectedAthleteField(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AthletesMenu) {
        const edit = app.state.pendingAthleteEdit.expect(
          "Attempted to editSelectedAthleteField when user was not editing a field."
        );
        const fieldValue = (event.target as HTMLInputElement).value;
        app.setState({
          ...app.state,
          pendingAthleteEdit: Option.some({ ...edit, fieldValue }),
        });
      } else {
        throw new Error(
          "Attempted to editSelectedAthleteField when user was not on AthleteMenu."
        );
      }
    },
    syncAndUnfocusEditedAthleteField() {
      if (app.state.kind === StateType.AthletesMenu) {
        const athletes = app.state.athletes.expect(
          "Attempted to syncAndUnfocusEditedAthleteField when athletes have not yet loaded."
        );
        const pendingEdit = app.state.pendingAthleteEdit.expect(
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
        app.setState({
          ...app.state,
          athletes: Option.some(updatedAthletes),
          pendingAthleteEdit: Option.none() as Option<PendingAthleteEdit>,
          pendingEditsBeingSyncedWithFirestore: app.state.pendingEditsBeingSyncedWithFirestore.concat(
            shouldSyncWithFirestore ? [pendingEdit] : []
          ),
        });

        if (shouldSyncWithFirestore) {
          updateAthlete(
            app.state.seasonSummary.id,
            updatedAthletes.find(
              athlete => athlete.id === pendingEdit.athleteId
            )!
          ).then(() => {
            if (app.state.kind === StateType.AthletesMenu) {
              app.setState({
                ...app.state,
                pendingEditsBeingSyncedWithFirestore: app.state.pendingEditsBeingSyncedWithFirestore.filter(
                  edit => edit !== pendingEdit
                ),
              });
            }
          });
        }
      } else {
        throw new Error(
          "Attempted to syncAndUnfocusEditedAthleteField when user was not on AthleteMenu."
        );
      }
    },
    considerAthleteForDeletion(athlete: Athlete) {
      app
        .updateScreen(StateType.AthletesMenu, state => state)
        .update((state, updateScreen) => {
          isAthleteDeletable(state.seasonSummary.id, athlete).then(
            isDeletable => {
              updateScreen({
                consideredAthleteDeletion: Option.some({
                  athlete,
                  isDeletable,
                }),
              });
            }
          );
        });
    },
    confirmAthleteDeletion() {
      if (app.state.kind === StateType.AthletesMenu) {
        const seasonId = app.state.seasonSummary.id;
        const deletedAthlete = app.state.consideredAthleteDeletion.expect(
          "Attempted to confirmAthleteDeletion when user was not considering an athlete for deletion."
        ).athlete;
        const pendingDeletion = { athleteId: deletedAthlete.id };
        const athletes = app.state.athletes.expect(
          "Attempted to confirmAthleteDeletion when athletes have not yet loaded."
        );
        app.setState({
          ...app.state,
          pendingEditsBeingSyncedWithFirestore: app.state.pendingEditsBeingSyncedWithFirestore.concat(
            [pendingDeletion]
          ),
          athletes: Option.some(
            athletes.filter(athlete => athlete.id !== deletedAthlete.id)
          ),
          consideredAthleteDeletion: Option.none(),
        });
        deleteAthlete(seasonId, deletedAthlete).then(() => {
          if (app.state.kind === StateType.AthletesMenu) {
            app.setState({
              ...app.state,
              pendingEditsBeingSyncedWithFirestore: app.state.pendingEditsBeingSyncedWithFirestore.filter(
                change => change !== pendingDeletion
              ),
            });
          }
        });
      } else {
        throw new Error(
          "Attempted to confirmAthleteDeletion when user was not on AthleteMenu."
        );
      }
    },
    cancelAthleteDeletion() {
      if (app.state.kind === StateType.AthletesMenu) {
        app.setState({
          ...app.state,
          consideredAthleteDeletion: Option.none(),
        });
      } else {
        throw new Error(
          "Attempted to cancelAthleteDeletion when user was not on AthleteMenu."
        );
      }
    },
    showSpreadsheetData() {
      app.updateScreen(StateType.AthletesMenu, () => ({
        isSpreadsheetDataShown: true,
      }));
    },
    hideSpreadsheetData() {
      app.updateScreen(StateType.AthletesMenu, () => ({
        isSpreadsheetDataShown: false,
      }));
    },
  };
}
