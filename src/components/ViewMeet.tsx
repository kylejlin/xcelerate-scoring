import React from "react";

import { ViewMeetState } from "../types/states";
import { ViewMeetController } from "../types/controllers";

import { RaceDivisionUtil, Race } from "../types/race";
import Option from "../types/Option";
import { Athlete, AthleteOrSchool } from "../types/misc";
import scoreRace from "../types/scoring";

export default function ViewMeet({
  state,
  controller,
}: Props): React.ReactElement {
  return (
    <div className="App">
      <button onClick={controller.navigateToSearchForSeasonScreen}>
        Search for season
      </button>
      {state.user.match({
        none: () => (
          <button onClick={controller.navigateToSignInScreen}>Sign in</button>
        ),
        some: () => (
          <>
            <button onClick={controller.navigateToUserSeasonsScreen}>
              Your seasons
            </button>
            <button onClick={controller.navigateToUserProfileScreen}>
              Profile
            </button>
          </>
        ),
      })}
      <button onClick={controller.back}>Back</button>
      <h2>{state.meetSummary.name} - View results</h2>

      {Option.all([state.races, state.athletes, state.viewedDivision]).match({
        none: () => <p>Loading races...</p>,
        some: ([races, athletes, viewedDivision]) => {
          const divisionStr = RaceDivisionUtil.stringify(viewedDivision);
          const race = races.getRace(viewedDivision);
          const finishers = getFinishingAthletesIfAllCanBeFound(race, athletes);

          return finishers.match({
            none: () => <p>Athletes not found, please reload the page.</p>,
            some: finishers => {
              const results = scoreRace(finishers);
              return (
                <div>
                  <select
                    value={divisionStr}
                    onChange={controller.selectDivision}
                  >
                    {races
                      .getDivisions()
                      .map(RaceDivisionUtil.stringify)
                      .map(division => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                  </select>
                  <select
                    value={state.viewedResultType}
                    onChange={controller.selectResultType}
                  >
                    <option value={AthleteOrSchool.Athlete}>Athletes</option>
                    <option value={AthleteOrSchool.School}>Schools</option>
                  </select>
                  <h3>{divisionStr}</h3>
                  <table>
                    <tbody>
                      {(() => {
                        switch (state.viewedResultType) {
                          case AthleteOrSchool.Athlete:
                            return (
                              <>
                                <tr>
                                  <th>Place</th>
                                  <th>Team place</th>
                                  <th>First</th>
                                  <th>Last</th>
                                  <th>School</th>
                                </tr>
                                {finishers.map((finisher, i) => (
                                  <tr key={finisher.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                      {results.athleteTeamPlaces[
                                        finisher.id
                                      ].unwrapOr("")}
                                    </td>
                                    <td>{finisher.firstName}</td>
                                    <td>{finisher.lastName}</td>
                                    <td>{finisher.school}</td>
                                  </tr>
                                ))}
                              </>
                            );
                          case AthleteOrSchool.School:
                            return (
                              <>
                                <tr>
                                  <th>Place</th>
                                  <th>Points</th>
                                  <th>School</th>
                                </tr>
                                {results.schoolResults.map(result => (
                                  <tr key={result.school}>
                                    <td>{result.place}</td>
                                    <td>
                                      {result.numberOfFinishersIfIncomplete.match(
                                        {
                                          none: () => result.points,
                                          some: numberOfFinishers =>
                                            result.points +
                                            " - Incomplete (" +
                                            numberOfFinishers +
                                            " finishers)",
                                        }
                                      )}
                                    </td>
                                    <td>{result.school}</td>
                                  </tr>
                                ))}
                              </>
                            );
                        }
                      })()}
                    </tbody>
                  </table>
                </div>
              );
            },
          });
        },
      })}
    </div>
  );
}

interface Props {
  state: ViewMeetState;
  controller: ViewMeetController;
}

function getFinishingAthletesIfAllCanBeFound(
  race: Race,
  athletes: Athlete[]
): Option<Athlete[]> {
  const finishers: Athlete[] = [];
  const ids = race.getFinisherIds();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const athlete = athletes.find(a => a.id === id);
    if (athlete === undefined) {
      return Option.none();
    } else {
      finishers.push(athlete);
    }
  }
  return Option.some(finishers);
}
