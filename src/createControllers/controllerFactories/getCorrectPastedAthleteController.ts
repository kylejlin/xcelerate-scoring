import {
  AddAthletesController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType, AthletesMenuState } from "../../types/states";
import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";
import getSeasonAthletes from "../../firestore/getSeasonAthletes";
import getSeasonAthleteFilterOptions from "../../firestore/getSeasonAthleteFilterOptions";
import {
  EditableAthleteField,
  PendingHypotheticalAthleteEdit,
  HypotheticalAthlete,
} from "../../types/misc";
import getHypotheticalAthleteFieldValue from "../../getHypotheticalAthleteFieldValue";
import updateAthleteRowsIfPendingEditIsValid from "../../updateAthleteRowsIfPendingEditIsValid";
import addAthletesToSeason from "../../firestore/addAthletesToSeason";
import Option from "../../types/Option";

export default function getAddAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
  }: SharedControllerMethods
): AddAthletesController {
  const correctPastedAthletesController = {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      // TODO DRY
      // This code loosely repeats seasonMenuController.navigateToAthletesMenu
      // and pasteAthletesController.navigateToAthletesMenu
      if (app.state.kind === StateType.AddAthletes) {
        const { user } = app.state;
        app.newScreen<AthletesMenuState>({
          kind: StateType.AthletesMenu,
          user: Option.some(app.state.user),
          doesUserHaveWriteAccess: false,
          seasonSummary: app.state.seasonSummary,
          athletes: Option.none(),
          athleteFilter: {
            grade: Option.none(),
            gender: Option.none(),
            school: Option.none(),
          },
          athleteFilterOptions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          consideredAthleteDeletion: Option.none(),
          isSpreadsheetDataShown: false,
        });

        const seasonId = app.state.seasonSummary.id;
        doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
          if (hasAccess) {
            app.setState(prevState => ({
              ...prevState,
              doesUserHaveWriteAccess: true,
            }));
          }
        });
        Promise.all([
          getSeasonAthletes(seasonId),
          getSeasonAthleteFilterOptions(seasonId),
        ]).then(([athletes, filterOptions]) => {
          if (app.state.kind === StateType.AthletesMenu) {
            app.setState(prevState => ({
              ...prevState,
              athletes: Option.some(athletes),
              athleteFilterOptions: Option.some(filterOptions),
            }));
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToAthletesMenu when user was not on AddAthletesScreen screen."
        );
      }
    },
    swapFirstAndLastNames() {
      app.updateScreen(StateType.AddAthletes, state => ({
        athletes: state.athletes.map(swapFirstAndLastName),
      }));
    },
    selectAthleteFieldToEdit(
      athleteIndex: number,
      editedField: EditableAthleteField
    ) {
      if (app.state.kind === StateType.AddAthletes) {
        const pendingAthleteEdit = Option.some({
          athleteIndex,
          editedField,
          fieldValue: getHypotheticalAthleteFieldValue(
            app.state.athletes[athleteIndex],
            editedField
          ),
        });
        app.setState(prevState => ({
          ...prevState,
          pendingAthleteEdit,
        }));
      } else {
        throw new Error(
          "Attempted to selectAthleteField when user was not on AddAthletes screen."
        );
      }
    },
    syncAndUnfocusEditedAthleteField() {
      if (app.state.kind === StateType.AddAthletes) {
        const originalAthleteIndex = app.state.pendingAthleteEdit.expect(
          "Attempted to stopEditingAthleteFields when user was not editing a field."
        ).athleteIndex;
        app.setState(prevState => {
          if (prevState.kind === StateType.AddAthletes) {
            // Prevent data race
            const newState = prevState.pendingAthleteEdit.map(
              pendingAthleteEdit => {
                const isSameRowCurrentlyFocused =
                  pendingAthleteEdit.athleteIndex === originalAthleteIndex;
                if (isSameRowCurrentlyFocused) {
                  return {
                    ...prevState,
                    athletes: updateAthleteRowsIfPendingEditIsValid(
                      prevState.athletes,
                      pendingAthleteEdit
                    ),
                    pendingAthleteEdit: Option.none<
                      PendingHypotheticalAthleteEdit
                    >(),
                  };
                } else {
                  return prevState;
                }
              }
            );
            return newState.unwrapOr(prevState);
          }
          return prevState;
        });
      } else {
        throw new Error(
          "Attempted to unfocusEditedAthleteField when user was not on AddAthletes screen."
        );
      }
    },
    editSelectedAthleteField(event: React.ChangeEvent) {
      if (app.state.kind === StateType.AddAthletes) {
        const fieldValue = (event.target as HTMLInputElement).value;
        const edit = app.state.pendingAthleteEdit.expect(
          "Attempted to editSelectedAthleteField when user was not editing any field."
        );
        switch (edit.editedField) {
          case EditableAthleteField.FirstName:
          case EditableAthleteField.LastName:
            app.setState({
              ...app.state,
              pendingAthleteEdit: Option.some({ ...edit, fieldValue }),
            });
            break;
          case EditableAthleteField.Grade:
          case EditableAthleteField.Gender:
            app.setState({
              ...app.state,
              athletes: updateAthleteRowsIfPendingEditIsValid(
                app.state.athletes,
                {
                  ...edit,
                  fieldValue,
                }
              ),
              pendingAthleteEdit: Option.none<PendingHypotheticalAthleteEdit>(),
            });
            break;
        }
      } else {
        throw new Error(
          "Attempted to editSelectedAthleteField when user was not on AddAthletes screen."
        );
      }
    },
    addAthletes() {
      if (app.state.kind === StateType.AddAthletes) {
        addAthletesToSeason(
          app.state.athletes,
          app.state.seasonSummary.id
        ).then(correctPastedAthletesController.navigateToAthletesMenu);
      } else {
        throw new Error(
          "Attempted to addAthletes when user was not on AddAthletes screen."
        );
      }
    },
  };
  return correctPastedAthletesController;
}

function swapFirstAndLastName(
  athlete: HypotheticalAthlete
): HypotheticalAthlete {
  return {
    ...athlete,
    firstName: athlete.lastName,
    lastName: athlete.firstName,
  };
}
