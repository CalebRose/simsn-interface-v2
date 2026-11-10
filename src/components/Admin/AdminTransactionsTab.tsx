import { useEffect, useMemo, useState } from "react";
import { League, SimNBA, SimNFL, SimPHL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAdminPage } from "../../context/AdminPageContext";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";

export const AdminTransactionsTab = () => {
  const { currentUser } = useAuthStore();
  const { selectedLeague } = useLeagueStore();

  // NFL Store
  const {
    proNews: nflNews,
    proTeamMap: nflTeamMap,
    cfb_Timestamp,
    getBootstrapNewsData: getFBANewsData,
  } = useSimFBAStore();
  const { fbaTradeProposals } = useAdminPage();

  // NBA Store
  const {
    proNews: nbaNews,
    nbaTeamMap,
    cbb_Timestamp,
    getBootstrapNewsData: getBBANewsData,
  } = useSimBBAStore();

  // PHL Store
  const {
    proNews: phlNews,
    phlTeamMap,
    hck_Timestamp,
    getBootstrapNewsData: getHCKNewsData,
  } = useSimHCKStore();

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");

  // Fetch bootstrap news on league change or initial mount
  useEffect(() => {
    if (selectedLeague === SimNFL && (!nflNews || nflNews.length === 0)) {
      getFBANewsData();
    } else if (selectedLeague === SimNBA && (!nbaNews || nbaNews.length === 0)) {
      getBBANewsData();
    } else if (selectedLeague === SimPHL && (!phlNews || phlNews.length === 0)) {
      getHCKNewsData();
    }
  }, [
    selectedLeague,
    nflNews,
    nbaNews,
    phlNews,
    getFBANewsData,
    getBBANewsData,
    getHCKNewsData,
  ]);

  // Current league pro news array
  const rawNewsList = useMemo(() => {
    if (selectedLeague === SimNFL) return nflNews || [];
    if (selectedLeague === SimNBA) return nbaNews || [];
    if (selectedLeague === SimPHL) return phlNews || [];
    return [];
  }, [selectedLeague, nflNews, nbaNews, phlNews]);

  // Helper to format team name by ID
  const getTeamDisplayName = (teamID: number): string => {
    if (!teamID) return "Free Agent / Waiver";
    if (selectedLeague === SimNFL) {
      const t = nflTeamMap?.[teamID];
      return t ? `${t.TeamName} ${t.Mascot}` : `Team #${teamID}`;
    }
    if (selectedLeague === SimNBA) {
      const t = nbaTeamMap?.[teamID];
      return t ? (t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team) : `Team #${teamID}`;
    }
    if (selectedLeague === SimPHL) {
      const t = phlTeamMap?.[teamID];
      return t ? `${t.TeamName} ${t.Mascot}` : `Team #${teamID}`;
    }
    return `Team #${teamID}`;
  };

  // Categorize log item and flag retirements
  const categorizeNewsItem = (item: any): string => {
    const rawType = (item.MessageType || "").toUpperCase();
    const rawMsg = (item.Message || "").toUpperCase();

    // Check for retirement first so it can be strictly excluded
    if (
      rawType.includes("RETIRE") ||
      rawMsg.includes("RETIRE") ||
      rawMsg.includes("RETIRED") ||
      rawMsg.includes("RETIREMENT") ||
      rawMsg.includes("HANGING UP HIS CLEATS") ||
      rawMsg.includes("HANGING UP HIS SKATES") ||
      rawMsg.includes("HANGING UP HIS SNEAKERS")
    ) {
      return "RETIREMENT";
    }

    if (
      rawType.includes("TRADE") ||
      rawMsg.includes("TRADED") ||
      rawMsg.includes("TRADE")
    ) {
      return "TRADE";
    }
    if (
      rawType.includes("CUT") ||
      rawMsg.includes("CUT") ||
      rawMsg.includes("RELEASED") ||
      rawMsg.includes("WAIVED")
    ) {
      return "CUT";
    }
    if (
      rawType.includes("FREEAGENCY") ||
      rawType.includes("SIGN") ||
      rawMsg.includes("SIGNED") ||
      rawMsg.includes("CLAIMED") ||
      rawMsg.includes("CONTRACT") ||
      rawMsg.includes("EXTENSION")
    ) {
      return "FREE_AGENCY";
    }
    if (
      rawType.includes("PRACTICE") ||
      rawType.includes("SQUAD") ||
      rawType.includes("AFFILIATE") ||
      rawType.includes("G-LEAGUE") ||
      rawMsg.includes("PRACTICE SQUAD") ||
      rawMsg.includes("G-LEAGUE") ||
      rawMsg.includes("AFFILIATE")
    ) {
      return "PRACTICE_SQUAD";
    }
    return "OTHER";
  };

  // Combine and format logs (minus retirements)
  const allLogs = useMemo(() => {
    const logs: Array<{
      id: string | number;
      week: number;
      teamID: number;
      category: string;
      message: string;
      timestamp?: string;
    }> = [];

    if (rawNewsList && Array.isArray(rawNewsList)) {
      for (const item of rawNewsList) {
        if (!item) continue;
        const cat = categorizeNewsItem(item);
        // Exclude retirements from transactions log
        if (cat === "RETIREMENT") continue;

        const createdAtStr =
          typeof item.CreatedAt === "string"
            ? item.CreatedAt
            : (item.CreatedAt as any)?.Time || "";

        logs.push({
          id: item.ID || `news-${Math.random()}`,
          week: item.Week || 0,
          teamID: item.TeamID || 0,
          category: cat,
          message: item.Message || "",
          timestamp: createdAtStr,
        });
      }
    }

    // For NFL, also include accepted trades from fbaTradeProposals if any
    if (selectedLeague === SimNFL && fbaTradeProposals && Array.isArray(fbaTradeProposals)) {
      for (const t of fbaTradeProposals) {
        if (!t) continue;
        const sending = nflTeamMap?.[t.NFLTeamID];
        const receiving = nflTeamMap?.[t.RecepientTeamID];
        const msg = `Trade completed between ${
          sending ? `${sending.TeamName} ${sending.Mascot}` : `Team #${t.NFLTeamID}`
        } and ${
          receiving ? `${receiving.TeamName} ${receiving.Mascot}` : `Team #${t.RecepientTeamID}`
        }`;
        if (!logs.some((l) => l.message === msg)) {
          logs.push({
            id: `trade-${t.ID}`,
            week: cfb_Timestamp?.NFLWeek || 0,
            teamID: t.NFLTeamID,
            category: "TRADE",
            message: msg,
          });
        }
      }
    }

    return logs.sort((a, b) => {
      if (b.week !== a.week) return b.week - a.week;
      return String(b.id).localeCompare(String(a.id));
    });
  }, [
    rawNewsList,
    selectedLeague,
    fbaTradeProposals,
    nflTeamMap,
    cfb_Timestamp,
  ]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((item) => {
      if (selectedType !== "ALL" && item.category !== selectedType) {
        return false;
      }
      if (selectedTeam !== "ALL" && item.teamID !== Number(selectedTeam)) {
        return false;
      }
      if (selectedWeek !== "ALL" && item.week !== Number(selectedWeek)) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        if (!item.message.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [allLogs, selectedType, selectedTeam, selectedWeek, searchQuery]);

  // Counts for summary metrics
  const counts = useMemo(() => {
    let trades = 0;
    let cuts = 0;
    let signings = 0;
    let practiceSquad = 0;

    for (const item of allLogs) {
      if (item.category === "TRADE") trades++;
      else if (item.category === "CUT") cuts++;
      else if (item.category === "FREE_AGENCY") signings++;
      else if (item.category === "PRACTICE_SQUAD") practiceSquad++;
    }

    return {
      total: allLogs.length,
      trades,
      cuts,
      signings,
      practiceSquad,
    };
  }, [allLogs]);

  // Team dropdown options for current pro league
  const teamOptions = useMemo(() => {
    let list: Array<{ label: string; value: string }> = [];

    if (selectedLeague === SimNFL && nflTeamMap) {
      list = Object.values(nflTeamMap)
        .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
        .map((t) => ({
          label: `${t.TeamName} ${t.Mascot}`,
          value: t.ID.toString(),
        }));
    } else if (selectedLeague === SimNBA && nbaTeamMap) {
      list = Object.values(nbaTeamMap)
        .sort((a, b) => (a.Team || "").localeCompare(b.Team || ""))
        .map((t) => ({
          label: t.Nickname ? `${t.Team} ${t.Nickname}` : t.Team,
          value: t.ID.toString(),
        }));
    } else if (selectedLeague === SimPHL && phlTeamMap) {
      list = Object.values(phlTeamMap)
        .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
        .map((t) => ({
          label: `${t.TeamName} ${t.Mascot}`,
          value: t.ID.toString(),
        }));
    }

    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [selectedLeague, nflTeamMap, nbaTeamMap, phlTeamMap]);

  const weekOptions = useMemo(() => {
    const weeks = Array.from(new Set(allLogs.map((l) => l.week))).sort(
      (a, b) => a - b,
    );
    return [
      { label: "All Weeks", value: "ALL" },
      ...weeks.map((w) => ({
        label: `Week ${w}`,
        value: w.toString(),
      })),
    ];
  }, [allLogs]);

  const typeOptions = useMemo(() => {
    const devSquadLabel =
      selectedLeague === SimNBA
        ? "G-League / Two-Way"
        : selectedLeague === SimPHL
          ? "Affiliate / Minors"
          : "Practice Squad";

    return [
      { label: "All Types", value: "ALL" },
      { label: "Trades", value: "TRADE" },
      { label: "Signings / Free Agency", value: "FREE_AGENCY" },
      { label: "Cuts / Waivers", value: "CUT" },
      { label: devSquadLabel, value: "PRACTICE_SQUAD" },
      { label: "Other", value: "OTHER" },
    ];
  }, [selectedLeague]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "TRADE":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-500/50">
            Trade
          </span>
        );
      case "FREE_AGENCY":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/60 text-green-300 border border-green-500/50">
            Signing
          </span>
        );
      case "CUT":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-900/60 text-red-300 border border-red-500/50">
            Cut / Waived
          </span>
        );
      case "PRACTICE_SQUAD":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-900/60 text-yellow-300 border border-yellow-500/50">
            {selectedLeague === SimNBA
              ? "G-League"
              : selectedLeague === SimPHL
                ? "Affiliate"
                : "Practice Squad"}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-700 text-gray-300 border border-gray-600">
            Info
          </span>
        );
    }
  };

  const devSquadStatLabel =
    selectedLeague === SimNBA
      ? "G-League"
      : selectedLeague === SimPHL
        ? "Affiliate"
        : "Practice Squad";

  return (
    <div className="flex flex-col gap-y-4 w-full p-2">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/60 p-4 rounded-lg border border-gray-800">
        <div>
          <Text variant="h5" classes="font-bold text-white">
            {selectedLeague} Transactions Log
          </Text>
          <Text variant="small" classes="text-gray-400">
            Full league transaction audit trail (trades, contract signings, waivers, and roster moves). Retirements are excluded.
          </Text>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (selectedLeague === SimNFL) getFBANewsData();
              else if (selectedLeague === SimNBA) getBBANewsData();
              else if (selectedLeague === SimPHL) getHCKNewsData();
            }}
          >
            Refresh Log
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-gray-400">
            Total Transactions
          </Text>
          <Text variant="h5" classes="font-bold text-white">
            {counts.total}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-blue-400">
            Trades
          </Text>
          <Text variant="h5" classes="font-bold text-blue-400">
            {counts.trades}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-green-400">
            Signings
          </Text>
          <Text variant="h5" classes="font-bold text-green-400">
            {counts.signings}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center">
          <Text variant="small" classes="text-red-400">
            Cuts / Waivers
          </Text>
          <Text variant="h5" classes="font-bold text-red-400">
            {counts.cuts}
          </Text>
        </Border>
        <Border classes="p-3 bg-gray-800/40 text-center flex flex-col justify-center items-center col-span-2 sm:col-span-1">
          <Text variant="small" classes="text-yellow-400">
            {devSquadStatLabel}
          </Text>
          <Text variant="h5" classes="font-bold text-yellow-400">
            {counts.practiceSquad}
          </Text>
        </Border>
      </div>

      {/* Filters */}
      <Border classes="p-4 flex flex-col md:flex-row gap-4 bg-gray-800/40 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Transaction Type</span>
            <SelectDropdown
              options={typeOptions}
              value={{
                label:
                  typeOptions.find((o) => o.value === selectedType)?.label ||
                  selectedType,
                value: selectedType,
              }}
              onChange={(opt) => opt && setSelectedType(opt.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Team</span>
            <SelectDropdown
              options={teamOptions}
              value={{
                label:
                  teamOptions.find((o) => o.value === selectedTeam)?.label ||
                  selectedTeam,
                value: selectedTeam,
              }}
              onChange={(opt) => opt && setSelectedTeam(opt.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 mb-1">Week</span>
            <SelectDropdown
              options={weekOptions}
              value={{
                label:
                  weekOptions.find((o) => o.value === selectedWeek)?.label ||
                  selectedWeek,
                value: selectedWeek,
              }}
              onChange={(opt) => opt && setSelectedWeek(opt.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-72 flex flex-col">
          <span className="text-xs text-gray-400 mb-1">Search Details</span>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Search player or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Border>

      {/* Transactions Table */}
      <Border classes="overflow-hidden bg-gray-800/40">
        <div className="overflow-x-auto max-h-[550px]">
          <table className="w-full text-left text-sm text-gray-300 border-collapse">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="p-3 border-b border-gray-700 w-20 text-center">
                  Week
                </th>
                <th className="p-3 border-b border-gray-700 w-52">Team</th>
                <th className="p-3 border-b border-gray-700 w-36">Type</th>
                <th className="p-3 border-b border-gray-700">Details</th>
                <th className="p-3 border-b border-gray-700 w-44 text-right">
                  Logged At
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-3 border-b border-gray-800 text-center font-mono font-bold text-gray-400">
                      {item.week > 0 ? `Wk ${item.week}` : "Offseason"}
                    </td>
                    <td className="p-3 border-b border-gray-800 font-semibold text-white">
                      <div className="flex items-center gap-x-2">
                        {item.teamID > 0 && (
                          <Logo
                            url={getLogo(
                              selectedLeague as League,
                              item.teamID,
                              currentUser?.IsRetro,
                            )}
                            variant="small"
                            containerClass="w-5 h-5 flex-shrink-0"
                          />
                        )}
                        <span className="truncate">
                          {getTeamDisplayName(item.teamID)}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 border-b border-gray-800">
                      {getCategoryBadge(item.category)}
                    </td>
                    <td className="p-3 border-b border-gray-800 text-gray-200">
                      {item.message}
                    </td>
                    <td className="p-3 border-b border-gray-800 text-right text-xs text-gray-500 font-mono">
                      {item.timestamp ? item.timestamp.split("T")[0] : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Border>
    </div>
  );
};
