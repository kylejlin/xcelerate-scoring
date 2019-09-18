import {
  AddAthletesController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType, AddAthletesState } from "../../types/states";
import {
  EditableAthleteField,
  PendingHypotheticalAthleteEdit,
  TentativeHypotheticalAthlete,
  finalizeTentativeAthlete,
} from "../../types/misc";
import getHypotheticalAthleteFieldValue from "../../getHypotheticalAthleteFieldValue";
import updateHypotheticalAthletesIfPendingEditIsValid from "../../updateHypotheticalAthletesIfPendingEditIsValid";
import addAthletesToSeason from "../../firestore/addAthletesToSeason";
import Option from "../../types/Option";

export default function getAddAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu,
  }: SharedControllerMethods
): AddAthletesController {
  const correctPastedAthletesController = {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      const state = app.state as AddAthletesState;
      navigateToAthletesMenu(
        Option.some(state.user),
        state.seasonSummary,
        Option.some(true)
      );
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
                    athletes: updateHypotheticalAthletesIfPendingEditIsValid(
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
          case EditableAthleteField.School:
            app.setState({
              ...app.state,
              athletes: updateHypotheticalAthletesIfPendingEditIsValid(
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
    deleteAthlete(athleteIndex: number) {
      const state = app.state as AddAthletesState;
      app.setState({
        ...state,
        athletes: state.athletes
          .slice(0, athleteIndex)
          .concat(state.athletes.slice(athleteIndex + 1)),
      });
    },
    appendDefaultHypotheticalAthlete() {
      const state = app.state as AddAthletesState;
      app.setState({
        ...state,
        athletes: state.athletes.concat([getDefaultHypotheticalAthlete()]),
      });
    },
    addAthletes() {
      if (app.state.kind === StateType.AddAthletes) {
        addAthletesToSeason(
          Option.all(app.state.athletes.map(finalizeTentativeAthlete)).expect(
            "Attempted to addAthletes when one or more athletes was missing a field."
          ),
          app.state.seasonSummary.id,
          app.state.raceDivisions.expect(
            "Attempted to addAthletes before state.raceDivisions has loaded."
          )
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
  athlete: TentativeHypotheticalAthlete
): TentativeHypotheticalAthlete {
  return {
    ...athlete,
    firstName: athlete.lastName,
    lastName: athlete.firstName,
  };
}

function getDefaultHypotheticalAthlete(): TentativeHypotheticalAthlete {
  return {
    firstName: "",
    lastName: "",
    grade: Option.none(),
    gender: Option.none(),
    school: Option.none(),
  };
}
