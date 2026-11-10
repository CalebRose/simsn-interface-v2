import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SimCFB } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { ToggleSwitch } from "../../_design/Inputs";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { AdminService, CFBBowlFixtureDTO } from "../../_services/adminService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { CollegeGame } from "../../models/footballModels";

export const KNOWN_BOWL_GAMES: Omit<
  CFBBowlFixtureDTO,
  "HomeTeam" | "AwayTeam"
>[] = [
  {
    Week: 16,
    TimeSlot: "Saturday Morning",
    GameTitle: "Myrtle Beach Bowl",
    Stadium: "Brooks Stadium",
    City: "Conway",
    State: "SC",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 16,
    TimeSlot: "Saturday Morning",
    GameTitle: "Camellia Bowl",
    Stadium: "Cramton Bowl",
    City: "Montgomery",
    State: "AL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 16,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "Independence Bowl",
    Stadium: "Independence Stadium",
    City: "Shreveport",
    State: "LA",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 16,
    TimeSlot: "Saturday Evening",
    GameTitle: "Fenway Bowl",
    Stadium: "Fenway Park",
    City: "Boston",
    State: "MA",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 16,
    TimeSlot: "Saturday Evening",
    GameTitle: "Boca Raton Bowl",
    Stadium: "FAU Stadium",
    City: "Boca Raton",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 16,
    TimeSlot: "Saturday Night",
    GameTitle: "Frisco Bowl",
    Stadium: "Toyota Stadium",
    City: "Frisco",
    State: "TX",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Thursday Night",
    GameTitle: "Gator Bowl",
    Stadium: "EverBank Stadium",
    City: "Jacksonville",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Friday Night",
    GameTitle: "The PitBowl",
    Stadium: "Albuquerque Sunport",
    City: "Albuquerque",
    State: "NM",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Friday Night",
    GameTitle: "Hawai'i Bowl",
    Stadium: "Clarence T.C. Ching Athletics Complex",
    City: "Honolulu",
    State: "HI",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Saturday Morning",
    GameTitle: "Military Bowl",
    Stadium: "Navy-Marine Corps Memorial Stadium",
    City: "Annapolis",
    State: "MD",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Saturday Morning",
    GameTitle: "Duluth Trading Co. Northern Lights Bowl",
    Stadium: "U.S. Bank Stadium",
    City: "Minneapolis",
    State: "MN",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "Sun Bowl",
    Stadium: "Sun Bowl",
    City: "El Paso",
    State: "TX",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 17,
    TimeSlot: "Saturday Evening",
    GameTitle: "Huy Fong Foods Sriracha Bowl",
    Stadium: "Qualcomm Stadium",
    City: "San Diego",
    State: "CA",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Thursday Night",
    GameTitle: "Gasparilla Bowl",
    Stadium: "Raymond James Stadium",
    City: "Tampa",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Thursday Night",
    GameTitle: "New Era Pinstripe Bowl",
    Stadium: "Yankee Stadium",
    City: "Bronx",
    State: "NY",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Saturday Morning",
    GameTitle: "Birmingham Bowl",
    Stadium: "Protective Stadium",
    City: "Birmingham",
    State: "AL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Saturday Morning",
    GameTitle: "Texas Bowl",
    Stadium: "NRG Stadium",
    City: "Houston",
    State: "TX",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "Far North Bowl",
    Stadium: "BC Place Stadium",
    City: "Vancouver",
    State: "BC",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 18,
    TimeSlot: "Saturday Evening",
    GameTitle: "Famous Idaho Potato Bowl",
    Stadium: "Albertsons Stadium",
    City: "Boise",
    State: "ID",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Thursday Night",
    GameTitle: "Cheez-It Bowl",
    Stadium: "Camping World Stadium",
    City: "Orlando",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Thursday Night",
    GameTitle: "Music City Bowl",
    Stadium: "Nissan Stadium",
    City: "Nashville",
    State: "TN",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Thursday Night",
    GameTitle: "Bahamas Bowl",
    Stadium: "Thomas Robinson Stadium",
    City: "Nassau",
    State: "BH",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Friday Night",
    GameTitle: "Duke's Mayo Bowl",
    Stadium: "Bank of America Stadium",
    City: "Charlotte",
    State: "NC",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Friday Night",
    GameTitle: "Snoop Dogg Arizona Bowl",
    Stadium: "Arizona Stadium",
    City: "Tucson",
    State: "AZ",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Friday Night",
    GameTitle: "ReliaQuest Bowl",
    Stadium: "Raymond James Stadium",
    City: "Tampa",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Friday Night",
    GameTitle: "Rate Bowl",
    Stadium: "Chase Field",
    City: "Phoenix",
    State: "AZ",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Friday Night",
    GameTitle: "Liberty Bowl",
    Stadium: "Simmons Bank Liberty Stadium",
    City: "Memphis",
    State: "TN",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Morning",
    GameTitle: "Hostess Twinkie Ice Cream Bowl",
    Stadium: "Ford Field",
    City: "Detroit",
    State: "MI",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Morning",
    GameTitle: "Alamo Bowl",
    Stadium: "Alamodome",
    City: "San Antonio",
    State: "TX",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Morning",
    GameTitle: "The Cure Bowl",
    Stadium: "Exploria Stadium",
    City: "Orlando",
    State: "FL",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "New Orleans Bowl",
    Stadium: "Caesars Superdome",
    City: "New Orleans",
    State: "LA",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "Big Timber Brewing Almost Heaven West Virginia Bowl",
    Stadium: "Milan Puskar Stadium",
    City: "Morgantown",
    State: "WV",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "Armed Forces Bowl",
    Stadium: "Amon G. Carter Stadium",
    City: "Fort Worth",
    State: "TX",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Afternoon",
    GameTitle: "First Responder Bowl",
    Stadium: "Gerald J. Ford Stadium",
    City: "Dallas",
    State: "TX",
    IsDomed: false,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Evening",
    GameTitle: "Las Vegas Bowl",
    Stadium: "Allegiant Stadium",
    City: "Las Vegas",
    State: "NV",
    IsDomed: true,
    IsNeutral: true,
  },
  {
    Week: 19,
    TimeSlot: "Saturday Night",
    GameTitle: "The Toilet Bowl",
    Stadium: "Roos Field",
    City: "Cheney",
    State: "WA",
    IsDomed: false,
    IsNeutral: true,
  },
];

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
};

const escapeCSVField = (val: string | number | boolean): string => {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const parseBool = (val: string | undefined): boolean => {
  if (!val) return false;
  const v = val.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "y";
};

export const AdminBowlsTab = () => {
  const { currentUser } = useAuthStore();
  const { cfb_Timestamp } = useSimFBAStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [postseasonGames, setPostseasonGames] = useState<CollegeGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overrideWeekCheck, setOverrideWeekCheck] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentWeek = cfb_Timestamp?.CollegeWeek ?? 0;
  const isAfterWeek14 = currentWeek > 14;

  const loadPostseasonGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const games = await AdminService.GetCFBPostseasonGames();
      setPostseasonGames(games || []);
    } catch (e) {
      console.error("Failed to load postseason games", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPostseasonGames();
  }, [loadPostseasonGames]);

  const scheduledBowlGames = useMemo(
    () =>
      (postseasonGames || []).filter(
        (g) => g.IsBowlGame && !g.IsPlayoffGame && !g.IsNationalChampionship,
      ),
    [postseasonGames],
  );

  const scheduledByTitle = useMemo(() => {
    const map: Record<string, CollegeGame> = {};
    scheduledBowlGames.forEach((g) => {
      if (g.GameTitle) {
        map[g.GameTitle.toLowerCase().trim()] = g;
      }
    });
    return map;
  }, [scheduledBowlGames]);

  const handleExportBowlsCSV = () => {
    const headers = [
      "Week",
      "TimeSlot",
      "GameTitle",
      "Home Team",
      "Away Team",
      "Stadium",
      "City",
      "State",
      "Domed Stadium",
      "IsNeutral",
    ];

    const rows = KNOWN_BOWL_GAMES.map((bowl) => {
      const existing = scheduledByTitle[bowl.GameTitle.toLowerCase().trim()];
      return [
        existing?.Week ?? bowl.Week,
        existing?.TimeSlot ?? bowl.TimeSlot,
        bowl.GameTitle,
        existing?.HomeTeam ?? "",
        existing?.AwayTeam ?? "",
        existing?.Stadium ?? bowl.Stadium,
        existing?.City ?? bowl.City,
        existing?.State ?? bowl.State,
        existing ? (existing.IsDomed ? 1 : 0) : bowl.IsDomed ? 1 : 0,
        existing ? (existing.IsNeutral ? 1 : 0) : bowl.IsNeutral ? 1 : 0,
      ]
        .map(escapeCSVField)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const seasonYear = cfb_Timestamp?.Season ?? "cfb";
    link.href = url;
    link.setAttribute("download", `${seasonYear}_bowl_fixtures.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportCSVFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMsg(null);
    setIsUploading(true);
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        throw new Error("CSV file is empty or missing data rows.");
      }

      const rawHeaders = parseCSVLine(lines[0]).map((h) =>
        h.toLowerCase().trim(),
      );

      const idxWeek = rawHeaders.indexOf("week");
      const idxTimeSlot = rawHeaders.indexOf("timeslot");
      const idxTitle = rawHeaders.indexOf("gametitle");
      const idxHome =
        rawHeaders.indexOf("home team") !== -1
          ? rawHeaders.indexOf("home team")
          : rawHeaders.indexOf("hometeam");
      const idxAway =
        rawHeaders.indexOf("away team") !== -1
          ? rawHeaders.indexOf("away team")
          : rawHeaders.indexOf("awayteam");
      const idxStadium = rawHeaders.indexOf("stadium");
      const idxCity = rawHeaders.indexOf("city");
      const idxState = rawHeaders.indexOf("state");
      const idxDomed =
        rawHeaders.indexOf("domed stadium") !== -1
          ? rawHeaders.indexOf("domed stadium")
          : rawHeaders.indexOf("isdomed");
      const idxNeutral = rawHeaders.indexOf("isneutral");
      const idxPlayoff = rawHeaders.indexOf("isplayoffgame");

      if (idxHome === -1 || idxAway === -1) {
        throw new Error(
          "CSV must contain 'Home Team' and 'Away Team' columns.",
        );
      }

      const fixtures: CFBBowlFixtureDTO[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 3) continue;

        // If importing a combined postseason CSV, skip playoff rows here
        if (idxPlayoff !== -1 && parseBool(cols[idxPlayoff])) {
          continue;
        }

        const homeTeam = cols[idxHome] ?? "";
        const awayTeam = cols[idxAway] ?? "";
        if (!homeTeam && !awayTeam) continue;

        const gameTitle =
          idxTitle !== -1 && cols[idxTitle] ? cols[idxTitle] : `Bowl Game #${i}`;
        const weekNum =
          idxWeek !== -1 && Number(cols[idxWeek]) > 0
            ? Number(cols[idxWeek])
            : 16;
        const timeSlot =
          idxTimeSlot !== -1 && cols[idxTimeSlot]
            ? cols[idxTimeSlot]
            : "Saturday Afternoon";
        const stadium = idxStadium !== -1 ? cols[idxStadium] ?? "" : "";
        const city = idxCity !== -1 ? cols[idxCity] ?? "" : "";
        const state = idxState !== -1 ? cols[idxState] ?? "" : "";
        const isDomed = idxDomed !== -1 ? parseBool(cols[idxDomed]) : false;
        const isNeutral =
          idxNeutral !== -1 ? parseBool(cols[idxNeutral]) : true;

        fixtures.push({
          Week: weekNum,
          TimeSlot: timeSlot,
          GameTitle: gameTitle,
          HomeTeam: homeTeam,
          AwayTeam: awayTeam,
          Stadium: stadium,
          City: city,
          State: state,
          IsDomed: isDomed,
          IsNeutral: isNeutral,
        });
      }

      if (fixtures.length === 0) {
        throw new Error(
          "No bowl fixtures with Home Team and Away Team filled in were found in the file.",
        );
      }

      const savedGames = await AdminService.UploadCFBBowlGames({
        Fixtures: fixtures,
        OverrideWeekCheck: overrideWeekCheck,
      });

      await loadPostseasonGames();
      setStatusMsg({
        type: "success",
        text: `Successfully imported ${savedGames.length} bowl game(s) onto the schedule!`,
      });
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: `Bowl import failed: ${err instanceof Error ? err.message : err}`,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteGame = async (gameID: number) => {
    try {
      await AdminService.DeleteCFBPostseasonGame(gameID);
      setPostseasonGames((prev) => prev.filter((g) => g.ID !== gameID));
      setStatusMsg({
        type: "success",
        text: "Removed bowl game from schedule.",
      });
    } catch (e) {
      setStatusMsg({
        type: "error",
        text: `Failed to remove bowl game: ${e instanceof Error ? e.message : e}`,
      });
    }
  };

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      <div className="flex flex-col gap-y-1">
        <Text variant="h5">SimCFB Bowl Games Management</Text>
        <Text variant="small" classes="text-gray-400">
          Export the known bowl fixtures template, fill in the Home Team and
          Away Team abbreviations (or team names), and import the file after
          Week 14 to add the bowl games to the schedule. Bowl games are never
          added to the schedule unless an upload is performed.
        </Text>
      </div>

      {/* Controls Card */}
      <Border classes="p-4 flex flex-col gap-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-y-1">
            <Text variant="h6">Export &amp; Import Bowl Fixtures</Text>
            <Text variant="small" classes="text-gray-400">
              Current College Week: <strong>Week {currentWeek}</strong>{" "}
              {isAfterWeek14
                ? "(Ready for Bowl Upload)"
                : "(Regular Season - Upload restricted until after Week 14)"}
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isAfterWeek14 && (
              <div className="flex items-center gap-x-2 px-3 py-1.5 rounded bg-yellow-950/40 border border-yellow-700/60">
                <Text variant="xs" classes="text-yellow-300">
                  Allow Upload Before Week 15
                </Text>
                <ToggleSwitch
                  checked={overrideWeekCheck}
                  onChange={setOverrideWeekCheck}
                />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImportCSVFile}
            />

            <ButtonGroup>
              <Button variant="secondaryOutline" onClick={handleExportBowlsCSV}>
                Export Bowl Fixtures CSV ({KNOWN_BOWL_GAMES.length} Known Bowls)
              </Button>
              <Button
                variant="primary"
                disabled={isUploading || (!isAfterWeek14 && !overrideWeekCheck)}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading
                  ? "Uploading Bowl Fixtures..."
                  : "Import / Upload Bowl Fixtures CSV"}
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {statusMsg && (
          <Text
            variant="body-small"
            classes={
              statusMsg.type === "success" ? "text-green-400" : "text-red-400"
            }
          >
            {statusMsg.text}
          </Text>
        )}
      </Border>

      {/* Scheduled Bowl Games (if any uploaded) */}
      {scheduledBowlGames.length > 0 && (
        <Border classes="p-4 flex flex-col gap-y-3">
          <div className="flex items-center justify-between">
            <Text variant="h6">
              Uploaded Bowl Games on Schedule ({scheduledBowlGames.length})
            </Text>
            <Button
              size="sm"
              variant="secondaryOutline"
              onClick={loadPostseasonGames}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="py-2 px-3">Week</th>
                  <th className="py-2 px-3">Bowl Title</th>
                  <th className="py-2 px-3">Home Team</th>
                  <th className="py-2 px-3">Away Team</th>
                  <th className="py-2 px-3">Timeslot</th>
                  <th className="py-2 px-3">Venue</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {scheduledBowlGames.map((game) => (
                  <tr key={game.ID} className="hover:bg-gray-900/40">
                    <td className="py-2.5 px-3">{game.Week}</td>
                    <td className="py-2.5 px-3 font-medium">
                      {game.GameTitle}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            game.HomeTeamID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span>{game.HomeTeam}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-x-2">
                        <Logo
                          url={getLogo(
                            SimCFB,
                            game.AwayTeamID,
                            currentUser?.IsRetro,
                          )}
                          variant="tiny"
                        />
                        <span>{game.AwayTeam}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">{game.TimeSlot}</td>
                    <td className="py-2.5 px-3 text-gray-300">
                      {game.Stadium} ({game.City}, {game.State})
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!game.GameComplete && (
                        <Button
                          size="xs"
                          variant="danger"
                          onClick={() => handleDeleteGame(game.ID)}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Border>
      )}

      {/* Known Bowl Games Reference List */}
      <Border classes="p-4 flex flex-col gap-y-3">
        <Text variant="h6">
          Known Bowl Games Template ({KNOWN_BOWL_GAMES.length} Bowls)
        </Text>
        <div className="overflow-x-auto max-h-[30rem] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                <th className="py-2 px-3">Default Week</th>
                <th className="py-2 px-3">Bowl Name</th>
                <th className="py-2 px-3">Default Timeslot</th>
                <th className="py-2 px-3">Stadium</th>
                <th className="py-2 px-3">Location</th>
                <th className="py-2 px-3">Dome</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {KNOWN_BOWL_GAMES.map((bowl) => {
                const scheduled =
                  scheduledByTitle[bowl.GameTitle.toLowerCase().trim()];
                return (
                  <tr key={bowl.GameTitle} className="hover:bg-gray-900/40">
                    <td className="py-2 px-3">Week {bowl.Week}</td>
                    <td className="py-2 px-3 font-medium">{bowl.GameTitle}</td>
                    <td className="py-2 px-3">{bowl.TimeSlot}</td>
                    <td className="py-2 px-3">{bowl.Stadium}</td>
                    <td className="py-2 px-3">
                      {bowl.City}, {bowl.State}
                    </td>
                    <td className="py-2 px-3">{bowl.IsDomed ? "Yes" : "No"}</td>
                    <td className="py-2 px-3">
                      {scheduled ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-900/60 text-green-300 border border-green-700">
                          {scheduled.HomeTeam} vs {scheduled.AwayTeam}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                          Template Only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Border>
    </div>
  );
};
