import {
  CorrectPastedAthletesController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType, AthletesMenuState } from "../../types/states";
import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";
import getSeasonAthletes from "../../firestore/getSeasonAthletes";
import getSeasonAthleteFilterOptions from "../../firestore/getSeasonAthleteFilterOptions";
import {
  AthleteRowField,
  PendingAthleteRowEdit,
  AthleteField,
} from "../../types/misc";
import getAthleteRowFieldValue from "../../getAthleteRowFieldValue";
import updateAthleteRows from "../../updateAthleteRows";
import addAthletesToSeason from "../../firestore/addAthletesToSeason";
import Option from "../../types/Option";

export default function getCorrectPastedAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): CorrectPastedAthletesController {
  const correctPastedAthletesController = {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      // TODO DRY
      // This code loosely repeats seasonMenuController.navigateToAthletesMenu
      // and pasteAthletesController.navigateToAthletesMenu
      if (app.state.kind === StateType.CorrectPastedAthletes) {
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
          athleteConsideredForDeletion: Option.none(),
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
          "Attempted to navigateToAthletesMenu when user was not on CorrectPastedAthletesScreen screen."
        );
      }
    },
    selectAthleteFieldToEdit(
      athleteIndex: number,
      editedField: AthleteRowField
    ) {
      if (app.state.kind === StateType.CorrectPastedAthletes) {
        const pendingAthleteEdit = Option.some({
          athleteIndex,
          editedField,
          fieldValue: getAthleteRowFieldValue(
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
          "Attempted to selectAthleteField when user was not on CorrectPastedAthletes screen."
        );
      }
    },
    syncAndUnfocusEditedAthleteField() {
      if (app.state.kind === StateType.CorrectPastedAthletes) {
        const originalAthleteIndex = app.state.pendingAthleteEdit.expect(
          "Attempted to stopEditingAthleteFields when user was not editing a field."
        ).athleteIndex;
        app.setState(prevState => {
          if (prevState.kind === StateType.CorrectPastedAthletes) {
            // Prevent data race
            const newState = prevState.pendingAthleteEdit.map(
              pendingAthleteEdit => {
                const isSameRowCurrentlyFocused =
                  pendingAthleteEdit.athleteIndex === originalAthleteIndex;
                if (isSameRowCurrentlyFocused) {
                  return {
                    ...prevState,
                    athletes: updateAthleteRows(
                      prevState.athletes,
                      pendingAthleteEdit
                    ),
                    pendingAthleteEdit: Option.none() as Option<
                      PendingAthleteRowEdit
                    >,
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
          "Attempted to unfocusEditedAthleteField when user was not on CorrectPastedAthletes screen."
        );
      }
    },
    editSelectedAthleteField(event: React.ChangeEvent) {
      if (app.state.kind === StateType.CorrectPastedAthletes) {
        const fieldValue = (event.target as HTMLInputElement).value;
        const edit = app.state.pendingAthleteEdit.expect(
          "Attempted to editSelectedAthleteField when user was not editing any field."
        );
        switch (edit.editedField) {
          case AthleteField.FirstName:
          case AthleteField.LastName:
            app.setState({
              ...app.state,
              pendingAthleteEdit: Option.some({ ...edit, fieldValue }),
            });
            break;
          case AthleteField.Grade:
          case AthleteField.Gender:
            app.setState({
              ...app.state,
              athletes: updateAthleteRows(app.state.athletes, {
                ...edit,
                fieldValue,
              }),
              pendingAthleteEdit: Option.none() as Option<
                PendingAthleteRowEdit
              >,
            });
            break;
        }
      } else {
        throw new Error(
          "Attempted to editSelectedAthleteField when user was not on CorrectPastedAthletes screen."
        );
      }
    },
    addAthletes() {
      if (app.state.kind === StateType.CorrectPastedAthletes) {
        addAthletesToSeason(
          app.state.athletes,
          app.state.selectedSchool,
          app.state.seasonSummary.id
        ).then(correctPastedAthletesController.navigateToAthletesMenu);
      } else {
        throw new Error(
          "Attempted to addAthletes when user was not on CorrectPastedAthletes screen."
        );
      }
    },
  };
  return correctPastedAthletesController;
}
