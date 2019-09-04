import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType } from "../../types/states";
import { RaceAction, RaceActionKind } from "../../types/race";
import appendAction from "../../firestore/appendAction";

export default function getEditMeetController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
  }: SharedControllerMethods
): EditMeetController {
  const editMeetController: EditMeetController = {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      throw new Error("TODO back");
    },
    focusCorrectInput(event?: React.FocusEvent) {
      if (app.state.kind === StateType.EditMeet) {
        if (event) {
          event.preventDefault();
        }

        const focused =
          app.editMeetInputRefs[app.state.pendingAthleteId.length];
        if (focused) {
          focused.current!.focus();
        }
      } else {
        throw new Error(
          "Attempted to focusIput when user was not on EditMeet screen."
        );
      }
    },
    handlePossibleBackspace(event: React.KeyboardEvent) {
      if (event.key === "Backspace" || event.key === "Delete") {
        app
          .updateScreen(StateType.EditMeet, prevState => ({
            pendingAthleteId: prevState.pendingAthleteId.slice(0, -1),
          }))
          .update(state => {
            const newlyFocusedInput =
              app.editMeetInputRefs[state.pendingAthleteId.length];
            setTimeout(function focusCorrectInput() {
              newlyFocusedInput.current!.focus();
            });
          });
      }
    },
    appendDigitToPendingAthleteId(event: React.ChangeEvent) {
      if (app.state.kind === StateType.EditMeet) {
        const digit = parseInt((event.target as HTMLInputElement).value, 10);
        if (isDigit(digit)) {
          app
            .updateScreen(StateType.EditMeet, prevState => ({
              pendingAthleteId: prevState.pendingAthleteId + digit,
            }))
            .update((state, updateScreen) => {
              if (state.pendingAthleteId.length === 5) {
                updateScreen({
                  pendingAthleteId: "",
                });

                const action: RaceAction = state.insertionIndex.match({
                  none: () => ({
                    kind: RaceActionKind.InsertAtEnd,
                    athleteId: state.pendingAthleteId,
                  }),
                  some: insertionIndex => ({
                    kind: RaceActionKind.InsertAbove,
                    insertionIndex,
                    athleteId: state.pendingAthleteId,
                  }),
                });
                const editedDivision = state.editedDivision.expect(
                  "Attempted to appendDigitToPendingAthleteId when user has not selected division to edit."
                );
                appendAction(
                  state.seasonSummary.id,
                  state.meetSummary.id,
                  editedDivision,
                  action
                );
              } else {
                setTimeout(function focusCorrectInput() {
                  editMeetController.focusCorrectInput(undefined);
                });
              }
            });
        }
      } else {
        throw new Error(
          "Attempted to appendDigitToPendingAthleteId when user was not on EditMeet screen."
        );
      }
    },
  };
  return editMeetController;
}

function isDigit(number: number): boolean {
  return number === ~~number && 0 <= number && number <= 9;
}
