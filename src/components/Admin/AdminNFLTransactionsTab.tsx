import { useEffect, useMemo, useState } from "react";
import { SimNFL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { getLogo } from "../../_utility/getLogo";
import { useAdminPage } from "../../context/AdminPageContext";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { NewsLog } from "../../models/footballModels";

export const AdminNFLTransactionsTab = () => {
  const { currentUser } = useAuthStore();
  const { proNews, proTeamMap, cfb_Timestamp, getBootstrapNewsData } =
    useSimFBAStore();
  const { fbaTradeProposals } = useAdminPage();

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");

  useEffect(() => {
    if (!proNews || proNews.length === 0) {
      getBootstrapNewsData();
    }
  }, [proNews, getBootstrapNewsData]);

  // Normalize category from MessageType or Message text
  const categorizeNewsItem = (item: NewsLog): string => {
    const rawType = (item.MessageType || "").toUpperCase();
    const rawMsg = (item.Message || "").toUpperCase();

    // Check for retirement first so it can be completely excluded
    if (
      rawType.includes("RETIRE") ||
      rawMsg.includes("RETIRE") ||
      rawMsg.includes("RETIRED") ||
      rawMsg.includes("RETIREMENT") ||
      rawMsg.includes("HANGING UP HIS CLEATS")
    ) {
      return "RETIREMENT";
    }

    if (rawType.includes("TRADE") || rawMsg.includes("TRADED") || rawMsg.includes("TRADE")) {
      return "TRADE";
    }
    if (rawType.includes("CUT") || rawMsg.includes("CUT") || rawMsg.includes("RELEASED") || rawMsg.includes("WAIVED")) {
      return "CUT";
    }
    if (
      rawType.includes("FREEAGENCY") ||
      rawType.includes("SIGN") ||
      rawMsg.includes("SIGNED") ||
      rawMsg.includes("CLAIMED") ||
      rawMsg.includes("CONTRACT")
    ) {
      return "FREE_AGENCY";
    }
    if (
      rawType.includes("PRACTICE") ||
      rawType.includes("SQUAD") ||
      rawMsg.includes("PRACTICE SQUAD")
    ) {
      return "PRACTICE_SQUAD";
    }
    return "OTHER";
  };

  // Combine and format logs
  const allLogs = useMemo(() => {
    const logs: Array<{
      id: string | number;
      week: number;
      teamID: number;
      category: string;
      message: string;
      timestamp?: string;
    }> = [];

    if (proNews && Array.isArray(proNews)) {
      for (const item of proNews) {
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

    // Also include accepted trades from fbaTradeProposals if any
    if (fbaTradeProposals && Array.isArray(fbaTradeProposals)) {
      for (const t of fbaTradeProposals) {
        if (!t) continue;
        const sending = proTeamMap?.[t.NFLTeamID];
        const receiving = proTeamMap?.[t.RecepientTeamID];
        const msg = `Trade completed between ${
          sending ? `${sending.TeamName} ${sending.Mascot}` : `Team #${t.NFLTeamID}`
        } and ${
          receiving ? `${receiving.TeamName} ${receiving.Mascot}` : `Team #${t.RecepientTeamID}`
        }`;
        // Avoid adding duplicate if identical message already in logs
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
  }, [proNews, fbaTradeProposals, proTeamMap, cfb_Timestamp]);

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

  // Dropdown options
  const teamOptions = useMemo(() => {
    const list = Object.values(proTeamMap || {})
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
      .map((t) => ({
        label: `${t.TeamName} ${t.Mascot}`,
        value: t.ID.toString(),
      }));
    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [proTeamMap]);

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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "TRADE":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-purple-900/60 text-purple-300 border border-purple-700 font-semibold">
            Trade
          </span>
        );
      case "CUT":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-red-900/60 text-red-300 border border-red-700 font-semibold">
            Cut / Waived
          </span>
        );
      case "FREE_AGENCY":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-green-900/60 text-green-300 border border-green-700 font-semibold">
            Signing
          </span>
        );
      case "PRACTICE_SQUAD":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-blue-900/60 text-blue-300 border border-blue-700 font-semibold">
            Practice Squad
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-600">
            Transaction
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full">
        <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-700 flex flex-col items-center">
          <Text variant="small" classes="text-gray-400 font-bold uppercase text-xs">
            Total Logs
          </Text>
          <span className="text-2xl font-mono font-extrabold text-white">
            {counts.total}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-purple-800/50 flex flex-col items-center">
          <Text variant="small" classes="text-purple-300 font-bold uppercase text-xs">
            Trades
          </Text>
          <span className="text-2xl font-mono font-extrabold text-purple-300">
            {counts.trades}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-red-800/50 flex flex-col items-center">
          <Text variant="small" classes="text-red-300 font-bold uppercase text-xs">
            Cuts / Waivers
          </Text>
          <span className="text-2xl font-mono font-extrabold text-red-300">
            {counts.cuts}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-green-800/50 flex flex-col items-center">
          <Text variant="small" classes="text-green-300 font-bold uppercase text-xs">
            Signings
          </Text>
          <span className="text-2xl font-mono font-extrabold text-green-300">
            {counts.signings}
          </span>
        </div>
        <div className="p-3 rounded-xl bg-gray-900/60 border border-blue-800/50 flex flex-col items-center">
          <Text variant="small" classes="text-blue-300 font-bold uppercase text-xs">
            Practice Squad
          </Text>
          <span className="text-2xl font-mono font-extrabold text-blue-300">
            {counts.practiceSquad}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-3 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === "ALL" ? "primary" : "secondary"}
            size="xs"
            onClick={() => setSelectedType("ALL")}
          >
            All Types
          </Button>
          <Button
            variant={selectedType === "TRADE" ? "primary" : "secondary"}
            size="xs"
            onClick={() => setSelectedType("TRADE")}
          >
            Trades
          </Button>
          <Button
            variant={selectedType === "CUT" ? "primary" : "secondary"}
            size="xs"
            onClick={() => setSelectedType("CUT")}
          >
            Cuts
          </Button>
          <Button
            variant={selectedType === "FREE_AGENCY" ? "primary" : "secondary"}
            size="xs"
            onClick={() => setSelectedType("FREE_AGENCY")}
          >
            Signings
          </Button>
          <Button
            variant={selectedType === "PRACTICE_SQUAD" ? "primary" : "secondary"}
            size="xs"
            onClick={() => setSelectedType("PRACTICE_SQUAD")}
          >
            Practice Squad
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="w-36">
            <SelectDropdown
              options={weekOptions}
              value={weekOptions.find((o) => o.value === selectedWeek) || null}
              onChange={(opt) => setSelectedWeek(opt?.value ?? "ALL")}
              placeholder="Week"
            />
          </div>
          <div className="w-48">
            <SelectDropdown
              options={teamOptions}
              value={teamOptions.find((o) => o.value === selectedTeam) || null}
              onChange={(opt) => setSelectedTeam(opt?.value ?? "ALL")}
              placeholder="Filter Team"
            />
          </div>
          <input
            type="text"
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-sm text-gray-200 border border-gray-700 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size="xs" variant="secondary" onClick={getBootstrapNewsData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700">
          <Text variant="h6" classes="font-bold text-white">
            NFL Transaction Log ({filteredLogs.length} Records)
          </Text>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            No transactions match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border border-gray-700 text-center w-20">Week</th>
                  <th className="p-2 border border-gray-700 text-center w-28">Type</th>
                  <th className="p-2 border border-gray-700 w-48">Team</th>
                  <th className="p-2 border border-gray-700">Transaction Details</th>
                  <th className="p-2 border border-gray-700 w-36 text-gray-500 text-xs">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const team = log.teamID ? proTeamMap?.[log.teamID] : undefined;
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-gray-800 hover:bg-gray-700/30"
                    >
                      <td className="p-2 border border-gray-700 text-center font-mono font-semibold text-white">
                        W{log.week}
                      </td>
                      <td className="p-2 border border-gray-700 text-center whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>
                      <td className="p-2 border border-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-x-2">
                          {team && (
                            <Logo
                              url={getLogo(SimNFL, team.ID, currentUser?.IsRetro)}
                              variant="small"
                              containerClass="w-5 h-5"
                            />
                          )}
                          <span className="font-semibold text-gray-200">
                            {team ? `${team.TeamName} ${team.Mascot}` : "League"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 border border-gray-700 text-gray-100">
                        {log.message}
                      </td>
                      <td className="p-2 border border-gray-700 text-gray-400 text-xs whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Border>
    </div>
  );
};
