import {
  AddAthletesController,
  SharedControllerMethods,
} from "../../types/controllers";
import { StateType } from "../../types/states";
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
import { ScreenGuarantee } from "../../types/handle";

export default function getAddAthletesController(
  { getCurrentScreen }: ScreenGuarantee<StateType.AddAthletes>,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu,
  }: SharedControllerMethods
): AddAthletesController {
  const addAthletesController = {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      const { state } = getCurrentScreen();
      navigateToAthletesMenu(
        Option.some(state.user),
        state.seasonSummary,
        Option.some(true)
      );
    },
    swapFirstAndLastNames() {
      const screen = getCurrentScreen();
      screen.update({
        athletes: screen.state.athletes.map(swapFirstAndLastName),
      });
    },
    selectAthleteFieldToEdit(
      athleteIndex: number,
      editedField: EditableAthleteField
    ) {
      const screen = getCurrentScreen();
      const pendingAthleteEdit = Option.some({
        athleteIndex,
        editedField,
        fieldValue: getHypotheticalAthleteFieldValue(
          screen.state.athletes[athleteIndex],
          editedField
        ),
      });
      screen.update({ pendingAthleteEdit });
    },
    syncAndUnfocusEditedAthleteField() {
      const screen = getCurrentScreen();
      const { athletes } = screen.state;
      const pendingAthleteEdit = screen.state.pendingAthleteEdit.expect(
        "Attempted to syncAndUnfocusEditedAthleteField when user was not editing a field."
      );
      screen.update({
        athletes: updateHypotheticalAthletesIfPendingEditIsValid(
          athletes,
          pendingAthleteEdit
        ),
        pendingAthleteEdit: Option.none(),
      });
    },
    editSelectedAthleteField(event: React.ChangeEvent) {
      const screen = getCurrentScreen();
      const fieldValue = (event.target as HTMLInputElement).value;
      const edit = screen.state.pendingAthleteEdit.expect(
        "Attempted to editSelectedAthleteField when user was not editing any field."
      );
      switch (edit.editedField) {
        case EditableAthleteField.FirstName:
        case EditableAthleteField.LastName:
          screen.update({
            pendingAthleteEdit: Option.some({ ...edit, fieldValue }),
          });
          break;
        case EditableAthleteField.Grade:
        case EditableAthleteField.Gender:
        case EditableAthleteField.School:
          screen.update({
            athletes: updateHypotheticalAthletesIfPendingEditIsValid(
              screen.state.athletes,
              {
                ...edit,
                fieldValue,
              }
            ),
            pendingAthleteEdit: Option.none<PendingHypotheticalAthleteEdit>(),
          });
          break;
      }
    },
    deleteAthlete(athleteIndex: number) {
      const screen = getCurrentScreen();
      screen.update({
        athletes: screen.state.athletes
          .slice(0, athleteIndex)
          .concat(screen.state.athletes.slice(athleteIndex + 1)),
      });
    },
    appendDefaultHypotheticalAthlete() {
      const screen = getCurrentScreen();
      screen.update({
        athletes: screen.state.athletes.concat([
          getDefaultHypotheticalAthlete(),
        ]),
      });
    },
    addAthletes() {
      const screen = getCurrentScreen();

      screen.update({ areAthletesBeingAdded: true });

      const { athletes, seasonSummary, raceDivisions } = screen.state;
      addAthletesToSeason(
        Option.all(athletes.map(finalizeTentativeAthlete)).expect(
          "Attempted to addAthletes when one or more athletes was missing a field."
        ),
        seasonSummary.id,
        raceDivisions.expect(
          "Attempted to addAthletes before state.raceDivisions has loaded."
        )
      ).then(() => {
        if (!screen.hasExpired()) {
          addAthletesController.navigateToAthletesMenu();
        }
      });
    },
  };
  return addAthletesController;
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
