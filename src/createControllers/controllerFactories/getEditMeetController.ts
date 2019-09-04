import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import App from "../../App";
import { StateType } from "../../types/states";
import { RaceAction, RaceActionKind, RaceDivisionUtil } from "../../types/race";
import appendAction from "../../firestore/appendAction";
import Option from "../../types/Option";

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
  function focusCorrectInput(event?: React.FocusEvent) {
    if (app.state.kind === StateType.EditMeet) {
      if (event) {
        event.preventDefault();
      }

      const focused = app.editMeetInputRefs[app.state.pendingAthleteId.length];
      if (focused) {
        focused.current!.focus();
      }
    } else {
      throw new Error(
        "Attempted to focusIput when user was not on EditMeet screen."
      );
    }
  }

  return {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      throw new Error("TODO back");
    },
    selectDivision(event: React.ChangeEvent) {
      const { value } = event.target as HTMLInputElement;
      const division = RaceDivisionUtil.parse(value);
      app.updateScreen(StateType.EditMeet, () => ({
        editedDivision: Option.some(division),
      }));
    },
    focusCorrectInput(event: React.FocusEvent) {
      focusCorrectInput(event);
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
                  focusCorrectInput();
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
}

function isDigit(number: number): boolean {
  return number === ~~number && 0 <= number && number <= 9;
}
