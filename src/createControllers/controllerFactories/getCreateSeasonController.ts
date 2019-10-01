import App from "../../App";

import {
  SharedControllerMethods,
  CreateSeasonController,
} from "../../types/controllers";

import { StateType, CreateSeasonState } from "../../types/states";

import createSeason from "../../firestore/createSeason";
import { UnidentifiedSeason } from "../../types/misc";

export default function getCreateSeasonController(
  app: App,
  { navigateToUserSeasonsScreen }: SharedControllerMethods
): CreateSeasonController {
  return {
    navigateToUserSeasonsScreen,
    editSeasonName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.CreateSeason) {
        const seasonName = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, seasonName });
      } else {
        throw new Error(
          "Attempted to editSeasonName when user was not on CreateSeason screen."
        );
      }
    },
    editPendingMinGrade(event: React.ChangeEvent) {
      if (app.state.kind === StateType.CreateSeason) {
        const minGrade = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, minGrade });
      } else {
        throw new Error(
          "Attempted to editPendingMinGrade when user was not on CreateSeason screen."
        );
      }
    },
    editPendingMaxGrade(event: React.ChangeEvent) {
      if (app.state.kind === StateType.CreateSeason) {
        const maxGrade = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, maxGrade });
      } else {
        throw new Error(
          "Attempted to editPendingMaxGrade when user was not on CreateSeason screen."
        );
      }
    },
    validatePendingGrades() {
      if (app.state.kind === StateType.CreateSeason) {
        const [minGrade, maxGrade] = validatePendingGrades(
          app.state.minGrade,
          app.state.maxGrade
        );
        app.setState({
          ...app.state,
          minGrade: "" + minGrade,
          maxGrade: "" + maxGrade,
        });
      } else {
        throw new Error(
          "Attempted to validatePendingGrades when user was not on CreateSeason screen."
        );
      }
    },
    editNewSchoolName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.CreateSeason) {
        const newSchoolName = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, newSchoolName });
      } else {
        throw new Error(
          "Attempted to editNewSchoolName when user was not on CreateSeason screen."
        );
      }
    },
    addNewSchool() {
      if (app.state.kind === StateType.CreateSeason) {
        const { schools, newSchoolName } = app.state;
        if (schools.includes(newSchoolName)) {
          app.setState({ ...app.state, newSchoolName: "" });
        } else {
          app.setState({
            ...app.state,
            schools: schools.concat([newSchoolName]),
            newSchoolName: "",
          });
        }
      } else {
        throw new Error(
          "Attempted to addNewSchool when user was not on CreateSeason screen."
        );
      }
    },
    deleteSchool(deletedSchool: string) {
      if (app.state.kind === StateType.CreateSeason) {
        const schools = app.state.schools.filter(
          school => school !== deletedSchool
        );
        app.setState({ ...app.state, schools });
      } else {
        throw new Error(
          "Attempted to deleteSchool when user was not on CreateSeason screen."
        );
      }
    },
    createSeason() {
      if (app.state.kind === StateType.CreateSeason) {
        const spec = getSeasonSpec(app.state);
        createSeason(app.state.user, spec).then(navigateToUserSeasonsScreen);
      } else {
        throw new Error(
          "Attempted to createSeason when user was not on CreateSeason screen."
        );
      }
    },
  };
}

function validatePendingGrades(min: string, max: string): [number, number] {
  const minOrNaN = parseInt(min, 10);
  const maxOrNaN = parseInt(max, 10);
  const bound1 = isNaN(minOrNaN) ? DEFAULT_MIN_GRADE : minOrNaN;
  const bound2 = isNaN(maxOrNaN) ? DEFAULT_MAX_GRADE : maxOrNaN;
  const minGrade = Math.min(bound1, bound2);
  const maxGrade = Math.max(bound1, bound2);
  return [minGrade, maxGrade];
}

function getSeasonSpec(state: CreateSeasonState): UnidentifiedSeason {
  const [minGrade, maxGrade] = validatePendingGrades(
    state.minGrade,
    state.maxGrade
  );
  return { name: state.seasonName, minGrade, maxGrade, schools: state.schools };
}

const DEFAULT_MIN_GRADE = 6;
const DEFAULT_MAX_GRADE = 8;
