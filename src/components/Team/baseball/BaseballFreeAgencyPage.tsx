import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup, Button } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  FAPoolPlayer,
  FAPoolResponse,
  FAPlayerDetailResponse,
  AuctionPhase,
  AuctionBoardEntry,
  PHASE_COLORS,
  FA_TYPE_LABELS,
  type FAType,
} from "../../../models/baseball/baseballFreeAgencyModels";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { SimMLB } from "../../../_constants/constants";
import type { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { FAOfferModal } from "./FreeAgency/FAOfferModal";
import { FASignModal } from "./FreeAgency/FASignModal";
import { FAAuctionBoard } from "./FreeAgency/FAAuctionBoard";
import { FAMarketDashboard } from "./FreeAgency/FAMarketDashboard";
import { FAWaiverWire } from "./FreeAgency/FAWaiverWire";
import "./baseballMobile.css";

// ── Phase badge helper ──
const phaseBadge = (phase: AuctionPhase) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = PHASE_COLORS[phase] ?? "gray";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${colorMap[color]}`}>
      {phase}
    </span>
  );
};

// ── Tab type ──
type FATab = "pool" | "auctions" | "waivers" | "market";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballFreeAgencyPageProps { league: string }

export const BaseballFreeAgencyPage = ({ league }: BaseballFreeAgencyPageProps) => {
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  const gameWeekId = seasonContext?.current_week_index ?? 0;

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<FATab>("pool");

  // ── Pool data ──
  const [poolData, setPoolData] = useState<FAPoolResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── Filters ──
  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [hasAuction, setHasAuction] = useState(false);
  const [filterFAType, setFilterFAType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("lastname");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const perPage = 50;

  // ── Budget ──
  const [signingBudget, setSigningBudget] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<number | null>(null);

  // ── Refresh key for auction board ──
  const [refreshKey, setRefreshKey] = useState(0);

  // ── Search debounce ──
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchTerm(val);
      setPage(1);
    }, 400);
  };

  // ── Load pool ──
  const loadPool = useCallback(async () => {
    if (!orgId || !leagueYearId) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await BaseballService.GetFreeAgentPool({
        viewing_org_id: orgId,
        league_year_id: leagueYearId,
        page,
        per_page: perPage,
        sort: sortKey,
        dir: sortDir,
        ptype: filterType === "all" ? undefined : (filterType as "Pitcher" | "Position"),
        search: searchTerm.length >= 2 ? searchTerm : undefined,
        has_auction: hasAuction ? "true" : undefined,
      });
      setPoolData(data);
    } catch (e) {
      console.error("Failed to load free agent pool", e);
      setLoadError(true);
    }
    setIsLoading(false);
  }, [orgId, leagueYearId, page, perPage, sortKey, sortDir, filterType, searchTerm, hasAuction]);

  useEffect(() => { loadPool(); }, [loadPool]);

  // ── Load signing budget ──
  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    BaseballService.GetFASigningBudget(orgId, leagueYearId)
      .then((res) => setSigningBudget(res.available_budget))
      .catch(() => {});
  }, [orgId, leagueYearId]);

  // ── Sort handling ──
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortArrow = (key: string) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  // ── Scouting budget as ScoutingBudget object for the standard modal ──
  const [scoutingBudgetObj, setScoutingBudgetObj] = useState<ScoutingBudget | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    BaseballService.GetFAScoutingBudget(orgId, leagueYearId)
      .then((res) => {
        setScoutingBudget(res.remaining_points);
        setScoutingBudgetObj({
          org_id: res.org_id,
          league_year_id: leagueYearId,
          total_points: res.total_points,
          spent_points: res.spent_points,
          remaining_points: res.remaining_points,
        });
      })
      .catch(() => {});
  }, [orgId, leagueYearId, budgetRefreshKey]);

  // ── Player Detail Modal ──
  const detailModal = useModal();
  const [selectedPlayerId, setSelectedPlayerId] = useState(0);
  const [faDetail, setFaDetail] = useState<FAPlayerDetailResponse | null>(null);

  const openDetail = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setFaDetail(null);
    detailModal.handleOpenModal();
    // Fetch FA detail for the contract tab
    BaseballService.GetFAPlayerDetail(playerId, orgId, leagueYearId)
      .then(setFaDetail)
      .catch(() => {});
  };

  // ── Offer Modal ──
  const offerModal = useModal();
  const [offerContext, setOfferContext] = useState<{
    playerName: string;
    auctionId: number;
    phase: AuctionPhase;
    demand: FAPoolPlayer["demand"] | null;
    existingOffer: FAPoolPlayer["auction"] extends null ? null : any;
  } | null>(null);

  const openOfferFromPool = (player: FAPoolPlayer) => {
    if (!player.auction) return;
    setOfferContext({
      playerName: `${player.firstname} ${player.lastname}`,
      auctionId: player.auction.auction_id,
      phase: player.auction.phase,
      demand: player.demand,
      existingOffer: player.auction.my_offer,
    });
    offerModal.handleOpenModal();
  };

  const openOfferFromDetail = (detail: FAPlayerDetailResponse) => {
    if (!detail.auction) return;
    setOfferContext({
      playerName: `${detail.bio.firstname} ${detail.bio.lastname}`,
      auctionId: detail.auction.auction_id,
      phase: detail.auction.phase,
      demand: detail.demand,
      existingOffer: detail.auction.my_offer,
    });
    detailModal.handleCloseModal();
    offerModal.handleOpenModal();
  };

  const openOfferFromBoard = (entry: AuctionBoardEntry) => {
    setSelectedPlayerId(entry.player_id);
    setOfferContext({
      playerName: entry.player_name,
      auctionId: entry.auction_id,
      phase: entry.phase,
      demand: {
        min_aav: String(entry.min_aav),
        min_years: entry.min_years,
        max_years: entry.max_years,
        war: entry.war,
      },
      existingOffer: entry.my_offer,
    });
    offerModal.handleOpenModal();
  };

  const handleOfferSuccess = () => {
    loadPool();
    setRefreshKey((k) => k + 1);
    // Refresh budget
    if (orgId && leagueYearId) {
      BaseballService.GetFASigningBudget(orgId, leagueYearId)
        .then((res) => setSigningBudget(res.available_budget))
        .catch(() => {});
    }
  };

  const handleScouted = () => {
    // Refresh scouting budget via the shared effect
    setBudgetRefreshKey((k) => k + 1);
  };

  // ── Sign modal for non-auction FAs ──
  const signModal = useModal();
  const [signTarget, setSignTarget] = useState<FAPoolPlayer | null>(null);

  const openSignModal = (player: FAPoolPlayer) => {
    setSignTarget(player);
    signModal.handleOpenModal();
  };

  // ── Action button for pool row ──
  const actionButton = (player: FAPoolPlayer) => {
    // MLB FA — auction flow
    if (player.fa_type === "mlb_fa") {
      if (!player.auction) {
        return (
          <button
            className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-600/20 text-gray-400 hover:bg-gray-600/40"
            onClick={(e) => { e.stopPropagation(); openDetail(player.id); }}
          >
            View
          </button>
        );
      }
      if (player.auction.my_offer) {
        return (
          <button
            className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"
            onClick={(e) => { e.stopPropagation(); openOfferFromPool(player); }}
          >
            Update
          </button>
        );
      }
      return (
        <button
          className="px-2 py-0.5 rounded text-xs font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/40"
          onClick={(e) => { e.stopPropagation(); openOfferFromPool(player); }}
        >
          Offer
        </button>
      );
    }
    // Non-auction tiers — direct sign (need demand data to show sign form)
    if (!player.demand) {
      return (
        <button
          className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-600/20 text-gray-400 hover:bg-gray-600/40"
          onClick={(e) => { e.stopPropagation(); openDetail(player.id); }}
        >
          View
        </button>
      );
    }
    return (
      <button
        className="px-2 py-0.5 rounded text-xs font-semibold bg-green-600/20 text-green-400 hover:bg-green-600/40"
        onClick={(e) => { e.stopPropagation(); openSignModal(player); }}
      >
        Sign
      </button>
    );
  };

  const allPlayers = poolData?.players ?? [];
  const players = filterFAType === "all"
    ? allPlayers
    : allPlayers.filter((p) => p.fa_type === filterFAType);
  const totalPages = poolData?.pages ?? 1;
  const totalPlayers = poolData?.total ?? 0;

  const th = "px-2 py-1 text-xs font-semibold text-left cursor-pointer whitespace-nowrap select-none hover:text-blue-400";

  return (
    <PageContainer>
      <div className="flex-col w-full px-2 sm:px-4 md:px-0 md:mb-6">
        {/* Header + Budget */}
        <Border classes="p-4 mb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <Text variant="h4">Free Agency</Text>
            <div className="flex gap-4 text-sm">
              {signingBudget != null && (
                <span className="text-gray-300">
                  Budget: <strong className="text-white">${signingBudget.toLocaleString()}</strong>
                </span>
              )}
              {scoutingBudget != null && (
                <span className="text-gray-300">
                  Scout Pts: <strong className="text-white">{scoutingBudget}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-3">
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={activeTab === "pool"} onClick={() => setActiveTab("pool")}>
                <Text variant="small">Free Agent Pool</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={activeTab === "auctions"} onClick={() => setActiveTab("auctions")}>
                <Text variant="small">Auction Board</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={activeTab === "waivers"} onClick={() => setActiveTab("waivers")}>
                <Text variant="small">Waivers</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={activeTab === "market"} onClick={() => setActiveTab("market")}>
                <Text variant="small">Market</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Filters (pool tab only) */}
          {activeTab === "pool" && (
            <>
              <div className="flex flex-wrap gap-3 items-center mb-3">
                <div>
                  <Text variant="xs" classes="text-gray-400 mb-0.5">Type</Text>
                  <ButtonGroup>
                    <PillButton variant="primaryOutline" isSelected={filterType === "all"} onClick={() => { setFilterType("all"); setPage(1); }}>
                      <Text variant="small">All</Text>
                    </PillButton>
                    <PillButton variant="primaryOutline" isSelected={filterType === "Pitcher"} onClick={() => { setFilterType("Pitcher"); setPage(1); }}>
                      <Text variant="small">Pitcher</Text>
                    </PillButton>
                    <PillButton variant="primaryOutline" isSelected={filterType === "Position"} onClick={() => { setFilterType("Position"); setPage(1); }}>
                      <Text variant="small">Position</Text>
                    </PillButton>
                  </ButtonGroup>
                </div>
                <div>
                  <Text variant="xs" classes="text-gray-400 mb-0.5">Filter</Text>
                  <PillButton
                    variant="primaryOutline"
                    isSelected={hasAuction}
                    onClick={() => { setHasAuction(!hasAuction); setPage(1); }}
                  >
                    <Text variant="small">In Auction</Text>
                  </PillButton>
                </div>
                <div>
                  <Text variant="xs" classes="text-gray-400 mb-0.5">FA Tier</Text>
                  <select
                    value={filterFAType}
                    onChange={(e) => { setFilterFAType(e.target.value); setPage(1); }}
                    className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="all">All</option>
                    <option value="mlb_fa">MLB FA</option>
                    <option value="arb">Arb-Eligible</option>
                    <option value="pre_arb">Pre-Arb</option>
                    <option value="milb_fa">MiLB FA</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search player..."
                  className="text-sm border rounded px-2 py-1 w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600"
                />
                <Text variant="small" classes="text-gray-500 dark:text-gray-400">
                  {totalPlayers} players
                </Text>
              </div>
            </>
          )}
        </Border>

        {/* Pool Tab */}
        {activeTab === "pool" && (
          <Border classes="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Text variant="body" classes="text-gray-400">Loading free agents...</Text>
              </div>
            ) : loadError ? (
              <div className="flex items-center justify-center py-12">
                <Text variant="body" classes="text-gray-400">Free agency data is not yet available.</Text>
              </div>
            ) : players.length === 0 ? (
              <Text variant="body-small" classes="text-gray-400">No free agents found.</Text>
            ) : (
              <>
                <div className="baseball-table-wrapper overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className={th} onClick={() => handleSort("lastname")}>Name{sortArrow("lastname")}</th>
                        <th className={th} onClick={() => handleSort("age")}>Age{sortArrow("age")}</th>
                        <th className={th} onClick={() => handleSort("ptype")}>Type{sortArrow("ptype")}</th>
                        <th className={th} onClick={() => handleSort("displayovr")}>OVR{sortArrow("displayovr")}</th>
                        <th className={th}>Tier</th>
                        <th className={th}>Demand</th>
                        <th className={th}>Phase</th>
                        <th className={th}>Offers</th>
                        <th className={th}>My Offer</th>
                        <th className={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-800 hover:bg-gray-700/30 cursor-pointer"
                          onClick={() => openDetail(p.id)}
                        >
                          <td className="px-2 py-1 font-medium">
                            {p.firstname} {p.lastname}
                            {p.scouting.attrs_precise && <span className="ml-1 text-blue-400 text-[10px]" title="Attrs scouted">*</span>}
                          </td>
                          <td className="px-2 py-1">{p.age}</td>
                          <td className="px-2 py-1">{p.ptype === "Pitcher" ? "P" : "Pos"}</td>
                          <td className="px-2 py-1">{p.displayovr ?? "—"}</td>
                          <td className="px-2 py-1">
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                              p.fa_type === "mlb_fa"
                                ? "bg-purple-600/20 text-purple-400"
                                : p.fa_type === "arb"
                                  ? "bg-yellow-600/20 text-yellow-400"
                                  : p.fa_type === "pre_arb"
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "bg-gray-600/20 text-gray-400"
                            }`}>
                              {FA_TYPE_LABELS[p.fa_type] ?? p.fa_type}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            {p.demand
                              ? `$${(parseFloat(p.demand.min_aav) / 1_000_000).toFixed(1)}M`
                              : "—"
                            }
                          </td>
                          <td className="px-2 py-1">
                            {p.auction ? phaseBadge(p.auction.phase) : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="px-2 py-1">
                            {p.auction ? p.auction.offer_count : "—"}
                          </td>
                          <td className="px-2 py-1">
                            {p.auction?.my_offer
                              ? <span className="text-green-400">${(p.auction.my_offer.aav / 1_000_000).toFixed(1)}M</span>
                              : "—"
                            }
                          </td>
                          <td className="px-2 py-1">
                            {actionButton(p)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="primaryOutline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <Text variant="small">Prev</Text>
                    </Button>
                    <Text variant="small" classes="text-gray-400">
                      Page {page} of {totalPages}
                    </Text>
                    <Button
                      size="sm"
                      variant="primaryOutline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      <Text variant="small">Next</Text>
                    </Button>
                  </div>
                )}
              </>
            )}
          </Border>
        )}

        {/* Auction Board Tab */}
        {activeTab === "auctions" && (
          <FAAuctionBoard
            leagueYearId={leagueYearId}
            orgId={orgId}
            onPlayerClick={(entry) => openOfferFromBoard(entry)}
            refreshKey={refreshKey}
          />
        )}

        {/* Waivers Tab */}
        {activeTab === "waivers" && (
          <FAWaiverWire orgId={orgId} leagueYearId={leagueYearId} />
        )}

        {/* Market Tab */}
        {activeTab === "market" && (
          <FAMarketDashboard leagueYearId={leagueYearId} />
        )}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayerId > 0 && (
        <BaseballScoutingModal
          isOpen={detailModal.isModalOpen}
          onClose={detailModal.handleCloseModal}
          playerId={selectedPlayerId}
          orgId={orgId}
          leagueYearId={leagueYearId}
          scoutingBudget={scoutingBudgetObj}
          onBudgetChanged={handleScouted}
          league={SimMLB}
          faDetail={faDetail}
          onMakeOffer={openOfferFromDetail}
        />
      )}

      {/* Offer Modal */}
      {offerContext && (
        <FAOfferModal
          isOpen={offerModal.isModalOpen}
          onClose={offerModal.handleCloseModal}
          playerName={offerContext.playerName}
          auctionId={offerContext.auctionId}
          phase={offerContext.phase}
          demand={offerContext.demand}
          existingOffer={offerContext.existingOffer}
          orgId={orgId}
          leagueYearId={leagueYearId}
          gameWeekId={gameWeekId}
          availableBudget={signingBudget}
          onSuccess={handleOfferSuccess}
        />
      )}

      {/* Direct Sign Modal (non-auction FAs) */}
      {signTarget && (
        <FASignModal
          isOpen={signModal.isModalOpen}
          onClose={signModal.handleCloseModal}
          player={signTarget}
          orgId={orgId}
          leagueYearId={leagueYearId}
          gameWeekId={gameWeekId}
          availableBudget={signingBudget}
          onSuccess={handleOfferSuccess}
        />
      )}
    </PageContainer>
  );
};
