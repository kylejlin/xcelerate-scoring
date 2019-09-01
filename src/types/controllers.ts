import firebase from "../firebase";
import React from "react";

import {
  Athlete,
  AthleteField,
  AthleteRowField,
  Gender,
  MeetSummary,
  PendingAthleteEdit,
  PendingAthleteRowEdit,
  SeasonSpec,
  SeasonSummary,
} from "./misc";
import {
  SearchForSeasonState,
  StateType,
  UserProfileState,
  CreateSeasonState,
  SeasonMenuState,
  AthletesMenuState,
  PasteAthletesState,
  CorrectPastedAthletesState,
  SeasonMeetsState,
} from "./states";
import addAthletesToSeason from "../firestore/addAthletesToSeason";
import addMeetToSeason from "../firestore/addMeetToSeason";
import areAthletesEqual from "../areAthletesEqual";
import createSeason from "../firestore/createSeason";
import createUserAccount from "../firestore/createUserAccount";
import deleteAthlete from "../firestore/deleteAthlete";
import doesUserHaveWriteAccessToSeason from "../firestore/doesUserHaveWriteAccessToSeason";
import getAthleteFieldValue from "../getAthleteFieldValue";
import getAthleteRowFieldValue from "../getAthleteRowFieldValue";
import getSeasonAthletes from "../firestore/getSeasonAthletes";
import getSeasonAthleteFilterOptions from "../firestore/getSeasonAthleteFilterOptions";
import getSeasonGradeBounds from "../firestore/getSeasonGradeBounds";
import getSeasonMeets from "../firestore/getSeasonMeets";
import getSeasonSchools from "../firestore/getSeasonSchools";
import getUserName from "../firestore/getUserName";
import getUserSeasons from "../firestore/getUserSeasons";
import isAthleteDeletable from "../firestore/isAthleteDeletable";
import parseSpreadsheetData from "../parseSpreadsheetData";
import searchForSeason from "../firestore/searchForSeason";
import updateAthlete from "../firestore/updateAthlete";
import updateAthletes from "../updateAthletes";
import updateAthleteRows from "../updateAthleteRows";
import updateUserName from "../firestore/updateUserName";
import LocalStorageKeys from "./LocalStorageKeys";
import Option from "./Option";

import App from "../App";

export interface ControllerCollection {
  searchForSeasonController: SearchForSeasonController;
  signInController: SignInController;
  userSeasonsController: UserSeasonsController;
  userProfileController: UserProfileController;
  createSeasonController: CreateSeasonController;
  seasonMenuController: SeasonMenuController;
  athletesMenuController: AthletesMenuController;
  pasteAthletesController: PasteAthletesController;
  correctPastedAthletesController: CorrectPastedAthletesController;
  seasonMeetsController: SeasonMeetsController;
}

export interface SearchForSeasonController {
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  editQuery(event: React.ChangeEvent): void;
  search(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
}

export interface SignInController {
  signInWithGoogle(): void;
}

export interface UserSeasonsController {
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
  navigateToCreateSeasonScreen(): void;
}

export interface UserProfileController {
  navigateToUserSeasonsScreen(): void;
  signOut(): void;
  editPendingFirstName(event: React.ChangeEvent): void;
  editPendingLastName(event: React.ChangeEvent): void;
  savePendingName(): void;
}

export interface CreateSeasonController {
  navigateToUserSeasonsScreen(): void;
  editSeasonName(event: React.ChangeEvent): void;
  editPendingMinGrade(event: React.ChangeEvent): void;
  editPendingMaxGrade(event: React.ChangeEvent): void;
  validatePendingGrades(): void;
  editNewSchoolName(event: React.ChangeEvent): void;
  addNewSchool(): void;
  deleteSchool(school: string): void;
  createSeason(): void;
}

export interface SeasonMenuController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  navigateToAssistantsMenu(): void;
  navigateToSeasonMeetsScreen(): void;
}

export interface AthletesMenuController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
  navigateToPasteAthletesScreen(): void;
  navigateToManuallyAddAthleteScreen(): void;
  editFilterSchool(event: React.ChangeEvent): void;
  editFilterGrade(event: React.ChangeEvent): void;
  editFilterGender(event: React.ChangeEvent): void;
  editSortPreference(event: React.ChangeEvent): void;
  selectAthleteFieldToEdit(athleteId: string, field: AthleteField): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  syncAndUnfocusEditedAthleteField(): void;
  considerAthleteForDeletion(athlete: Athlete): void;
  cancelAthleteDeletion(): void;
  confirmAthleteDeletion(): void;
}

export interface PasteAthletesController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  editSpreadsheetData(event: React.ChangeEvent): void;
  editSchool(event: React.ChangeEvent): void;
  submitSpreadsheetData(): void;
}

export interface CorrectPastedAthletesController {
  navigateToSearchForSeasonScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  navigateToAthletesMenu(): void;
  selectAthleteFieldToEdit(
    athleteIndex: number,
    editedRowField: AthleteRowField
  ): void;
  syncAndUnfocusEditedAthleteField(): void;
  editSelectedAthleteField(event: React.ChangeEvent): void;
  addAthletes(): void;
}

export interface SeasonMeetsController {
  navigateToSearchForSeasonScreen(): void;
  navigateToSignInScreen(): void;
  navigateToUserSeasonsScreen(): void;
  navigateToUserProfileScreen(): void;
  viewSeason(seasonSummary: SeasonSummary): void;
  viewMeet(meetSummary: MeetSummary): void;
  editPendingMeetName(event: React.ChangeEvent): void;
  addMeet(): void;
}

export function createControllers(app: App): ControllerCollection {
  function navigateToSearchForSeasonScreen() {
    const state: SearchForSeasonState = {
      kind: StateType.SearchForSeason,
      user: Option.none(),
      query: "",
      isLoading: false,
      seasons: Option.none(),
    };
    app.setState(state);
  }
  function navigateToSignInScreen() {
    app.setState({
      kind: StateType.SignIn,
    });
  }
  function navigateToUserSeasonsScreen() {
    app.getUser().match({
      none: () => {
        throw new Error(
          "Attempted to navigateToUserSeasonsScreen when user was not signed in."
        );
      },
      some: user => {
        app.setState({
          kind: StateType.UserSeasons,
          seasons: Option.none(),
        });
        getUserSeasons(user).then(seasonSummaries => {
          if (app.state.kind === StateType.UserSeasons) {
            app.setState({
              ...app.state,
              seasons: Option.some(seasonSummaries),
            });
          }
        });
      },
    });
  }
  function navigateToUserProfileScreen() {
    const state: UserProfileState = {
      kind: StateType.UserProfile,
      user: app
        .getUser()
        .expect(
          "Attempted to navigateToUserProfileScreen when user was not signed in."
        ),
      fullName: Option.none(),
    };
    app.setState(state);

    getUserName(state.user).then(profile => {
      if (app.state.kind === StateType.UserProfile) {
        app.setState({ ...app.state, fullName: Option.some(profile) });
      }
    });
  }
  function viewSeason(seasonSummary: SeasonSummary) {
    const state: SeasonMenuState = {
      kind: StateType.SeasonMenu,
      user: app.getUser(),
      seasonSummary,
    };
    app.setState(state);
  }

  const searchForSeasonController = {
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    editQuery(event: React.ChangeEvent) {
      app.setState({
        ...app.state,
        query: (event.target as HTMLInputElement).value,
      });
    },
    search() {
      const state = app.state as SearchForSeasonState;
      app.setState({ ...state, isLoading: true });
      const originalQuery = state.query;
      searchForSeason(originalQuery).then(seasonSummaries => {
        if (
          app.state.kind === StateType.SearchForSeason &&
          app.state.isLoading &&
          app.state.query === originalQuery
        ) {
          app.setState({
            ...state,
            isLoading: false,
            seasons: Option.some(seasonSummaries),
          });
        }
      });
    },
    viewSeason,
  };
  const signInController = {
    signInWithGoogle() {
      app.setState({ kind: StateType.WaitForSignInCompletion });
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "true");
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    },
  };
  const userSeasonsController = {
    navigateToUserProfileScreen,
    viewSeason,
    navigateToCreateSeasonScreen() {
      if (app.state.kind === StateType.UserSeasons) {
        const state: CreateSeasonState = {
          kind: StateType.CreateSeason,
          user: app.state.user,
          seasonName: "My Awesome Season",
          minGrade: "6",
          maxGrade: "8",
          schools: [],
          newSchoolName: "",
        };
        app.setState(state);
      } else {
        throw new Error(
          "Attempted to navigateToCreateSeasonScreen when user was not on UserSeasons screen."
        );
      }
    },
  };
  const userProfileController = {
    navigateToUserSeasonsScreen,
    signOut() {
      firebase
        .auth()
        .signOut()
        .then(navigateToSearchForSeasonScreen);
    },
    editPendingFirstName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.UserProfile) {
        const newFirstName = (event.target as HTMLInputElement).value;
        app.setState({
          ...app.state,
          fullName: app.state.fullName.map(prevName => ({
            firstName: newFirstName,
            lastName: prevName.lastName,
          })),
        });
      } else {
        throw new Error(
          "Attempted to editPendingFirstName when user was not on UserProfile screen."
        );
      }
    },
    editPendingLastName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.UserProfile) {
        const newLastName = (event.target as HTMLInputElement).value;
        app.setState({
          ...app.state,
          fullName: app.state.fullName.map(prevName => ({
            firstName: prevName.firstName,
            lastName: newLastName,
          })),
        });
      } else {
        throw new Error(
          "Attempted to editPendingLastName when user was not on UserProfile screen."
        );
      }
    },
    savePendingName() {
      if (app.state.kind === StateType.UserProfile) {
        const { user } = app.state;
        app.state.fullName.ifSome(fullName => {
          updateUserName(user, fullName).catch(() =>
            createUserAccount(user, fullName)
          );
        });
      } else {
        throw new Error(
          "Attempted to savePendingName when user was not on UserProfile screen."
        );
      }
    },
  };
  const createSeasonController = {
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
  const seasonMenuController = {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      if (app.state.kind === StateType.SeasonMenu) {
        const state: AthletesMenuState = {
          kind: StateType.AthletesMenu,
          user: app.state.user,
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
        };
        app.setState(state);

        const seasonId = app.state.seasonSummary.id;
        app.state.user.ifSome(user => {
          doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
            if (hasAccess) {
              app.setState(prevState => ({
                ...prevState,
                doesUserHaveWriteAccess: true,
              }));
            }
          });
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
          "Attempted to navigateToAthletesMenu when user was not on SeasonMenu screen."
        );
      }
    },
    navigateToAssistantsMenu() {
      throw new Error("TODO navigateToAssistantsMenu");
    },
    navigateToSeasonMeetsScreen() {
      if (app.state.kind === StateType.SeasonMenu) {
        const state: SeasonMeetsState = {
          kind: StateType.SeasonMeets,

          user: app.state.user,
          doesUserHaveWriteAccess: false,
          seasonSummary: app.state.seasonSummary,
          meets: Option.none(),
          pendingMeetName: "",
        };
        app.setState(state);

        const seasonId = app.state.seasonSummary.id;
        app.state.user.ifSome(user => {
          doesUserHaveWriteAccessToSeason(user, seasonId).then(hasAccess => {
            if (hasAccess && app.state.kind === StateType.SeasonMeets) {
              app.setState({ ...app.state, doesUserHaveWriteAccess: true });
            }
          });
        });
        getSeasonMeets(seasonId).then(meets => {
          if (app.state.kind === StateType.SeasonMeets) {
            app.setState({ ...app.state, meets: Option.some(meets) });
          }
        });
      } else {
        throw new Error(
          "Attempted to navigateToMeetsMenu when user was not on SeasonMenu screen."
        );
      }
    },
  };
  const athletesMenuController = {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
    navigateToPasteAthletesScreen() {
      if (app.state.kind === StateType.AthletesMenu) {
        const state: PasteAthletesState = {
          kind: StateType.PasteAthletes,

          user: app.state.user.expect(
            "Attempted to navigateToPasteAthletesScreen when user was not logged in."
          ),
          seasonSummary: app.state.seasonSummary,
          spreadsheetData: "",
          schools: Option.none(),
          selectedSchool: Option.none(),
        };
        app.setState(state);

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
    navigateToManuallyAddAthleteScreen() {
      throw new Error("TODO navigateToManuallyAddAthleteScreen");
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
    selectAthleteFieldToEdit(athleteId: string, editedField: AthleteField) {
      if (app.state.kind === StateType.AthletesMenu) {
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
        const updatedAthletes = updateAthletes(athletes, pendingEdit);
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
      if (app.state.kind === StateType.AthletesMenu) {
        app.setState({
          ...app.state,
          athleteConsideredForDeletion: Option.some(athlete),
        });
      } else {
        throw new Error(
          "Attempted to considerAthleteForDeletion when user was not on AthleteMenu."
        );
      }
    },
    confirmAthleteDeletion() {
      if (app.state.kind === StateType.AthletesMenu) {
        const seasonId = app.state.seasonSummary.id;
        const deletedAthlete = app.state.athleteConsideredForDeletion.expect(
          "Attempted to confirmAthleteDeletion when user was not considering an athlete for deletion."
        );
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
          athleteConsideredForDeletion: Option.none(),
        });
        isAthleteDeletable(seasonId, deletedAthlete).then(isDeletable => {
          if (isDeletable) {
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
            alert("TODO You cannot delete this athlete");
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
          athleteConsideredForDeletion: Option.none(),
        });
      } else {
        throw new Error(
          "Attempted to cancelAthleteDeletion when user was not on AthleteMenu."
        );
      }
    },
  };
  const pasteAthletesController = {
    navigateToSearchForSeasonScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    navigateToAthletesMenu() {
      // TODO DRY
      // This code loosely repeats seasonMenuController.navigateToAthletesMenu
      if (app.state.kind === StateType.PasteAthletes) {
        const state: AthletesMenuState = {
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
        };
        app.setState(state);

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
        const state: CorrectPastedAthletesState = {
          kind: StateType.CorrectPastedAthletes,
          user: app.state.user,
          seasonSummary: app.state.seasonSummary,
          selectedSchool: app.state.selectedSchool.expect(
            "Attempted to submitSpreadsheetData when user had not selected a school."
          ),
          athletes: parseSpreadsheetData(app.state.spreadsheetData),
          pendingAthleteEdit: Option.none(),
          gradeBounds: Option.none(),
        };
        app.setState(state);

        getSeasonGradeBounds(app.state.seasonSummary.id).then(gradeBounds => {
          if (app.state.kind === StateType.CorrectPastedAthletes) {
            app.setState({
              ...app.state,
              gradeBounds: Option.some(gradeBounds),
            });
          }
        });
      } else {
        throw new Error(
          "Attempted to submitSpreadsheetData when user was not on PasteAthletes screen."
        );
      }
    },
  };
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
        const state: AthletesMenuState = {
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
        };
        app.setState(state);

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
  const seasonMeetsController = {
    navigateToSearchForSeasonScreen,
    navigateToSignInScreen,
    navigateToUserSeasonsScreen,
    navigateToUserProfileScreen,
    viewSeason,
    viewMeet(meetSummary: MeetSummary) {
      throw new Error("TODO viewMeet");
    },
    editPendingMeetName(event: React.ChangeEvent) {
      if (app.state.kind === StateType.SeasonMeets) {
        const pendingMeetName = (event.target as HTMLInputElement).value;
        app.setState({ ...app.state, pendingMeetName });
      } else {
        throw new Error(
          "Attempted to editPendingMeetName when user was not on SeasonMeets screen."
        );
      }
    },
    addMeet() {
      if (app.state.kind === StateType.SeasonMeets) {
        const { pendingMeetName } = app.state;
        if (pendingMeetName !== "") {
          app.setState({ ...app.state, pendingMeetName: "" });
          addMeetToSeason(pendingMeetName, app.state.seasonSummary.id).then(
            meetSummary => {
              if (app.state.kind === StateType.SeasonMeets) {
                app.setState({
                  ...app.state,
                  meets: app.state.meets.map(meets =>
                    meets.concat([meetSummary])
                  ),
                });
              }
            }
          );
        }
      } else {
        throw new Error(
          "Attempted to addMeet when user was not on SeasonMeets screen."
        );
      }
    },
  };

  return {
    searchForSeasonController,
    signInController,
    userSeasonsController,
    userProfileController,
    createSeasonController,
    seasonMenuController,
    athletesMenuController,
    pasteAthletesController,
    correctPastedAthletesController,
    seasonMeetsController,
  };
}

const DEFAULT_MIN_GRADE = 6;
const DEFAULT_MAX_GRADE = 8;

function validatePendingGrades(min: string, max: string): [number, number] {
  const minOrNaN = parseInt(min, 10);
  const maxOrNaN = parseInt(max, 10);
  const bound1 = isNaN(minOrNaN) ? DEFAULT_MIN_GRADE : minOrNaN;
  const bound2 = isNaN(maxOrNaN) ? DEFAULT_MAX_GRADE : maxOrNaN;
  const minGrade = Math.min(bound1, bound2);
  const maxGrade = Math.max(bound1, bound2);
  return [minGrade, maxGrade];
}

function getSeasonSpec(state: CreateSeasonState): SeasonSpec {
  const [minGrade, maxGrade] = validatePendingGrades(
    state.minGrade,
    state.maxGrade
  );
  return { name: state.seasonName, minGrade, maxGrade, schools: state.schools };
}
