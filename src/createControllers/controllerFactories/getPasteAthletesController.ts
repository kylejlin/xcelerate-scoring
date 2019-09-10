import App from "../../App";

import {
  SharedControllerMethods,
  PasteAthletesController,
} from "../../types/controllers";

import {
  StateType,
  AthletesMenuState,
  AddAthletesState,
} from "../../types/states";

import doesUserHaveWriteAccessToSeason from "../../firestore/doesUserHaveWriteAccessToSeason";

import getSeasonAthletes from "../../firestore/getSeasonAthletes";

import getSeasonRaceDivisions from "../../firestore/getSeasonRaceDivisions";

import parseSpreadsheetData from "../../parseSpreadsheetData";

import Option from "../../types/Option";

export default function getPasteAthletesController(
  app: App,
  {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
  }: SharedControllerMethods
): PasteAthletesController {
  return {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      // TODO DRY
      // This code loosely repeats seasonMenuController.navigateToAthletesMenu
      if (app.state.kind === StateType.PasteAthletes) {
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
          raceDivisions: Option.none(),
          shouldSortByLastName: false,
          pendingAthleteEdit: Option.none(),
          pendingEditsBeingSyncedWithFirestore: [],
          consideredAthleteDeletion: Option.none(),
          isSpreadsheetDataShown: false,
        });

        const seasonId = app.state.seasonSummary.id;
        doesUserHaveWriteAccessToSeason(app.state.user, seasonId).then(
          hasAccess => {
            if (hasAccess) {
              app.setState(prevState => ({
                ...prevState,
                doesUserHaveWriteAccess: true,
              }));
            }
          }
        );
        Promise.all([
          getSeasonAthletes(seasonId),
          getSeasonRaceDivisions(seasonId),
        ]).then(([athletes, filterOptions]) => {
          if (app.state.kind === StateType.AthletesMenu) {
            app.setState(prevState => ({
              ...prevState,
              athletes: Option.some(athletes),
              raceDivisions: Option.some(filterOptions),
            }));
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToAthletesMenu when user was not on PasteAthletes screen."
        );
      }
    },
    editSpreadsheetData(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const spreadsheetData = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, spreadsheetData });
      } else {
        throw new Error(
          "Attempted to editSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
    editSchool(event: React.ChangeEvent) {
      if (app.state.kind === StateType.PasteAthletes) {
        const schoolValue = (event.target as HTMLInputElement).value;
        const selectedSchool: Option<string> =
          schoolValue === "" ? Option.none() : Option.some(schoolValue);
        app.setState({ ...app.state, selectedSchool });
      } else {
        throw new Error(
          "Attempted to editSchool when user was not on PasteAthletes screen."
        );
      }
    },
    submitSpreadsheetData() {
      if (app.state.kind === StateType.PasteAthletes) {
        app
          .newScreen<AddAthletesState>({
            kind: StateType.AddAthletes,
            user: app.state.user,
            seasonSummary: app.state.seasonSummary,
            wereAthletesPasted: true,
            athletes: parseSpreadsheetData(
              app.state.spreadsheetData,
              app.state.selectedSchool
            ),
            pendingAthleteEdit: Option.none(),
            raceDivisions: Option.none(),
          })
          .update((state, updateScreen) => {
            getSeasonRaceDivisions(state.seasonSummary.id).then(
              raceDivisions => {
                updateScreen({ raceDivisions: Option.some(raceDivisions) });
              }
            );
          });
      } else {
        throw new Error(
          "Attempted to submitSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
  };
}
