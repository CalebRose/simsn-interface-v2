import { useCallback, useEffect, useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import { FreeAgentListItem } from "../../../models/baseball/baseballScoutingModels";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { BaseballSigningModal } from "./BaseballScouting/BaseballSigningModal";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballFreeAgencyPageProps { league: string }

export const BaseballFreeAgencyPage = ({ league }: BaseballFreeAgencyPageProps) => {
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  // ── Data ──
  const [freeAgents, setFreeAgents] = useState<FreeAgentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── Filters ──
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"player_name" | "age" | "position">("player_name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ── Load free agents ──
  const loadFreeAgents = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await BaseballService.GetFreeAgentList();
      setFreeAgents(data ?? []);
    } catch (e) {
      console.error("Failed to load free agents", e);
      setLoadError(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadFreeAgents(); }, [loadFreeAgents]);

  // ── Client-side filtering and sorting ──
  const filteredPlayers = useMemo(() => {
    let list = freeAgents
      .filter((p) => filterType === "all" || p.position === filterType)
      .filter((p) => searchTerm === "" || p.player_name.toLowerCase().includes(searchTerm.toLowerCase()));

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "player_name") cmp = a.player_name.localeCompare(b.player_name);
      else if (sortKey === "age") cmp = a.age - b.age;
      else if (sortKey === "position") cmp = a.position.localeCompare(b.position);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [freeAgents, filterType, searchTerm, sortKey, sortDir]);

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortArrow = (key: string) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  // ── Scouting Modal ──
  const scoutingModal = useModal();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);

  const openScoutingModal = (player: FreeAgentListItem) => {
    setSelectedPlayerId(player.player_id);
    scoutingModal.handleOpenModal();
  };

  // ── Signing Modal ──
  const signingModal = useModal();
  const [signingPlayerName, setSigningPlayerName] = useState("");

  const handleOpenSigning = () => {
    const p = freeAgents.find((pl) => pl.player_id === selectedPlayerId);
    if (p) setSigningPlayerName(p.player_name);
    signingModal.handleOpenModal();
  };

  const handleSigningSuccess = () => {
    signingModal.handleCloseModal();
    scoutingModal.handleCloseModal();
    loadFreeAgents();
  };

  const th = "px-2 py-1 text-xs font-semibold text-left cursor-pointer whitespace-nowrap select-none hover:text-blue-400";

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        <Border classes="p-4 mb-2">
          <Text variant="h4" classes="mb-4">Free Agency</Text>

          {/* Player Type */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">Player Type</Text>
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={filterType === "all"} onClick={() => setFilterType("all")}>
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Pitcher"} onClick={() => setFilterType("Pitcher")}>
                <Text variant="small">Pitcher</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={filterType === "Position"} onClick={() => setFilterType("Position")}>
                <Text variant="small">Position</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Search + Count */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player..."
              className="text-sm border rounded px-2 py-1 w-48 dark:bg-gray-700 dark:border-gray-600"
            />
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              {filteredPlayers.length} players
            </Text>
          </div>
        </Border>

        {/* Table */}
        <Border classes="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">Loading free agents...</Text>
            </div>
          ) : loadError ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">Free agency data is not yet available.</Text>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">No free agents available.</Text>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className={th} onClick={() => handleSort("player_name")}>Name{sortArrow("player_name")}</th>
                    <th className={th} onClick={() => handleSort("age")}>Age{sortArrow("age")}</th>
                    <th className={th} onClick={() => handleSort("position")}>Type{sortArrow("position")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((p) => (
                    <tr
                      key={p.player_id}
                      className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                      onClick={() => openScoutingModal(p)}
                    >
                      <td className="px-2 py-1 font-medium">{p.player_name}</td>
                      <td className="px-2 py-1">{p.age}</td>
                      <td className="px-2 py-1">{p.position === "Pitcher" ? "P" : "Pos"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Border>
      </div>

      {/* Scouting Modal (full visibility for FA) */}
      {selectedPlayerId > 0 && (
        <BaseballScoutingModal
          isOpen={scoutingModal.isModalOpen}
          onClose={scoutingModal.handleCloseModal}
          playerId={selectedPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={null}
          onBudgetChanged={() => {}}
          league="SimMLB"
        />
      )}

      {/* Signing Modal */}
      <BaseballSigningModal
        isOpen={signingModal.isModalOpen}
        onClose={signingModal.handleCloseModal}
        playerId={selectedPlayerId}
        playerName={signingPlayerName}
        poolType="mlb_fa"
        orgId={orgId}
        seasonContext={seasonContext}
        onSuccess={handleSigningSuccess}
      />
    </PageContainer>
  );
};
