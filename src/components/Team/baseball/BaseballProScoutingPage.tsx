import { useCallback, useState } from "react";
import { Attributes, Potentials } from "../../../_constants/constants";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { resolveDisplayValue, displayLevel } from "../../../_utility/baseballHelpers";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import { MlbPoolResponse, PoolPlayer, ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { usePoolTable } from "./BaseballScouting/usePoolTable";
import { PoolPagination } from "./BaseballScouting/PoolPagination";
import { ScoutingBudgetBar } from "./BaseballScouting/ScoutingBudgetBar";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { BaseballSigningModal } from "./BaseballScouting/BaseballSigningModal";

// ── Attribute columns by player type ──

const ALL_ATTR = [
  { key: "contact_base", label: "CON" },
  { key: "power_base", label: "POW" },
  { key: "speed_base", label: "SPD" },
];
const POS_ATTR = [
  { key: "contact_base", label: "CON" },
  { key: "power_base", label: "POW" },
  { key: "eye_base", label: "EYE" },
  { key: "speed_base", label: "SPD" },
  { key: "fieldcatch_base", label: "FC" },
  { key: "throwpower_base", label: "TP" },
];
const PITCH_ATTR = [
  { key: "pthrowpower_base", label: "VEL" },
  { key: "pgencontrol_base", label: "CTRL" },
  { key: "pendurance_base", label: "END" },
  { key: "psequencing_base", label: "SEQ" },
];

// ── Potential columns by player type ──

const ALL_POT = [
  { key: "contact_base", label: "CON" },
  { key: "power_base", label: "POW" },
  { key: "speed_base", label: "SPD" },
];
const POS_POT = [
  { key: "contact_base", label: "CON" },
  { key: "power_base", label: "POW" },
  { key: "eye_base", label: "EYE" },
  { key: "speed_base", label: "SPD" },
];
const PITCH_POT = [
  { key: "pthrowpower_base", label: "VEL" },
  { key: "pgencontrol_base", label: "CTRL" },
  { key: "pendurance_base", label: "END" },
];

type ViewMode = typeof Attributes | typeof Potentials;

interface BaseballProScoutingPageProps { league: string }

export const BaseballProScoutingPage = (_props: BaseballProScoutingPageProps) => {
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  // ── Server-side pool table ──
  const fetcher = useCallback(
    (params: Record<string, any>) => BaseballService.GetMlbPool({ ...params, viewing_org_id: orgId }) as Promise<MlbPoolResponse>,
    [orgId],
  );
  const pool = usePoolTable<PoolPlayer, MlbPoolResponse>(fetcher, {
    defaultSort: "lastname",
    defaultDir: "asc",
    defaultPerPage: 50,
  });

  const levelCounts: Record<string, number> = pool.meta.level_counts ?? {};

  // ── View toggle ──
  const [viewMode, setViewMode] = useState<ViewMode>(Attributes);

  // ── Scouting budget ──
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);

  // ── Scouting Modal ──
  const scoutingModal = useModal();
  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(0);

  const openScoutingModal = (player: PoolPlayer) => {
    setSelectedPlayerId(player.id);
    scoutingModal.handleOpenModal();
  };

  // ── Signing Modal ──
  const signingModal = useModal();
  const [signingPlayerName, setSigningPlayerName] = useState("");

  const handleOpenSigning = () => {
    const p = pool.data.find((pl) => pl.id === selectedPlayerId);
    if (p) setSigningPlayerName(`${p.firstname} ${p.lastname}`);
    signingModal.handleOpenModal();
  };

  const handleSigningSuccess = () => {
    signingModal.handleCloseModal();
    scoutingModal.handleCloseModal();
    pool.refresh();
    setBudgetRefreshKey((k) => k + 1);
  };

  // ── Sort indicator ──
  const sortArrow = (key: string) => {
    if (pool.sortKey !== key) return "";
    return pool.sortDir === "asc" ? " ▲" : " ▼";
  };

  // ── Which columns to display ──
  const ptypeFilter = pool.filters.ptype;
  const attrCols = ptypeFilter === "Pitcher" ? PITCH_ATTR : ptypeFilter === "Position" ? POS_ATTR : ALL_ATTR;
  const potCols = ptypeFilter === "Pitcher" ? PITCH_POT : ptypeFilter === "Position" ? POS_POT : ALL_POT;
  const displayCols = viewMode === Attributes ? attrCols : potCols;

  const th = "px-2 py-1 text-xs font-semibold text-left cursor-pointer whitespace-nowrap select-none hover:text-blue-400";
  const td = "px-2 py-1";

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        <Border classes="p-4 mb-2">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <Text variant="h4">MLB Scouting</Text>
            {orgId > 0 && leagueYearId > 0 && (
              <ScoutingBudgetBar
                orgId={orgId}
                leagueYearId={leagueYearId}
                onBudgetLoaded={setScoutingBudget}
                refreshKey={budgetRefreshKey}
              />
            )}
          </div>

          {/* Level Selector */}
          {Object.keys(levelCounts).length > 0 && (
            <div className="mb-4">
              <Text variant="small" classes="font-semibold mb-2">Level</Text>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => pool.setFilter("level", undefined)}
                  className={`flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-all cursor-pointer min-w-[6rem]
                    ${!pool.filters.level
                      ? "border-blue-500 bg-blue-500/10 shadow-sm"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
                    }`}
                >
                  <span className={`text-sm font-medium ${!pool.filters.level ? "text-blue-400" : ""}`}>All</span>
                  <span className="text-xs text-gray-400">{pool.totalCount}</span>
                </button>
                {Object.entries(levelCounts)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([level, count]) => {
                    const isSelected = pool.filters.level === Number(level);
                    return (
                      <button
                        key={level}
                        onClick={() => pool.setFilter("level", Number(level))}
                        className={`flex flex-col items-center px-4 py-2 rounded-lg border-2 transition-all cursor-pointer min-w-[6rem]
                          ${isSelected
                            ? "border-blue-500 bg-blue-500/10 shadow-sm"
                            : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-gray-800"
                          }`}
                      >
                        <span className={`text-sm font-medium ${isSelected ? "text-blue-400" : ""}`}>{displayLevel(level)}</span>
                        <span className="text-xs text-gray-400">{count} players</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Player Type */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">Player Type</Text>
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={!pool.filters.ptype} onClick={() => pool.setFilter("ptype", undefined)}>
                <Text variant="small">All</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={pool.filters.ptype === "Pitcher"} onClick={() => pool.setFilter("ptype", "Pitcher")}>
                <Text variant="small">Pitcher</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={pool.filters.ptype === "Position"} onClick={() => pool.setFilter("ptype", "Position")}>
                <Text variant="small">Position</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* View Toggle */}
          <div className="mb-3">
            <Text variant="small" classes="font-semibold mb-1">View</Text>
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={viewMode === Attributes} onClick={() => setViewMode(Attributes)}>
                <Text variant="small">Attributes</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={viewMode === Potentials} onClick={() => setViewMode(Potentials)}>
                <Text variant="small">Potentials</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Search + Count */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={pool.search}
              onChange={(e) => pool.setSearch(e.target.value)}
              placeholder="Search player..."
              className="text-sm border rounded px-2 py-1 w-48 dark:bg-gray-700 dark:border-gray-600"
            />
            <Text variant="small" classes="text-gray-500 dark:text-gray-400">
              {pool.totalCount} players
            </Text>
          </div>
        </Border>

        {/* Pool Table */}
        <Border classes="p-4">
          {pool.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">Loading players...</Text>
            </div>
          ) : pool.error ? (
            <div className="flex items-center justify-center py-12">
              <Text variant="body" classes="text-gray-500 dark:text-gray-400">MLB scouting data is not yet available.</Text>
            </div>
          ) : pool.data.length === 0 ? (
            <Text variant="body-small" classes="text-gray-500 dark:text-gray-400">No players found.</Text>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className={th} onClick={() => pool.setSort("lastname")}>Name{sortArrow("lastname")}</th>
                      <th className={th} onClick={() => pool.setSort("age")}>Age{sortArrow("age")}</th>
                      <th className={th} onClick={() => pool.setSort("ptype")}>Type{sortArrow("ptype")}</th>
                      <th className={th}>Org</th>
                      <th className={th}>Level</th>
                      <th className={th} onClick={() => pool.setSort("area")}>Area{sortArrow("area")}</th>
                      <th className={th} onClick={() => pool.setSort("height")}>Ht{sortArrow("height")}</th>
                      <th className={th} onClick={() => pool.setSort("weight")}>Wt{sortArrow("weight")}</th>
                      <th className={th}>B/T</th>
                      {ptypeFilter === "Pitcher" && (
                        <>
                          <th className={th}>P1</th>
                          <th className={th}>P2</th>
                          <th className={th}>P3</th>
                        </>
                      )}
                      {displayCols.map((col) => (
                        <th key={col.key} className={th} onClick={() => pool.setSort(col.key)}>
                          {col.label}{viewMode === Potentials ? " Pot" : ""}{sortArrow(col.key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pool.data.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                        onClick={() => openScoutingModal(p)}
                      >
                        <td className={`${td} font-medium`}>{p.firstname} {p.lastname}</td>
                        <td className={td}>{p.age}</td>
                        <td className={td}>{p.ptype === "Pitcher" ? "P" : "Pos"}</td>
                        <td className={`${td} text-xs`}>{p.org_abbrev}</td>
                        <td className={`${td} text-xs`}>{displayLevel(String(p.current_level))}</td>
                        <td className={`${td} text-xs`}>{p.area}</td>
                        <td className={td}>{`${Math.floor(p.height / 12)}'${p.height % 12}"`}</td>
                        <td className={td}>{p.weight}</td>
                        <td className={td}>{p.bat_hand ?? "—"}/{p.pitch_hand ?? "—"}</td>
                        {ptypeFilter === "Pitcher" && (
                          <>
                            <td className={`${td} text-xs`}>{p.pitch1_name?.split(" ")[0] ?? "—"}</td>
                            <td className={`${td} text-xs`}>{p.pitch2_name?.split(" ")[0] ?? "—"}</td>
                            <td className={`${td} text-xs`}>{p.pitch3_name?.split(" ")[0] ?? "—"}</td>
                          </>
                        )}
                        {displayCols.map((col) => {
                          const rawKey = viewMode === Potentials ? col.key.replace("_base", "_pot") : col.key;
                          const raw = p[rawKey];
                          if (raw == null || raw === "?") return <td key={col.key} className={`${td} text-center text-gray-500`}>?</td>;
                          const resolved = resolveDisplayValue(raw);
                          return (
                            <td key={col.key} className={`${td} text-center font-semibold ${resolved.colorClass}`}>
                              {resolved.text}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PoolPagination page={pool.page} totalPages={pool.totalPages} onPageChange={pool.setPage} />
            </>
          )}
        </Border>
      </div>

      {/* Scouting Modal */}
      {selectedPlayerId > 0 && (
        <BaseballScoutingModal
          isOpen={scoutingModal.isModalOpen}
          onClose={scoutingModal.handleCloseModal}
          playerId={selectedPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={() => setBudgetRefreshKey((k) => k + 1)}
          league="SimMLB"
        />
      )}

      {/* Signing Modal */}
      <BaseballSigningModal
        isOpen={signingModal.isModalOpen}
        onClose={signingModal.handleCloseModal}
        playerId={selectedPlayerId}
        playerName={signingPlayerName}
        poolType="pro"
        orgId={orgId}
        seasonContext={seasonContext}
        onSuccess={handleSigningSuccess}
      />
    </PageContainer>
  );
};
