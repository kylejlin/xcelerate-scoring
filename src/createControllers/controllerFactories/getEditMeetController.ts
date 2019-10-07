import {
  EditMeetController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
import {
  RaceAction,
  RaceActionType,
  RaceDivisionUtil,
  Delete as RaceActionDelete,
  areRaceActionsEqual,
} from "../../types/race";
import appendAction from "../../firestore/appendAction";
import Option from "../../types/Option";
import { ScreenGuarantee } from "../../types/handle";

export default function getEditMeetController(
  { getCurrentScreen }: ScreenGuarantee<StateType.EditMeet>,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToSeasonMeetsScreen,
  }: SharedControllerMethods
): EditMeetController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    back() {
      const { state } = getCurrentScreen();
      navigateToSeasonMeetsScreen({
        user: Option.some(state.user),
        seasonSummary: state.seasonSummary,
      });
    },
    selectDivision(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const { value } = event.target as HTMLInputElement;
      const division = RaceDivisionUtil.parse(value);
      screen.update({ editedDivision: Option.some(division) });
    },
    editPendingAthleteId(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const newPendingIdStr = (event.target as HTMLInputElement).value;

      if (isPartialId(newPendingIdStr)) {
        if (newPendingIdStr.length < 5) {
          screen.update({ pendingAthleteId: newPendingIdStr });
        } else {
          screen.update({ pendingAthleteId: "" });

          const newPendingId = parseInt(newPendingIdStr, 10);

          const editedDivision = screen.state.editedDivision.expect(
            "Attempted to editPendingAthleteId before user selected a division to edit."
          );
          const divisionIndex = RaceDivisionUtil.getOrderedDivisions(
            screen.state.divisionsRecipe.expect(
              "Attempted to editPendingAthleteId before divisions recipe loaded."
            )
          ).findIndex(division =>
            RaceDivisionUtil.areDivisionsEqual(division, editedDivision)
          );
          const finisherIds = screen.state.orderedRaces.expect(
            "Attempted to editPendingAthleteId before races loaded."
          )[divisionIndex];
          const athletes = screen.state.athletes.expect(
            "Attempted to editPendingAthleteId before athletes loaded."
          );
          const targetedAthlete = athletes.find(
            athlete => athlete.id === newPendingIdStr
          );

          if (
            targetedAthlete !== undefined &&
            RaceDivisionUtil.areDivisionsEqual(
              targetedAthlete,
              editedDivision
            ) &&
            !finisherIds.includes(newPendingId)
          ) {
            const { insertionIndex, seasonSummary, meetSummary } = screen.state;
            const action: RaceAction = insertionIndex.match({
              none: () => ({
                kind: RaceActionType.InsertAtBottom,
                raceIndex: divisionIndex,
                athleteId: newPendingId,
              }),
              some: insertionIndex => ({
                kind: RaceActionType.InsertAbove,
                raceIndex: divisionIndex,
                insertionIndex,
                athleteId: newPendingId,
              }),
            });
            if (
              !screen.state.pendingActions.some(pendingAction =>
                areRaceActionsEqual(pendingAction, action)
              )
            ) {
              screen.update({
                pendingActions: screen.state.pendingActions.concat([action]),
              });
              appendAction(seasonSummary.id, meetSummary.id, action).then(
                () => {
                  screen.update(prevState => ({
                    pendingActions: prevState.pendingActions.filter(
                      pendingAction =>
                        !areRaceActionsEqual(pendingAction, action)
                    ),
                  }));
                }
              );
            }
          } else {
            screen.update({
              athleteIdWhichCouldNotBeInserted: Option.some(newPendingIdStr),
            });
          }
        }
      }
    },
    setInsertionIndex(insertionIndex: Option<number>) {
      const screen = getCurrentScreen();
      screen.update({ insertionIndex });
    },
    deleteAthlete(athleteId: number) {
      const screen = getCurrentScreen();
      const { seasonSummary, meetSummary } = screen.state;
      const editedDivision = screen.state.editedDivision.expect(
        "Attempted to deleteAthlete when user was not editing a division."
      );
      const orderedDivisions = RaceDivisionUtil.getOrderedDivisions(
        screen.state.divisionsRecipe.expect(
          "Attempted to deleteAthlete when divisions recipe has not yet loaded."
        )
      );
      const raceIndex = orderedDivisions.findIndex(division =>
        RaceDivisionUtil.areDivisionsEqual(division, editedDivision)
      );
      const action: RaceActionDelete = {
        kind: RaceActionType.Delete,
        raceIndex,
        athleteId,
      };
      if (
        !screen.state.pendingActions.some(pendingAction =>
          areRaceActionsEqual(pendingAction, action)
        )
      ) {
        screen.update({
          pendingActions: screen.state.pendingActions.concat([action]),
        });
        appendAction(seasonSummary.id, meetSummary.id, action).then(() => {
          screen.update(prevState => ({
            pendingActions: prevState.pendingActions.filter(
              pendingAction => !areRaceActionsEqual(pendingAction, action)
            ),
          }));
        });
      }
    },
    dismissInsertionErrorMessage() {
      const screen = getCurrentScreen();
      screen.update({
        athleteIdWhichCouldNotBeInserted: Option.none(),
      });
    },
  };
}

function isPartialId(string: string): boolean {
  return /^\d{0,5}$/.test(string);
}
