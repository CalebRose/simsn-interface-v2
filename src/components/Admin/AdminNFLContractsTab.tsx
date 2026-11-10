import { useEffect, useMemo, useState } from "react";
import { SimNFL } from "../../_constants/constants";
import { tagData } from "../../_constants/tagData";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { PlayerService } from "../../_services/playerService";
import { getLogo } from "../../_utility/getLogo";
import { useAuthStore } from "../../context/AuthContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { NFLExtensionOffer, NFLPlayer } from "../../models/footballModels";

export const AdminNFLContractsTab = () => {
  const { currentUser } = useAuthStore();
  const {
    proExtensionMap,
    proRosterMap,
    nflPlayerMap,
    proTeamMap,
    cfb_Timestamp,
    getBootstrapRosterData,
    getBootstrapPlayerData,
  } = useSimFBAStore();

  const [filterTeam, setFilterTeam] = useState<string>("ALL");
  const [activeSection, setActiveSection] = useState<
    "renewals" | "franchiseTag" | "fifthYear" | "priceMatrix"
  >("renewals");
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [acceptedOptionIds, setAcceptedOptionIds] = useState<Set<number>>(
    new Set(),
  );
  const [rejectedOptionIds, setRejectedOptionIds] = useState<Set<number>>(
    new Set(),
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Ensure roster & extension data are loaded
  useEffect(() => {
    if (!proRosterMap || Object.keys(proRosterMap).length === 0) {
      getBootstrapPlayerData();
    }
    if (!proExtensionMap || Object.keys(proExtensionMap).length === 0) {
      getBootstrapRosterData();
    }
  }, [proRosterMap, proExtensionMap, getBootstrapPlayerData, getBootstrapRosterData]);

  // Flatten all roster players from all available sources
  const allNFLPlayers = useMemo(() => {
    const list: NFLPlayer[] = [];
    const seen = new Set<number>();

    if (proRosterMap && Object.keys(proRosterMap).length > 0) {
      Object.values(proRosterMap).forEach((roster) => {
        if (Array.isArray(roster)) {
          roster.forEach((p) => {
            if (p && p.ID && !seen.has(p.ID)) {
              seen.add(p.ID);
              list.push(p);
            }
          });
        }
      });
    }

    if (nflPlayerMap && Object.keys(nflPlayerMap).length > 0) {
      Object.values(nflPlayerMap).forEach((p) => {
        if (p && p.ID && !seen.has(p.ID)) {
          seen.add(p.ID);
          list.push(p);
        }
      });
    }

    return list;
  }, [nflPlayerMap, proRosterMap]);

  // Section 1: All contract renewals / extensions
  const contractRenewals = useMemo(() => {
    if (!proExtensionMap) return [];
    return Object.values(proExtensionMap).map((ext) => {
      const player = nflPlayerMap?.[ext.NFLPlayerID];
      return {
        extension: ext,
        player,
      };
    });
  }, [proExtensionMap, nflPlayerMap]);

  // Filtered contract renewals
  const filteredRenewals = useMemo(() => {
    if (filterTeam === "ALL") return contractRenewals;
    const teamID = Number(filterTeam);
    return contractRenewals.filter((item) => item.extension.TeamID === teamID);
  }, [contractRenewals, filterTeam]);

  // Section 2: Players with Franchise Tag applied
  const taggedPlayers = useMemo(() => {
    return allNFLPlayers.filter((p) => {
      const ext = proExtensionMap?.[p.ID];
      return Boolean(ext && ext.IsTag);
    });
  }, [allNFLPlayers, proExtensionMap]);

  // Section 3: 1st Round Picks with 4 years experience (entering 5th year)
  const fifthYearCandidates = useMemo(() => {
    return allNFLPlayers
      .filter((p) => {
        const round = Number(p.DraftedRound ?? 0);
        const pick = Number(p.DraftedPick ?? 0);
        const exp = Number(p.Experience ?? 0);
        const isRoundOne = round === 1 || (round === 0 && pick > 0 && pick <= 32);
        return isRoundOne && exp === 4;
      })
      .sort((a, b) => {
        if (a.Experience !== b.Experience) {
          return (a.Experience ?? 0) - (b.Experience ?? 0);
        }
        return (a.DraftedPick ?? 0) - (b.DraftedPick ?? 0);
      });
  }, [allNFLPlayers]);

  const filteredFifthYearCandidates = useMemo(() => {
    if (filterTeam === "ALL") return fifthYearCandidates;
    const teamID = Number(filterTeam);
    return fifthYearCandidates.filter((p) => p.TeamID === teamID);
  }, [fifthYearCandidates, filterTeam]);

  // Team dropdown options
  const teamOptions = useMemo(() => {
    const list = Object.values(proTeamMap || {})
      .sort((a, b) => a.TeamName.localeCompare(b.TeamName))
      .map((t) => ({
        label: `${t.TeamName} ${t.Mascot}`,
        value: t.ID.toString(),
      }));
    return [{ label: "All Teams", value: "ALL" }, ...list];
  }, [proTeamMap]);

  // Actions for 5th-Year Option
  const handleAcceptFifthYear = async (player: NFLPlayer, tagType = 4) => {
    setIsProcessing(player.ID);
    setFeedback(null);
    try {
      await PlayerService.FBATagPlayer({
        PlayerID: player.ID,
        TagType: tagType,
      });
      setAcceptedOptionIds((prev) => new Set(prev).add(player.ID));
      setRejectedOptionIds((prev) => {
        const next = new Set(prev);
        next.delete(player.ID);
        return next;
      });
      await getBootstrapRosterData();
      setFeedback({
        type: "success",
        text: `Successfully accepted 5th-year option for ${player.FirstName} ${player.LastName}!`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to accept 5th-year option.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectFifthYear = async (player: NFLPlayer) => {
    setIsProcessing(player.ID);
    setFeedback(null);
    try {
      setRejectedOptionIds((prev) => new Set(prev).add(player.ID));
      setAcceptedOptionIds((prev) => {
        const next = new Set(prev);
        next.delete(player.ID);
        return next;
      });
      setFeedback({
        type: "success",
        text: `Declined 5th-year option for ${player.FirstName} ${player.LastName}.`,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Failed to decline 5th-year option.",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const getOptionPrice = (
    pos: string,
    tier: "Basic" | "Playtime" | "Franchise" = "Basic",
  ) => {
    const cleanPos = pos?.trim().toUpperCase();
    return tagData[cleanPos]?.[tier] ?? 0;
  };

  return (
    <div className="flex flex-col w-full gap-y-6 p-4">
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-sm font-semibold ${
            feedback.type === "success"
              ? "bg-green-900/40 border-green-500 text-green-300"
              : "bg-red-900/40 border-red-500 text-red-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Top Controls & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-700">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === "renewals" ? "primary" : "secondary"}
            onClick={() => setActiveSection("renewals")}
          >
            Contract Renewals ({contractRenewals.length})
          </Button>
          <Button
            variant={activeSection === "franchiseTag" ? "primary" : "secondary"}
            onClick={() => setActiveSection("franchiseTag")}
          >
            Franchise Tag Costs & Tagged ({taggedPlayers.length})
          </Button>
          <Button
            variant={activeSection === "fifthYear" ? "primary" : "secondary"}
            onClick={() => setActiveSection("fifthYear")}
          >
            1st Round 5th-Year Options ({fifthYearCandidates.length})
          </Button>
          <Button
            variant={activeSection === "priceMatrix" ? "primary" : "secondary"}
            onClick={() => setActiveSection("priceMatrix")}
          >
            Option Price Matrix
          </Button>
        </div>

        <div className="w-64">
          <SelectDropdown
            options={teamOptions}
            value={teamOptions.find((o) => o.value === filterTeam) || null}
            onChange={(opt) => setFilterTeam(opt?.value ?? "ALL")}
            placeholder="Filter by Team"
          />
        </div>
      </div>

      {/* SECTION 1: CONTRACT RENEWALS */}
      {activeSection === "renewals" && (
        <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                League-Wide Contract Renewals & Extensions ({filteredRenewals.length})
              </Text>
              <Text variant="small" classes="text-gray-400">
                Extension offers submitted by teams from their roster management pages.
              </Text>
            </div>
          </div>

          {filteredRenewals.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No active or pending contract renewal offers found for the current season.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300 border-collapse">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-2 border border-gray-700">Player</th>
                    <th className="p-2 border border-gray-700">Position</th>
                    <th className="p-2 border border-gray-700">Team</th>
                    <th className="p-2 border border-gray-700">Length</th>
                    <th className="p-2 border border-gray-700">Y1 Base</th>
                    <th className="p-2 border border-gray-700">Y1 Bonus</th>
                    <th className="p-2 border border-gray-700">Type</th>
                    <th className="p-2 border border-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRenewals.map(({ extension, player }) => {
                    const team = proTeamMap?.[extension.TeamID];
                    return (
                      <tr
                        key={extension.ID || extension.NFLPlayerID}
                        className="border-b border-gray-800 hover:bg-gray-700/30"
                      >
                        <td className="p-2 border border-gray-700 font-semibold text-white">
                          <div className="flex items-center gap-x-2">
                            {team && (
                              <Logo
                                url={getLogo(SimNFL, team.ID, currentUser?.IsRetro)}
                                variant="small"
                                containerClass="w-5 h-5"
                              />
                            )}
                            <span>
                              {player
                                ? `${player.FirstName} ${player.LastName}`
                                : `Player #${extension.NFLPlayerID}`}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 border border-gray-700">
                          {player?.Position || "--"}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {team ? `${team.TeamName} ${team.Mascot}` : extension.Team}
                        </td>
                        <td className="p-2 border border-gray-700 font-mono">
                          {extension.ContractLength} {extension.ContractLength === 1 ? "yr" : "yrs"}
                        </td>
                        <td className="p-2 border border-gray-700 font-mono text-green-400">
                          ${extension.Y1BaseSalary.toFixed(2)}M
                        </td>
                        <td className="p-2 border border-gray-700 font-mono text-yellow-400">
                          ${extension.Y1Bonus.toFixed(2)}M
                        </td>
                        <td className="p-2 border border-gray-700">
                          {extension.IsTag ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-900/60 text-purple-300 border border-purple-700">
                              Tag
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-900/60 text-blue-300 border border-blue-700">
                              Extension
                            </span>
                          )}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {extension.IsAccepted ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-900/60 text-green-300 border border-green-700 font-semibold">
                              Accepted
                            </span>
                          ) : extension.IsActive ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                              Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      )}

      {/* SECTION 2: FRANCHISE TAG COSTS & TAGGED PLAYERS */}
      {activeSection === "franchiseTag" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Tag Cost by Position */}
          <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
            <div className="pb-2 border-b border-gray-700">
              <Text variant="h6" classes="font-bold text-white">
                Franchise Tag Costs by Position
              </Text>
              <Text variant="small" classes="text-gray-400">
                Current season franchise tag amounts by position.
              </Text>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-gray-300 border-collapse">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                  <tr>
                    <th className="p-2 border border-gray-700">Position</th>
                    <th className="p-2 border border-gray-700 text-right">
                      Franchise Tag Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tagData).map(([pos, values]) => (
                    <tr
                      key={pos}
                      className="border-b border-gray-800 hover:bg-gray-700/30"
                    >
                      <td className="p-2 border border-gray-700 font-bold text-white">
                        {pos}
                      </td>
                      <td className="p-2 border border-gray-700 text-right font-mono font-bold text-green-400">
                        ${values.Franchise.toFixed(2)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Border>

          {/* Currently Tagged Players */}
          <Border classes="p-4 flex flex-col gap-y-3 bg-gray-800/40">
            <div className="pb-2 border-b border-gray-700">
              <Text variant="h6" classes="font-bold text-white">
                Tagged Players ({taggedPlayers.length})
              </Text>
              <Text variant="small" classes="text-gray-400">
                Players who have had the franchise tag applied this season.
              </Text>
            </div>

            {taggedPlayers.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                No players currently have a Franchise tag applied.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-sm text-gray-300 border-collapse">
                  <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs sticky top-0">
                    <tr>
                      <th className="p-2 border border-gray-700">Player</th>
                      <th className="p-2 border border-gray-700">Pos</th>
                      <th className="p-2 border border-gray-700">Team</th>
                      <th className="p-2 border border-gray-700">Tag</th>
                      <th className="p-2 border border-gray-700 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taggedPlayers.map((player) => {
                      const team = proTeamMap?.[player.TeamID];
                      const cost = getOptionPrice(player.Position, "Franchise");

                      return (
                        <tr
                          key={player.ID}
                          className="border-b border-gray-800 hover:bg-gray-700/30"
                        >
                          <td className="p-2 border border-gray-700 font-semibold text-white">
                            <div className="flex items-center gap-x-2">
                              {team && (
                                <Logo
                                  url={getLogo(
                                    SimNFL,
                                    team.ID,
                                    currentUser?.IsRetro,
                                  )}
                                  variant="small"
                                  containerClass="w-5 h-5"
                                />
                              )}
                              <span>
                                {player.FirstName} {player.LastName}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 border border-gray-700">
                            {player.Position}
                          </td>
                          <td className="p-2 border border-gray-700">
                            {team ? team.TeamAbbr : `Team #${player.TeamID}`}
                          </td>
                          <td className="p-2 border border-gray-700">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-900/60 text-purple-300 border border-purple-700">
                              Franchise
                            </span>
                          </td>
                          <td className="p-2 border border-gray-700 text-right font-mono font-bold text-green-400">
                            ${cost.toFixed(2)}M
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
      )}

      {/* SECTION 3: 1ST ROUND PICKS (4 YEARS EXPERIENCE) - 5TH YEAR OPTIONS */}
      {activeSection === "fifthYear" && (
        <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="flex justify-between items-center pb-2 border-b border-gray-700">
            <div>
              <Text variant="h6" classes="font-bold text-white">
                1st Round Draft Picks (4 Years Experience) - 5th-Year Options ({filteredFifthYearCandidates.length})
              </Text>
              <Text variant="small" classes="text-gray-400">
                Players drafted in Round 1 with exactly 4 seasons of experience eligible for a 5th-year option.
              </Text>
            </div>
          </div>

          {filteredFifthYearCandidates.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No eligible 1st round draft picks found for the selected filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300 border-collapse">
                <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                  <tr>
                    <th className="p-2 border border-gray-700">Player</th>
                    <th className="p-2 border border-gray-700">Position</th>
                    <th className="p-2 border border-gray-700">Team</th>
                    <th className="p-2 border border-gray-700 text-center">Draft Pick</th>
                    <th className="p-2 border border-gray-700 text-center">Tier</th>
                    <th className="p-2 border border-gray-700 text-right">Basic Option</th>
                    <th className="p-2 border border-gray-700 text-right">Playtime Option</th>
                    <th className="p-2 border border-gray-700 text-center">Status</th>
                    <th className="p-2 border border-gray-700 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFifthYearCandidates.map((player) => {
                    const team = proTeamMap?.[player.TeamID];
                    const basicPrice = getOptionPrice(player.Position, "Basic");
                    const playtimePrice = getOptionPrice(player.Position, "Playtime");
                    const ext = proExtensionMap?.[player.ID];
                    const isAccepted =
                      acceptedOptionIds.has(player.ID) ||
                      Boolean(ext && ext.IsTag && ext.IsAccepted);
                    const isRejected = rejectedOptionIds.has(player.ID);

                    const isPlaytimeQualified = player.TagType === 3;
                    const isProBowlQualified =
                      player.TagType === 1 || player.TagType === 2;

                    return (
                      <tr
                        key={player.ID}
                        className="border-b border-gray-800 hover:bg-gray-700/30"
                      >
                        <td className="p-2 border border-gray-700 font-semibold text-white">
                          <div className="flex items-center gap-x-2">
                            {team && (
                              <Logo
                                url={getLogo(SimNFL, team.ID, currentUser?.IsRetro)}
                                variant="small"
                                containerClass="w-5 h-5"
                              />
                            )}
                            <span>{player.FirstName} {player.LastName}</span>
                          </div>
                        </td>
                        <td className="p-2 border border-gray-700 font-semibold">
                          {player.Position}
                        </td>
                        <td className="p-2 border border-gray-700">
                          {team ? `${team.TeamName} [${team.TeamAbbr}]` : `Team #${player.TeamID}`}
                        </td>
                        <td className="p-2 border border-gray-700 text-center font-mono">
                          R1:P{player.DraftedPick || "?"}
                        </td>
                        <td className="p-2 border border-gray-700 text-center">
                          {isProBowlQualified ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-purple-900/60 text-purple-300 border border-purple-700 font-semibold">
                              Pro Bowl
                            </span>
                          ) : isPlaytimeQualified ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-cyan-900/60 text-cyan-300 border border-cyan-700 font-semibold">
                              Playtime
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700 font-medium">
                              Basic
                            </span>
                          )}
                        </td>
                        <td className="p-2 border border-gray-700 text-right font-mono text-cyan-400">
                          ${basicPrice.toFixed(2)}M
                        </td>
                        <td className="p-2 border border-gray-700 text-right font-mono text-green-400">
                          ${playtimePrice.toFixed(2)}M
                        </td>
                        <td className="p-2 border border-gray-700 text-center">
                          {isAccepted ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-900/60 text-green-300 border border-green-700 font-semibold">
                              Accepted
                            </span>
                          ) : isRejected ? (
                            <span className="px-2 py-0.5 rounded text-xs bg-red-900/60 text-red-300 border border-red-700 font-semibold">
                              Declined
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 text-yellow-300 border border-yellow-700 font-semibold">
                              Eligible
                            </span>
                          )}
                        </td>
                        <td className="p-2 border border-gray-700 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-x-2">
                            <Button
                              size="xs"
                              variant={isAccepted ? "secondary" : "primary"}
                              disabled={isProcessing === player.ID || isAccepted}
                              onClick={() => handleAcceptFifthYear(player, 4)}
                            >
                              {isAccepted ? "Accepted" : "Accept (Basic)"}
                            </Button>
                            <Button
                              size="xs"
                              variant="secondary"
                              disabled={isProcessing === player.ID || isAccepted}
                              onClick={() => handleAcceptFifthYear(player, 3)}
                            >
                              Accept (Playtime)
                            </Button>
                            {!isAccepted && !isRejected && (
                              <Button
                                size="xs"
                                variant="danger"
                                disabled={isProcessing === player.ID}
                                onClick={() => handleRejectFifthYear(player)}
                              >
                                Decline
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      )}

      {/* SECTION 4: 5TH-YEAR OPTION PRICE MATRIX */}
      {activeSection === "priceMatrix" && (
        <Border classes="p-4 flex flex-col gap-y-4 bg-gray-800/40">
          <div className="pb-2 border-b border-gray-700">
            <Text variant="h6" classes="font-bold text-white">
              5th-Year Option & Franchise Tag Price Matrix by Position
            </Text>
            <Text variant="small" classes="text-gray-400">
              Salary amounts based on position group and player qualification tier (in millions).
            </Text>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-2 border border-gray-700">Position Group</th>
                  <th className="p-2 border border-gray-700 text-right">Basic Tier</th>
                  <th className="p-2 border border-gray-700 text-right">Playtime Tier</th>
                  <th className="p-2 border border-gray-700 text-right">Franchise Tag</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tagData).map(([pos, values]) => (
                  <tr
                    key={pos}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="p-2 border border-gray-700 font-bold text-white">
                      {pos}
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono text-cyan-400 font-semibold">
                      ${values.Basic.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono text-blue-400 font-semibold">
                      ${values.Playtime.toFixed(2)}M
                    </td>
                    <td className="p-2 border border-gray-700 text-right font-mono text-green-400 font-bold">
                      ${values.Franchise.toFixed(2)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Border>
      )}
    </div>
  );
};
