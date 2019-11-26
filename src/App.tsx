import React from "react";

import "./App.css";

import { AppState, StateType, StateOf } from "./types/states";
import { ControllerCollection } from "./types/controllers";
import createControllers from "./createControllers";
import { api, User } from "./api";
import guessFullName from "./guessFullName";
import Option from "./types/Option";
import LocalStorageKeys from "./types/LocalStorageKeys";

import SearchForSeason from "./components/SearchForSeason";
import SignIn from "./components/SignIn";
import Loading from "./components/Loading";
import UserSeasons from "./components/UserSeasons";
import UserProfile from "./components/UserProfile";
import CreateSeason from "./components/CreateSeason";
import SeasonMenu from "./components/SeasonMenu";
import AthletesMenu from "./components/AthletesMenu";
import PasteAthletes from "./components/PasteAthletes";
import AddAthletes from "./components/AddAthletes";
import AssistantsMenu from "./components/AssistantsMenu";
import SeasonMeets from "./components/SeasonMeets";
import EditMeet from "./components/EditMeet";
import ViewMeet from "./components/ViewMeet";
import { ScreenHandle } from "./types/handle";
import StatePopper from "./StatePopper";
import {
  CachedState,
  SeasonMenuCachedState,
  CreateSeasonCachedState,
  AthletesMenuCachedState,
  PasteAthletesCachedState,
  AddAthletesCachedState,
  AssistantsMenuCachedState,
  SeasonMeetsCachedState,
  EditMeetCachedState,
  ViewMeetCachedState,
} from "./cachedState";
import ScreenLoader from "./ScreenLoader";

export default class App extends React.Component<{}, AppState> {
  private controllers: ControllerCollection;
  private screenExpirationListener: () => void;
  private expiration: Promise<void>;
  private statePopper: StatePopper;

  constructor(props: {}) {
    super(props);

    // @ts-ignore
    window.app = this;

    const isWaitingForSignInCompletion =
      localStorage.getItem(LocalStorageKeys.IsWaitingForSignIn) === "true";
    this.state = {
      kind: StateType.Loading,
      screenNumber: 0,
      isWaitingForSignInCompletion,
    };

    this.bindMethods();

    this.controllers = createControllers(this);
    this.statePopper = new StatePopper(this);

    this.screenExpirationListener = function noOp() {};
    this.expiration = new Promise(resolve => {
      this.screenExpirationListener = resolve;
    });
  }

  private bindMethods() {
    this.addListeners = this.addListeners.bind(this);
    this.pushScreen = this.pushScreen.bind(this);
    this.unsafeGetScreenHandle = this.unsafeGetScreenHandle.bind(this);
    this.onPopState = this.onPopState.bind(this);
  }

  componentDidMount() {
    if (localStorage.getItem("__shouldWaitForStubs__") === "true") {
      console.log("Deferring initialization...");

      (window as any).__onStubsAdded__ = this.addListeners;
    } else {
      this.addListeners();
    }
  }

  addListeners() {
    console.log("initializing");

    window.addEventListener("popstate", this.onPopState);

    api.onAuthStateChanged(user => {
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "false");
      if (user !== null) {
        api.doesUserAccountExist(user.uid).then(doesExist => {
          if (doesExist) {
            const loader = new ScreenLoader(this, Option.some(user));
            loader.loadScreen(window.location.pathname);
          } else {
            this.replaceScreen(StateType.UserProfile, {
              user,
              fullName: Option.some(guessFullName(user.displayName || "")),
              doesUserExist: false,
            });
          }
        });
      } else {
        const loader = new ScreenLoader(this, Option.none());
        loader.loadScreen(window.location.pathname);
      }
    });
  }

  onPopState(event: PopStateEvent) {
    this.statePopper.revertTo(event.state as CachedState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.onPopState);
  }

  render() {
    switch (this.state.kind) {
      case StateType.SearchForSeason:
        return (
          <SearchForSeason
            state={this.state}
            controller={this.controllers.searchForSeasonController}
          />
        );
      case StateType.SignIn:
        return (
          <SignIn
            state={this.state}
            controller={this.controllers.signInController}
          />
        );
      case StateType.Loading:
        return <Loading state={this.state} />;
      case StateType.UserSeasons:
        return (
          <UserSeasons
            state={this.state}
            controller={this.controllers.userSeasonsController}
          />
        );
      case StateType.UserProfile:
        return (
          <UserProfile
            state={this.state}
            controller={this.controllers.userProfileController}
          />
        );
      case StateType.CreateSeason:
        return (
          <CreateSeason
            state={this.state}
            controller={this.controllers.createSeasonController}
          />
        );
      case StateType.SeasonMenu:
        return (
          <SeasonMenu
            state={this.state}
            controller={this.controllers.seasonMenuController}
          />
        );
      case StateType.AthletesMenu:
        return (
          <AthletesMenu
            state={this.state}
            controller={this.controllers.athletesMenuController}
          />
        );
      case StateType.PasteAthletes:
        return (
          <PasteAthletes
            state={this.state}
            controller={this.controllers.pasteAthletesController}
          />
        );
      case StateType.AddAthletes:
        return (
          <AddAthletes
            state={this.state}
            controller={this.controllers.addAthletesController}
          />
        );
      case StateType.AssistantsMenu:
        return (
          <AssistantsMenu
            state={this.state}
            controller={this.controllers.assistantsMenuController}
          />
        );
      case StateType.SeasonMeets:
        return (
          <SeasonMeets
            state={this.state}
            controller={this.controllers.seasonMeetsController}
          />
        );
      case StateType.EditMeet:
        return (
          <EditMeet
            state={this.state}
            controller={this.controllers.editMeetController}
          />
        );
      case StateType.ViewMeet:
        return (
          <ViewMeet
            state={this.state}
            controller={this.controllers.viewMeetController}
          />
        );
    }
  }

  getUser(): Option<User> {
    switch (this.state.kind) {
      case StateType.SearchForSeason:
        return this.state.user;
      case StateType.SignIn:
        return Option.none();
      case StateType.Loading:
        return Option.none();
      case StateType.UserSeasons:
        return Option.some(this.state.user);
      case StateType.UserProfile:
        return Option.some(this.state.user);
      case StateType.CreateSeason:
        return Option.some(this.state.user);
      case StateType.SeasonMenu:
        return this.state.user;
      case StateType.AthletesMenu:
        return this.state.user;
      case StateType.PasteAthletes:
        return Option.some(this.state.user);
      case StateType.AddAthletes:
        return Option.some(this.state.user);
      case StateType.AssistantsMenu:
        return this.state.user;
      case StateType.SeasonMeets:
        return this.state.user;
      case StateType.EditMeet:
        return Option.some(this.state.user);
      case StateType.ViewMeet:
        return this.state.user;
    }
  }

  pushScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>> {
    return this.newScreen(kind, state, true);
  }

  replaceScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
  ): Promise<ScreenHandle<T>> {
    return this.newScreen(kind, state, false);
  }

  private newScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">,
    shouldPushHistory: boolean
  ): Promise<ScreenHandle<T>> {
    this.screenExpirationListener();

    return new Promise<ScreenHandle<T>>(resolve => {
      this.setState(prevState => {
        const newScreenNumber = prevState.screenNumber + 1;
        const newState = {
          kind,
          screenNumber: newScreenNumber,
          ...state,
        } as StateOf<T>;

        if (shouldPushHistory) {
          this.pushHistory(newState);
        } else {
          this.replaceHistory(newState);
        }

        const expiration = new Promise<void>(resolve => {
          this.screenExpirationListener = resolve;
        });
        this.expiration = expiration;
        const screenHandle: ScreenHandle<T> = {
          state: newState,
          expiration,
          hasExpired: () => this.state.screenNumber !== newScreenNumber,
          update: stateOrUpdater => {
            if (this.state.screenNumber === newScreenNumber) {
              if ("function" === typeof stateOrUpdater) {
                this.setState(prevState => ({
                  ...prevState,
                  ...stateOrUpdater(prevState as StateOf<T>),
                }));
              } else {
                this.setState(prevState => ({
                  ...prevState,
                  ...stateOrUpdater,
                }));
              }
            }
          },
          pushScreen: this.pushScreen,
        };
        resolve(screenHandle);
        return newState;
      });
    });
  }

  private pushHistory(newState: AppState) {
    switch (newState.kind) {
      case StateType.SearchForSeason:
        window.history.pushState(
          { kind: StateType.SearchForSeason },
          "",
          "/search-for-season"
        );
        break;
      case StateType.SignIn:
        window.history.pushState({ kind: StateType.SignIn }, "", "/sign-in");
        break;
      case StateType.Loading:
        break;
      case StateType.UserSeasons:
        window.history.pushState(
          { kind: StateType.UserSeasons },
          "",
          "/my-seasons"
        );
        break;
      case StateType.UserProfile:
        window.history.pushState(
          { kind: StateType.UserProfile },
          "",
          "/my-profile"
        );
        break;
      case StateType.CreateSeason: {
        const {
          seasonName,
          minGrade,
          maxGrade,
          schools,
          newSchoolName,
        } = newState;
        const cachedState: CreateSeasonCachedState = {
          kind: StateType.CreateSeason,
          seasonName,
          minGrade,
          maxGrade,
          schools,
          newSchoolName,
        };
        window.history.pushState(cachedState, "", "/create-season");
        break;
      }
      case StateType.SeasonMenu: {
        const { season } = newState;
        const cachedState: SeasonMenuCachedState = {
          kind: StateType.SeasonMenu,
          season,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}`
        );
        break;
      }

      case StateType.AthletesMenu: {
        const { season } = newState;
        const cachedState: AthletesMenuCachedState = {
          kind: StateType.AthletesMenu,
          season,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/athletes`
        );
        break;
      }
      case StateType.PasteAthletes: {
        const { season, spreadsheetData } = newState;
        const cachedState: PasteAthletesCachedState = {
          kind: StateType.PasteAthletes,
          season,
          spreadsheetData,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/paste-athletes`
        );
        break;
      }
      case StateType.AddAthletes: {
        const { season, wereAthletesPasted } = newState;
        const cachedState: AddAthletesCachedState = {
          kind: StateType.AddAthletes,
          season,
          wereAthletesPasted,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/add-athletes`
        );
        break;
      }
      case StateType.AssistantsMenu: {
        const { season } = newState;
        const cachedState: AssistantsMenuCachedState = {
          kind: StateType.AssistantsMenu,
          season,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/assistants`
        );
        break;
      }
      case StateType.SeasonMeets: {
        const { season, pendingMeetName } = newState;
        const cachedState: SeasonMeetsCachedState = {
          kind: StateType.SeasonMeets,
          season,
          pendingMeetName,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets`
        );
        break;
      }
      case StateType.EditMeet: {
        const { season, meetSummary } = newState;
        const cachedState: EditMeetCachedState = {
          kind: StateType.EditMeet,
          season,
          meetSummary,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets/${newState.meetSummary.id}/edit`
        );
        break;
      }
      case StateType.ViewMeet: {
        const { season, meetSummary } = newState;
        const cachedState: ViewMeetCachedState = {
          kind: StateType.ViewMeet,
          season,
          meetSummary,
        };
        window.history.pushState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets/${newState.meetSummary.id}/view`
        );
        break;
      }
    }
  }

  private replaceHistory(newState: AppState) {
    switch (newState.kind) {
      case StateType.SearchForSeason:
        window.history.replaceState(
          { kind: StateType.SearchForSeason },
          "",
          "/search-for-season"
        );
        break;
      case StateType.SignIn:
        window.history.replaceState({ kind: StateType.SignIn }, "", "/sign-in");
        break;
      case StateType.Loading:
        break;
      case StateType.UserSeasons:
        window.history.replaceState(
          { kind: StateType.UserSeasons },
          "",
          "/my-seasons"
        );
        break;
      case StateType.UserProfile:
        window.history.replaceState(
          { kind: StateType.UserProfile },
          "",
          "/my-profile"
        );
        break;
      case StateType.CreateSeason: {
        const {
          seasonName,
          minGrade,
          maxGrade,
          schools,
          newSchoolName,
        } = newState;
        const cachedState: CreateSeasonCachedState = {
          kind: StateType.CreateSeason,
          seasonName,
          minGrade,
          maxGrade,
          schools,
          newSchoolName,
        };
        window.history.replaceState(cachedState, "", "/create-season");
        break;
      }
      case StateType.SeasonMenu: {
        const { season } = newState;
        const cachedState: SeasonMenuCachedState = {
          kind: StateType.SeasonMenu,
          season,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}`
        );
        break;
      }

      case StateType.AthletesMenu: {
        const { season } = newState;
        const cachedState: AthletesMenuCachedState = {
          kind: StateType.AthletesMenu,
          season,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/athletes`
        );
        break;
      }
      case StateType.PasteAthletes: {
        const { season, spreadsheetData } = newState;
        const cachedState: PasteAthletesCachedState = {
          kind: StateType.PasteAthletes,
          season,
          spreadsheetData,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/paste-athletes`
        );
        break;
      }
      case StateType.AddAthletes: {
        const { season, wereAthletesPasted } = newState;
        const cachedState: AddAthletesCachedState = {
          kind: StateType.AddAthletes,
          season,
          wereAthletesPasted,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/add-athletes`
        );
        break;
      }
      case StateType.AssistantsMenu: {
        const { season } = newState;
        const cachedState: AssistantsMenuCachedState = {
          kind: StateType.AssistantsMenu,
          season,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/assistants`
        );
        break;
      }
      case StateType.SeasonMeets: {
        const { season, pendingMeetName } = newState;
        const cachedState: SeasonMeetsCachedState = {
          kind: StateType.SeasonMeets,
          season,
          pendingMeetName,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets`
        );
        break;
      }
      case StateType.EditMeet: {
        const { season, meetSummary } = newState;
        const cachedState: EditMeetCachedState = {
          kind: StateType.EditMeet,
          season,
          meetSummary,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets/${newState.meetSummary.id}/edit`
        );
        break;
      }
      case StateType.ViewMeet: {
        const { season, meetSummary } = newState;
        const cachedState: ViewMeetCachedState = {
          kind: StateType.ViewMeet,
          season,
          meetSummary,
        };
        window.history.replaceState(
          cachedState,
          "",
          `/seasons/${newState.season.id}/meets/${newState.meetSummary.id}/view`
        );
        break;
      }
    }
  }

  unsafeGetScreenHandle<T extends AppState["kind"]>(): ScreenHandle<T> {
    const currentScreenNumber = this.state.screenNumber;

    return {
      state: this.state as StateOf<T>,
      expiration: this.expiration,
      hasExpired: () => this.state.screenNumber !== currentScreenNumber,
      pushScreen: this.pushScreen,
      update: stateOrUpdater => {
        if (this.state.screenNumber === currentScreenNumber) {
          if ("function" === typeof stateOrUpdater) {
            this.setState(prevState => ({
              ...prevState,
              ...stateOrUpdater(prevState as StateOf<T>),
            }));
          } else {
            this.setState(prevState => ({ ...prevState, ...stateOrUpdater }));
          }
        }
      },
    };
  }
}

interface ScreenUpdater<NewState> {
  update(callback: ScreenUpdaterCallback<NewState>): void;
}

type ScreenUpdaterCallback<NewState> = (
  state: NewState,
  updateScreen: (
    newStateOrUpdater:
      | Partial<NewState>
      | ((prevState: NewState) => Partial<NewState>)
  ) => void
) => void;

interface UpdatedState<State> {
  state: State;
  updateScreen(
    newStateOrStateUpdater:
      | Partial<State>
      | ((prevState: State) => Partial<State>)
  ): void;
}
