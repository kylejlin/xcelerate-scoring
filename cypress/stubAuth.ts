import { StubbableApi } from "../src/api/StubbableApi";
import { User } from "../src/api";

const FAKE_GOOGLE_ACCOUNT: User = {
  displayName: "Xcelerate Testing",
  uid: "DCWja0eXZiNBP3WKukvDQ73A2GU2",
};

export default function stubAuth(api: StubbableApi): void {
  let user: User | null = null;
  let listeners: AuthStateChangeHandler[] = [];

  api.override("onAuthStateChanged", function onAuthStateChanged(
    callback: AuthStateChangeHandler
  ) {
    console.log("hi", user, callback);

    listeners.push(callback);

    callback(user);

    return function unsubscribe() {
      listeners = listeners.filter(listener => listener !== callback);
    };
  });

  api.override(
    "signIntoGoogleWithRedirect",
    function signIntoGoogleWithRedirect() {
      const didUserChange = user !== FAKE_GOOGLE_ACCOUNT;

      user = FAKE_GOOGLE_ACCOUNT;

      if (didUserChange) {
        listeners.forEach(listener => {
          listener(user);
        });
      }
    }
  );

  api.override("signOut", function signOut() {
    const didUserChange = user !== null;

    user = null;

    if (didUserChange) {
      listeners.forEach(listener => {
        listener(user);
      });
    }

    return Promise.resolve();
  });
}

type AuthStateChangeHandler = (user: User | null) => void;
