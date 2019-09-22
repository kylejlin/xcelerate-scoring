import firebase from "./firebase";
import React from "react";

import "./App.css";

import { AppState, StateType, StateOf } from "./types/states";
import { ControllerCollection } from "./types/controllers";
import createControllers from "./createControllers";
import doesUserAccountExist from "./firestore/doesUserAccountExist";
import getUserSeasons from "./firestore/getUserSeasons";
import guessFullName from "./guessFullName";
import Option from "./types/Option";
import LocalStorageKeys from "./types/LocalStorageKeys";

import SearchForSeason from "./components/SearchForSeason";
import SignIn from "./components/SignIn";
import WaitForSignInCompletion from "./components/WaitForSignInCompletion";
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

export default class App extends React.Component<{}, AppState> {
  private controllers: ControllerCollection;
  private screenExpirationListener: () => void;
  private expiration: Promise<void>;

  constructor(props: {}) {
    super(props);

    // @ts-ignore
    window.app = this;
    // @ts-ignore
    window.fb = firebase;

    if (localStorage.getItem(LocalStorageKeys.IsWaitingForSignIn) === "true") {
      this.state = { kind: StateType.WaitForSignInCompletion, screenNumber: 0 };
    } else {
      this.state = {
        kind: StateType.SearchForSeason,
        screenNumber: 0,
        user: Option.none(),
        query: "",
        isLoading: false,
        seasons: Option.none(),
      };
    }

    this.bindMethods();

    this.controllers = createControllers(this);

    this.screenExpirationListener = function noOp() {};
    this.expiration = new Promise(resolve => {
      this.screenExpirationListener = resolve;
    });
  }

  private bindMethods() {
    this.newScreen = this.newScreen.bind(this);
    this.unsafeGetScreenHandle = this.unsafeGetScreenHandle.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      localStorage.setItem(LocalStorageKeys.IsWaitingForSignIn, "false");
      if (user) {
        doesUserAccountExist(user).then(doesExist => {
          if (doesExist) {
            this.setState(prevState => {
              const newScreenNumber = prevState.screenNumber + 1;
              getUserSeasons(user).then(seasonSummaries => {
                if (this.state.screenNumber === newScreenNumber) {
                  this.setState({
                    ...this.state,
                    seasons: Option.some(seasonSummaries),
                  });
                }
              });
              return {
                kind: StateType.UserSeasons,
                screenNumber: newScreenNumber,
                user,
                seasons: Option.none(),
              };
            });
          } else {
            this.setState(prevState => {
              const newScreeNumber = prevState.screenNumber + 1;
              return {
                kind: StateType.UserProfile,
                screenNumber: newScreeNumber,
                user,
                fullName: Option.some(guessFullName(user.displayName || "")),
              };
            });
          }
        });
      } else {
        this.setState(prevState => {
          const newScreenNumber = prevState.screenNumber + 1;
          return {
            kind: StateType.SearchForSeason,
            screenNumber: newScreenNumber,
            user: Option.none(),
            query: "",
            isLoading: false,
            seasons: Option.none(),
          };
        });
      }
    });
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
      case StateType.WaitForSignInCompletion:
        return <WaitForSignInCompletion />;
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

  getUser(): Option<firebase.User> {
    switch (this.state.kind) {
      case StateType.SearchForSeason:
        return this.state.user;
      case StateType.SignIn:
        return Option.none();
      case StateType.WaitForSignInCompletion:
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

  newScreenOLD<NewState extends AppState>(
    newScreen: Omit<NewState, "screenNumber">
  ): ScreenUpdater<NewState> {
    const callbacks: ScreenUpdaterCallback<NewState>[] = [];
    let updatedState = Option.none<UpdatedState<NewState>>();
    this.setState(prevState => {
      const newScreenNumber = prevState.screenNumber + 1;
      const newState = {
        ...newScreen,
        screenNumber: newScreenNumber,
      } as NewState;
      const updateScreen = (
        newStateOrUpdater:
          | Partial<NewState>
          | ((prevState: NewState) => Partial<NewState>)
      ) => {
        if (this.state.screenNumber === newScreenNumber) {
          this.setState(newStateOrUpdater as (
            | AppState
            | ((prevState: AppState) => AppState)));
        }
      };
      updatedState = Option.some({
        state: newState,
        updateScreen,
      });
      callbacks.forEach(callback => {
        callback(newState, updateScreen);
      });
      return newState;
    });

    return {
      update(callback) {
        updatedState.match({
          none: () => {
            callbacks.push(callback);
          },
          some: updatedState => {
            callback(updatedState.state, updatedState.updateScreen);
          },
        });
      },
    };
  }

  updateScreen<Kind extends AppState["kind"]>(
    kind: Kind,
    getNewScreen: (
      prevState: Extract<AppState, { kind: Kind }>
    ) => Partial<Extract<AppState, { kind: Kind }>>
  ): ScreenUpdater<Extract<AppState, { kind: Kind }>> {
    type State = Extract<AppState, { kind: Kind }>;
    const callbacks: ScreenUpdaterCallback<State>[] = [];
    let updatedState = Option.none<UpdatedState<State>>();
    this.setState(
      prevState => {
        if (prevState.kind === kind) {
          const newScreen = getNewScreen(prevState as State);
          const { screenNumber } = prevState;
          const newState = {
            ...prevState,
            ...newScreen,
          } as State;
          const updateScreen = (
            newStateOrUpdater:
              | Partial<State>
              | ((prevState: State) => Partial<State>)
          ) => {
            if (this.state.screenNumber === screenNumber) {
              this.setState(newStateOrUpdater as (
                | AppState
                | ((prevState: AppState) => AppState)));
            }
          };
          updatedState = Option.some({
            state: newState,
            updateScreen,
          });
          return newState;
        } else {
          return prevState;
        }
      },
      () => {
        callbacks.forEach(callback => {
          const { state, updateScreen } = updatedState.expect(
            "updatedState should be set to Option::Some by the time the setState() callback is being called."
          );
          callback(state, updateScreen);
        });
      }
    );

    return {
      update(callback) {
        updatedState.match({
          none: () => {
            callbacks.push(callback);
          },
          some: updatedState => {
            callback(updatedState.state, updatedState.updateScreen);
          },
        });
      },
    };
  }

  newScreen<T extends AppState["kind"]>(
    kind: T,
    state: Omit<StateOf<T>, "kind" | "screenNumber">
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
        const expiration = new Promise<void>(resolve => {
          this.screenExpirationListener = resolve;
        });
        const screenHandle: ScreenHandle<T> = {
          state: newState,
          expiration,
          update: (
            state: Partial<Omit<StateOf<T>, "kind" | "screenNumber">>
          ) => {
            if (this.state.screenNumber === newScreenNumber) {
              this.setState(prevState => ({ ...prevState, ...state }));
            }
          },
          newScreen: this.newScreen,
        };
        resolve(screenHandle);
        return newState;
      });
    });
  }

  unsafeGetScreenHandle<T extends AppState["kind"]>(): ScreenHandle<T> {
    const currentScreenNumber = this.state.screenNumber;

    return {
      state: this.state as StateOf<T>,
      expiration: this.expiration,
      newScreen: (kind, state) => {
        return this.newScreen(kind, state);
      },
      update: state => {
        if (this.state.screenNumber === currentScreenNumber) {
          this.setState(prevState => ({ ...prevState, ...state }));
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
