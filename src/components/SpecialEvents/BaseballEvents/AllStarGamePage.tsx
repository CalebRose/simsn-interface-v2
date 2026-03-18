import { useEffect, useMemo, useState } from "react";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SimMLB } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { getPrimaryBaseballTeam } from "../../../_utility/baseballHelpers";
import {
  AllStarPlayer,
  BootstrapAllStarEvent,
  AllStarGameResult,
} from "../../../models/baseball/baseballEventModels";
import "../../Team/baseball/baseballMobile.css";

// ═══════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════

const POSITION_ORDER = [
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
  "P",
];

const sortRoster = (players: AllStarPlayer[]): AllStarPlayer[] => {
  return [...players].sort((a, b) => {
    if (a.is_starter !== b.is_starter) return a.is_starter ? -1 : 1;
    const posA = POSITION_ORDER.indexOf(a.position.toUpperCase());
    const posB = POSITION_ORDER.indexOf(b.position.toUpperCase());
    return (posA === -1 ? 99 : posA) - (posB === -1 ? 99 : posB);
  });
};

const RosterTable = ({ players }: { players: AllStarPlayer[] }) => {
  const sorted = useMemo(() => sortRoster(players), [players]);

  return (
    <div className="baseball-table-wrapper overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase border-b-2 border-gray-300 dark:border-gray-600">
            <th className="px-2 py-2 w-10">#</th>
            <th className="px-2 py-2 min-w-[10rem]">Player</th>
            <th className="px-2 py-2 text-center w-16">Pos</th>
            <th className="px-2 py-2 text-center w-16">Team</th>
            <th className="px-2 py-2 text-center w-20">Role</th>
            <th className="px-2 py-2 text-center w-20">Selection</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, idx) => (
            <tr
              key={p.player_id}
              className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
            >
              <td className="px-2 py-1.5 text-center text-gray-400">
                {idx + 1}
              </td>
              <td className="px-2 py-1.5 font-medium">{p.name}</td>
              <td className="px-2 py-1.5 text-center uppercase">
                {p.position}
              </td>
              <td className="px-2 py-1.5 text-center text-xs">{p.team}</td>
              <td className="px-2 py-1.5 text-center">
                {p.is_starter ? (
                  <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full">
                    Starter
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Reserve</span>
                )}
              </td>
              <td className="px-2 py-1.5 text-center">
                <span
                  className={`text-xs ${p.source === "auto" ? "text-green-600 dark:text-green-400" : "text-purple-600 dark:text-purple-400"}`}
                >
                  {p.source === "auto" ? "WAR" : "Selected"}
                </span>
              </td>
            </tr>
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No roster data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const ScoreDisplay = ({
  gameResult,
  status,
}: {
  gameResult: AllStarGameResult | null;
  status?: string;
}) => {
  if (!gameResult) {
    return (
      <div className="text-center py-6">
        <Text variant="body" classes="text-gray-400">
          Game has not been played yet.
        </Text>
        {status && (
          <Text variant="small" classes="text-gray-400 mt-1">
            Status:{" "}
            <span className="capitalize font-medium">
              {status.replace("_", " ")}
            </span>
          </Text>
        )}
      </div>
    );
  }

  const alWon =
    gameResult.game_outcome === "AWAY_WIN" ||
    gameResult.away_score > gameResult.home_score;
  const nlWon = !alWon;

  return (
    <div className="flex items-center justify-center gap-8 py-6">
      <div className={`text-center ${alWon ? "font-bold" : "opacity-60"}`}>
        <Text variant="h4" classes={alWon ? "" : "text-gray-400"}>
          AL
        </Text>
        <Text variant="h4">{gameResult.away_score}</Text>
      </div>
      <div className="text-gray-400 text-sm">vs</div>
      <div className={`text-center ${nlWon ? "font-bold" : "opacity-60"}`}>
        <Text variant="h4" classes={nlWon ? "" : "text-gray-400"}>
          NL
        </Text>
        <Text variant="h4">{gameResult.home_score}</Text>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════

export const AllStarGamePage = () => {
  const { currentUser } = useAuthStore();
  const {
    seasonContext,
    mlbOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
    specialEvents,
  } = useSimBaseballStore();
  const organization = mlbOrganization;
  const primaryTeam = organization
    ? getPrimaryBaseballTeam(organization)
    : undefined;

  useEffect(() => {
    if (organization && organization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(organization.id);
    }
  }, [organization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  // Team color theming
  const teamColors = useTeamColors(
    primaryTeam?.color_one ?? undefined,
    primaryTeam?.color_two ?? undefined,
    primaryTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(SimMLB, primaryTeam.team_id, currentUser?.IsRetro);
  }, [primaryTeam, currentUser?.IsRetro]);

  // Extract All-Star data from bootstrap
  const allStarEvent = useMemo(() => {
    return (
      specialEvents.find(
        (e): e is BootstrapAllStarEvent => e.event_type === "allstar",
      ) ?? null
    );
  }, [specialEvents]);

  const [activeTab, setActiveTab] = useState<"AL" | "NL">("AL");

  if (!seasonContext) {
    return (
      <PageContainer>
        <Text variant="h4">Loading...</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img src={logo} className="w-10 h-10 object-contain" alt="" />
          )}
          <div>
            <Text variant="h4" classes={headerTextClass}>
              All-Star Game
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
            </Text>
          </div>
        </div>

        <Border
          classes="p-4"
          styles={{ borderTop: `3px solid ${headerColor}` }}
        >
          {!allStarEvent ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-400">
                No All-Star Game event found for this season.
              </Text>
            </div>
          ) : (
            <>
              {/* Score */}
              <ScoreDisplay
                gameResult={allStarEvent.game_result ?? null}
                status={allStarEvent.status}
              />

              {/* Roster Tabs */}
              <TabGroup>
                <Tab
                  label="American League"
                  selected={activeTab === "AL"}
                  setSelected={() => setActiveTab("AL")}
                />
                <Tab
                  label="National League"
                  selected={activeTab === "NL"}
                  setSelected={() => setActiveTab("NL")}
                />
              </TabGroup>

              <div className="mt-3">
                {activeTab === "AL" && (
                  <RosterTable players={allStarEvent.rosters?.AL ?? []} />
                )}
                {activeTab === "NL" && (
                  <RosterTable players={allStarEvent.rosters?.NL ?? []} />
                )}
              </div>
            </>
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
