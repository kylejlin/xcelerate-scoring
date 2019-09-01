import React from "react";

import { UserProfileState } from "../types/states";
import { UserProfileController } from "../types/controllers";

export default function UserProfile({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToUserSeasonsScreen}>
        Your seasons
      </button>
      <button onClick={controller.signOut}>Sign out</button>
      {state.fullName.match({
        none: () => <p>Loading profile...</p>,
        some: profile => (
          <>
            <label>
              First name:{" "}
              <input
                type="text"
                value={profile.firstName}
                onChange={controller.editPendingFirstName}
              />
            </label>
            <label>
              Last name:{" "}
              <input
                type="text"
                value={profile.lastName}
                onChange={controller.editPendingLastName}
              />
            </label>
            <button onClick={controller.savePendingName}>Save</button>
          </>
        ),
      })}
    </div>
  );
}

interface Props {
  state: UserProfileState;
  controller: UserProfileController;
}
