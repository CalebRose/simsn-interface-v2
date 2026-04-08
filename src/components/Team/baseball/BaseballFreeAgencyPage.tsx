import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup, Button } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  FAPoolResponse,
  FAPlayerDetailResponse,
  AuctionPhase,
  AuctionBoardEntry,
} from "../../../models/baseball/baseballFreeAgencyModels";
import type { Player } from "../../../models/baseball/baseballModels";
import { BaseballScoutingModal } from "./BaseballScouting/BaseballScoutingModal";
import { SimMLB } from "../../../_constants/constants";
import type { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { FAOfferModal } from "./FreeAgency/FAOfferModal";
import { FASignModal } from "./FreeAgency/FASignModal";
import { FAAuctionBoard } from "./FreeAgency/FAAuctionBoard";
import { FAMarketDashboard } from "./FreeAgency/FAMarketDashboard";
import { FAWaiverWire } from "./FreeAgency/FAWaiverWire";
import { adaptFAPoolPlayer, type FAPlayer } from "./FreeAgency/faPlayerAdapter";
import {
  AllPlayersTable,
  PositionTable,
  PitcherTable,
  type BaseballCategory,
  type SortConfig,
} from "./BaseballRosterTable";
import "./baseballMobile.css";

// ── Tab type ──
type FATab = "pool" | "auctions" | "waivers" | "market";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballFreeAgencyPageProps { league: string }

export const BaseballFreeAgencyPage = ({ league }: BaseballFreeAgencyPageProps) => {
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const orgId = mlbOrganization?.id ?? 0;
  const orgAbbrev = mlbOrganization?.org_abbrev ?? "";
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
  const [poolCategory, setPoolCategory] = useState<BaseballCategory>("Attributes");
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

  const sortConfig: SortConfig = { key: sortKey, dir: sortDir };

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
    BaseballService.GetFAPlayerDetail(playerId, orgId, leagueYearId)
      .then(setFaDetail)
      .catch(() => {});
  };

  // ── Offer Modal ──
  const offerModal = useModal();
  const [offerContext, setOfferContext] = useState<{
    playerName: string;
    age: number;
    auctionId: number;
    phase: AuctionPhase;
    demand: { min_aav: string; min_years: number; max_years?: number; war: number } | null;
    existingOffer: any;
  } | null>(null);

  const openOfferFromFAPlayer = (p: FAPlayer) => {
    if (!p.auction) return;
    setOfferContext({
      playerName: `${p.firstname} ${p.lastname}`,
      age: p.age,
      auctionId: p.auction.auction_id,
      phase: p.auction.phase,
      demand: p.demand,
      existingOffer: p.auction.my_offer,
    });
    offerModal.handleOpenModal();
  };

  const openOfferFromDetail = (detail: FAPlayerDetailResponse) => {
    if (!detail.auction) return;
    setOfferContext({
      playerName: `${detail.bio.firstname} ${detail.bio.lastname}`,
      age: detail.bio.age,
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
      age: entry.age,
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
    if (orgId && leagueYearId) {
      BaseballService.GetFASigningBudget(orgId, leagueYearId)
        .then((res) => setSigningBudget(res.available_budget))
        .catch(() => {});
    }
  };

  const handleScouted = () => {
    setBudgetRefreshKey((k) => k + 1);
  };

  // ── Sign modal for non-auction FAs ──
  const signModal = useModal();
  const [signTarget, setSignTarget] = useState<FAPlayer | null>(null);

  const openSignModal = (p: FAPlayer) => {
    setSignTarget(p);
    signModal.handleOpenModal();
  };

  // ── Scouting quick action from pool row ──
  const handlePoolScouting = useCallback(async (playerId: number, actionType: "pro_attrs_precise" | "pro_potential_precise") => {
    if (!orgId || !leagueYearId) return;
    try {
      await BaseballService.ScoutFAPlayer({ org_id: orgId, league_year_id: leagueYearId, player_id: playerId, action_type: actionType });
      setBudgetRefreshKey((k) => k + 1);
      loadPool();
    } catch (e) {
      console.error("Scouting failed", e);
    }
  }, [orgId, leagueYearId, loadPool]);

  // ── Action buttons for pool row (scouting + transaction) ──
  const actionBtn =
    "px-2 py-1.5 sm:px-1.5 sm:py-0.5 rounded text-xs sm:text-[11px] min-h-[36px] sm:min-h-0 font-semibold leading-tight whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  const renderPoolActions = useCallback((p: Player) => {
    const fa = p as FAPlayer;
    const attrsScouted = fa.scouting?.attrs_precise;
    const potsScouted = fa.scouting?.pots_precise;

    let transactionBtn: React.ReactNode = null;
    if (fa.fa_type === "mlb_fa") {
      if (!fa.auction) {
        // MLB FA without auction yet — pending creation
        transactionBtn = (
          <button
            className={`${actionBtn} bg-yellow-600/20 text-yellow-400 cursor-default`}
            title="Auction pending \u2014 will open after week processes"
          >
            Pending
          </button>
        );
      } else {
        const phase = fa.auction.phase;
        const myOffer = fa.auction.my_offer;

        if (phase === "completed" || phase === "withdrawn") {
          transactionBtn = <span className={`${actionBtn} bg-gray-600/20 text-gray-500 cursor-default`}>Closed</span>;
        } else if (!myOffer) {
          // No existing offer
          if (phase === "open") {
            transactionBtn = <button className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`} onClick={() => openOfferFromFAPlayer(fa)}>Offer</button>;
          } else {
            // Listening or Finalize — too late to join
            transactionBtn = <span className={`${actionBtn} bg-gray-600/20 text-gray-500 cursor-default`}>Bidding Closed</span>;
          }
        } else if ((myOffer as any).status === "outbid") {
          transactionBtn = <span className={`${actionBtn} bg-red-600/20 text-red-400 cursor-default`}>Eliminated</span>;
        } else if ((myOffer as any).status === "withdrawn") {
          transactionBtn = <span className={`${actionBtn} bg-gray-600/20 text-gray-500 cursor-default`}>Withdrawn</span>;
        } else if (phase === "open") {
          transactionBtn = <button className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`} onClick={() => openOfferFromFAPlayer(fa)}>Update</button>;
        } else {
          // Listening or Finalize — can only raise
          transactionBtn = <button className={`${actionBtn} bg-orange-600/20 text-orange-400 hover:bg-orange-600/40`} onClick={() => openOfferFromFAPlayer(fa)}>Increase</button>;
        }
      }
    } else if (!fa.demand) {
      transactionBtn = <button className={`${actionBtn} bg-gray-600/20 text-gray-400 hover:bg-gray-600/40`} onClick={() => openDetail(fa.id)}>View</button>;
    } else {
      transactionBtn = <button className={`${actionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`} onClick={() => openSignModal(fa)}>Sign</button>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 sm:gap-0.5 items-center">
        <button
          className={`${actionBtn} ${attrsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
          disabled={attrsScouted}
          onClick={attrsScouted ? undefined : () => handlePoolScouting(fa.id, "pro_attrs_precise")}
          title={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
          aria-label={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
        >
          Attrs{attrsScouted ? " \u2713" : ""}
        </button>
        <button
          className={`${actionBtn} ${potsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
          disabled={potsScouted}
          onClick={potsScouted ? undefined : () => handlePoolScouting(fa.id, "pro_potential_precise")}
          title={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
          aria-label={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
        >
          Pots{potsScouted ? " \u2713" : ""}
        </button>
        {transactionBtn}
      </div>
    );
  }, [actionBtn, handlePoolScouting, openDetail, openOfferFromFAPlayer, openSignModal]);

  // ── Adapt pool data to Player shape for roster table reuse ──
  const allRawPlayers = poolData?.players ?? [];
  const filteredRaw = filterFAType === "all"
    ? allRawPlayers
    : allRawPlayers.filter((p) => p.fa_type === filterFAType);
  const players: FAPlayer[] = useMemo(
    () => filteredRaw.map(adaptFAPoolPlayer),
    [filteredRaw],
  );
  const totalPages = poolData?.pages ?? 1;
  const totalPlayers = poolData?.total ?? 0;

  // ── Select the right table component based on filter ──
  const TableComponent = filterType === "Pitcher"
    ? PitcherTable
    : filterType === "Position"
      ? PositionTable
      : AllPlayersTable;

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
              {/* Category pills */}
              <div className="mb-3">
                <ButtonGroup>
                  {(["Attributes", "Potentials"] as BaseballCategory[]).map((cat) => (
                    <PillButton key={cat} variant="primaryOutline" isSelected={poolCategory === cat} onClick={() => setPoolCategory(cat)}>
                      <Text variant="small">{cat}</Text>
                    </PillButton>
                  ))}
                </ButtonGroup>
              </div>

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
                <TableComponent
                  players={players}
                  orgAbbrev={orgAbbrev}
                  onPlayerClick={(p) => openDetail(p.id)}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  category={poolCategory}
                  isFuzzed
                  renderActions={renderPoolActions}
                />

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
          age={offerContext.age}
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
