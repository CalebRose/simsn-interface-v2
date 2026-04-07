import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PillButton, ButtonGroup, Button } from "../../../_design/Buttons";
import { PageContainer } from "../../../_design/Container";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useModal } from "../../../_hooks/useModal";
import { BaseballService } from "../../../_services/baseballService";
import {
  IFA_PHASE_COLORS,
  IFA_OFFER_STATUS_COLORS,
  type IFAState,
  type IFABonusPool,
  type IFAAuctionEntry,
  type IFAEligiblePlayer,
  type IFABoardResponse,
  type IFAAuctionDetail,
  type IFAOrgOffer,
  type IFAAuctionPhase,
  type IFAOfferStatus,
} from "../../../models/baseball/baseballIFAModels";
import { IFAOfferModal } from "./IFA/IFAOfferModal";
import { IFAPlayerDetail } from "./IFA/IFAPlayerDetail";
import { IFAAuctionTable, IFAEligibleTable, type IFACategory } from "./IFA/IFAProspectTable";
import { useSnackbar } from "notistack";
import { BaseballService as ScoutService } from "../../../_services/baseballService";
import "./baseballMobile.css";

// ── Helpers ──

const formatCurrency = (val: number): string => {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toLocaleString()}`;
};

const phaseBadge = (phase: IFAAuctionPhase) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = IFA_PHASE_COLORS[phase] ?? "gray";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${colorMap[color]}`}>
      {phase}
    </span>
  );
};

const offerStatusBadge = (status: IFAOfferStatus) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-600/20 text-green-400",
    blue: "bg-blue-600/20 text-blue-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    red: "bg-red-600/20 text-red-400",
    gray: "bg-gray-600/20 text-gray-400",
  };
  const color = IFA_OFFER_STATUS_COLORS[status] ?? "gray";
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${colorMap[color]}`}>
      {status}
    </span>
  );
};

const starDisplay = (stars: number) => (
  <span className="text-yellow-400" title={`${stars} stars`}>
    {"★".repeat(stars)}
    <span className="text-gray-600">{"★".repeat(5 - stars)}</span>
  </span>
);

// ── Tab type ──
type IFATab = "board" | "myoffers";

// ═══════════════════════════════════════════════
// Main page component
// ═══════════════════════════════════════════════

interface BaseballIFAPageProps { league: string }

export const BaseballIFAPage = ({ league }: BaseballIFAPageProps) => {
  const { mlbOrganization, seasonContext } = useSimBaseballStore();
  const { enqueueSnackbar } = useSnackbar();
  const orgId = mlbOrganization?.id ?? 0;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<IFATab>("board");

  // ── Board data ──
  const [ifaState, setIfaState] = useState<IFAState | null>(null);
  const [pool, setPool] = useState<IFABonusPool | null>(null);
  const [auctions, setAuctions] = useState<IFAAuctionEntry[]>([]);
  const [eligible, setEligible] = useState<IFAEligiblePlayer[]>([]);
  const [orgOffers, setOrgOffers] = useState<IFAOrgOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // ── Category ──
  const [boardCategory, setBoardCategory] = useState<IFACategory>("Attributes");

  // ── Scouting budget ──
  const [scoutingBudget, setScoutingBudget] = useState<number | null>(null);
  const [budgetRefreshKey, setBudgetRefreshKey] = useState(0);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    ScoutService.GetFAScoutingBudget(orgId, leagueYearId)
      .then((res) => setScoutingBudget(res.remaining_points))
      .catch(() => {});
  }, [orgId, leagueYearId, budgetRefreshKey]);

  // ── Filters ──
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStars, setFilterStars] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Search debounce ──
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = (val: string) => {
    setSearchInput(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchTerm(val), 400);
  };

  // ── Load board ──
  const loadBoard = useCallback(async () => {
    if (!orgId || !leagueYearId) return;
    setIsLoading(true);
    setLoadError(false);
    try {
      const boardData = await BaseballService.GetIFABoard(leagueYearId, orgId);
      setIfaState(boardData.state);
      setPool(boardData.pool);
      setAuctions(boardData.auctions);
      // Eligible loaded separately so board still works if this fails
      try {
        const eligibleData = await BaseballService.GetIFAEligible(leagueYearId, orgId);
        setEligible(eligibleData);
      } catch (e) {
        console.error("Failed to load IFA eligible players", e);
        setEligible([]);
      }
    } catch (e) {
      console.error("Failed to load IFA board", e);
      setLoadError(true);
    }
    setIsLoading(false);
  }, [orgId, leagueYearId]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  // ── Scouting action for IFA prospects ──
  const handleIFAScouting = useCallback(async (playerId: number, actionType: "draft_attrs_fuzzed" | "draft_attrs_precise" | "draft_potential_precise") => {
    if (!orgId || !leagueYearId) return;
    try {
      await ScoutService.PerformScoutingAction({ org_id: orgId, league_year_id: leagueYearId, player_id: playerId, action_type: actionType });
      setBudgetRefreshKey((k) => k + 1);
      loadBoard();
    } catch (e) {
      console.error("Scouting failed", e);
    }
  }, [orgId, leagueYearId, loadBoard]);

  // ── Load org offers (for My Offers tab) ──
  const loadOrgOffers = useCallback(async () => {
    if (!orgId || !leagueYearId) return;
    try {
      const offers = await BaseballService.GetIFAOrgOffers(orgId, leagueYearId);
      setOrgOffers(offers);
    } catch (e) {
      console.error("Failed to load org offers", e);
    }
  }, [orgId, leagueYearId]);

  useEffect(() => {
    if (activeTab === "myoffers") loadOrgOffers();
  }, [activeTab, loadOrgOffers]);

  // ── Derive eligible players not yet in auction ──
  const auctionPlayerIds = useMemo(
    () => new Set(auctions.map((a) => a.player_id)),
    [auctions],
  );

  const availableProspects = useMemo(() => {
    let list = eligible.filter((p) => !auctionPlayerIds.has(p.player_id));
    if (filterType !== "all") list = list.filter((p) => p.ptype === filterType);
    if (filterStars !== "all") list = list.filter((p) => p.star_rating === Number(filterStars));
    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term),
      );
    }
    return list;
  }, [eligible, auctionPlayerIds, filterType, filterStars, searchTerm]);

  const filteredAuctions = useMemo(() => {
    let list = [...auctions];
    if (filterType !== "all") list = list.filter((a) => a.ptype === filterType);
    if (filterStars !== "all") list = list.filter((a) => a.star_rating === Number(filterStars));
    if (searchTerm.length >= 2) {
      const term = searchTerm.toLowerCase();
      list = list.filter((a) =>
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(term),
      );
    }
    return list;
  }, [auctions, filterType, filterStars, searchTerm]);

  // ── Start auction ──
  const handleStartAuction = useCallback(async (playerId: number) => {
    try {
      const res = await BaseballService.StartIFAAuction({
        player_id: playerId,
        league_year_id: leagueYearId,
      });
      enqueueSnackbar(`Auction started for ${res.player_name}`, { variant: "success", autoHideDuration: 3000 });
      loadBoard();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to start auction", { variant: "error", autoHideDuration: 4000 });
    }
  }, [leagueYearId, loadBoard, enqueueSnackbar]);

  // ── Offer modal ──
  const offerModal = useModal();
  const [offerContext, setOfferContext] = useState<{
    playerName: string;
    auctionId: number;
    phase: IFAAuctionPhase;
    starRating: number;
    slotValue: number;
    existingOffer: { bonus: number } | null;
  } | null>(null);

  const openOfferFromAuction = (auction: IFAAuctionEntry) => {
    setOfferContext({
      playerName: `${auction.firstName} ${auction.lastName}`,
      auctionId: auction.auction_id,
      phase: auction.phase,
      starRating: auction.star_rating,
      slotValue: auction.slot_value,
      existingOffer: auction.my_offer,
    });
    offerModal.handleOpenModal();
  };

  const openOfferFromDetail = (detail: IFAAuctionDetail) => {
    const myOffer = detail.offers.find((o) => o.is_mine);
    setOfferContext({
      playerName: `${detail.firstName} ${detail.lastName}`,
      auctionId: detail.auction_id,
      phase: detail.phase,
      starRating: detail.star_rating,
      slotValue: detail.slot_value,
      existingOffer: myOffer?.bonus != null ? { bonus: myOffer.bonus } : null,
    });
    detailModal.handleCloseModal();
    offerModal.handleOpenModal();
  };

  const openOfferFromOrgOffer = (offer: IFAOrgOffer) => {
    setOfferContext({
      playerName: `${offer.firstName} ${offer.lastName}`,
      auctionId: offer.auction_id,
      phase: offer.auction_phase,
      starRating: offer.star_rating,
      slotValue: offer.slot_value,
      existingOffer: { bonus: offer.bonus },
    });
    offerModal.handleOpenModal();
  };

  const handleOfferSuccess = () => {
    loadBoard();
    if (activeTab === "myoffers") loadOrgOffers();
  };

  // ── Withdraw ──
  const handleWithdraw = useCallback(async (auctionId: number) => {
    try {
      await BaseballService.WithdrawIFAOffer(auctionId, orgId);
      enqueueSnackbar("Offer withdrawn", { variant: "success", autoHideDuration: 3000 });
      loadBoard();
      if (activeTab === "myoffers") loadOrgOffers();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Withdraw failed", { variant: "error", autoHideDuration: 4000 });
    }
  }, [orgId, loadBoard, loadOrgOffers, activeTab, enqueueSnackbar]);

  // ── Detail modal ──
  const detailModal = useModal();
  const [selectedAuctionId, setSelectedAuctionId] = useState(0);

  const openDetailModal = (auctionId: number) => {
    setSelectedAuctionId(auctionId);
    detailModal.handleOpenModal();
  };

  // ── Status check ──
  const th = "px-2 py-1 text-xs font-semibold text-left whitespace-nowrap select-none";
  const ifaActionBtn =
    "px-2 py-1.5 sm:px-1.5 sm:py-0.5 rounded text-xs sm:text-[11px] min-h-[36px] sm:min-h-0 font-semibold leading-tight whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed transition-colors";
  const isActive = ifaState?.status === "active";
  const isPending = ifaState?.status === "pending";
  const isComplete = ifaState?.status === "complete";

  return (
    <PageContainer>
      <div className="flex-col w-full px-2 sm:px-4 md:px-0 md:mb-6">
        {/* Header + Pool + State */}
        <Border classes="p-4 mb-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <Text variant="h4">International FA</Text>
              {ifaState && (
                <span className="text-sm text-gray-400">
                  Week {ifaState.current_week} of {ifaState.total_weeks}
                </span>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              {pool && (
                <>
                  <span className="text-gray-300">
                    Pool: <strong className="text-white">{formatCurrency(pool.remaining)}</strong>
                    <span className="text-gray-500 ml-1">/ {formatCurrency(pool.total_pool)}</span>
                  </span>
                  <span className="text-gray-300">
                    Rank: <strong className="text-white">#{pool.standing_rank}</strong>
                  </span>
                </>
              )}
              {scoutingBudget != null && (
                <span className="text-gray-300">
                  Scout Pts: <strong className="text-white">{scoutingBudget}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Pool breakdown bar */}
          {pool && (
            <div className="mb-3">
              <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div className="flex h-full">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(pool.spent / pool.total_pool) * 100}%` }}
                    title={`Spent: ${formatCurrency(pool.spent)}`}
                  />
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: `${(pool.committed / pool.total_pool) * 100}%` }}
                    title={`Committed: ${formatCurrency(pool.committed)}`}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-1 text-xs text-gray-400">
                <span><span className="inline-block w-2 h-2 rounded bg-blue-500 mr-1" />Spent: {formatCurrency(pool.spent)}</span>
                <span><span className="inline-block w-2 h-2 rounded bg-yellow-500 mr-1" />Committed: {formatCurrency(pool.committed)}</span>
                <span><span className="inline-block w-2 h-2 rounded bg-gray-600 mr-1" />Available: {formatCurrency(pool.remaining)}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-3">
            <ButtonGroup>
              <PillButton variant="primaryOutline" isSelected={activeTab === "board"} onClick={() => setActiveTab("board")}>
                <Text variant="small">IFA Board</Text>
              </PillButton>
              <PillButton variant="primaryOutline" isSelected={activeTab === "myoffers"} onClick={() => setActiveTab("myoffers")}>
                <Text variant="small">My Offers</Text>
              </PillButton>
            </ButtonGroup>
          </div>

          {/* Filters (board tab only) */}
          {activeTab === "board" && (
            <>
            {/* Category pills */}
            <div className="mb-3">
              <ButtonGroup>
                {(["Attributes", "Potentials", "IFA Info"] as IFACategory[]).map((cat) => (
                  <PillButton key={cat} variant="primaryOutline" isSelected={boardCategory === cat} onClick={() => setBoardCategory(cat)}>
                    <Text variant="small">{cat}</Text>
                  </PillButton>
                ))}
              </ButtonGroup>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <Text variant="xs" classes="text-gray-400 mb-0.5">Type</Text>
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
              <div>
                <Text variant="xs" classes="text-gray-400 mb-0.5">Stars</Text>
                <select
                  value={filterStars}
                  onChange={(e) => setFilterStars(e.target.value)}
                  className="text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="all">All</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div>
                <Text variant="xs" classes="text-gray-400 mb-0.5">Search</Text>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Search player..."
                  className="text-sm border rounded px-2 py-1 w-full sm:w-48 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            </>
          )}
        </Border>

        {/* Pending / Complete banners */}
        {isPending && (
          <Border classes="p-6 mb-2">
            <Text variant="body" classes="text-gray-400 text-center">
              The IFA signing window has not started yet.
            </Text>
          </Border>
        )}

        {isComplete && !isLoading && (
          <Border classes="p-3 mb-2">
            <Text variant="small" classes="text-yellow-400 text-center">
              The IFA signing window is complete. Showing final results (read-only).
            </Text>
          </Border>
        )}

        {/* Board Tab */}
        {activeTab === "board" && !isPending && (
          <>
            {isLoading ? (
              <Border classes="p-6">
                <Text variant="body" classes="text-gray-400 text-center">Loading IFA board...</Text>
              </Border>
            ) : loadError ? (
              <Border classes="p-6">
                <Text variant="body" classes="text-gray-400 text-center">IFA data is not yet available.</Text>
              </Border>
            ) : (
              <>
                {/* Active Auctions */}
                <Border classes="p-4 mb-2">
                  <Text variant="h6" classes="mb-2">Active Auctions ({filteredAuctions.length})</Text>
                  <IFAAuctionTable
                    auctions={filteredAuctions}
                    category={boardCategory}
                    filterType={filterType}
                    onRowClick={openDetailModal}
                    renderActions={(a) => {
                      const attrsScouted = a.scouting?.attrs_precise;
                      const potsScouted = a.scouting?.pots_precise;
                      return (
                        <div className="flex flex-wrap gap-1.5 sm:gap-0.5 items-center">
                          <button
                            className={`${ifaActionBtn} ${attrsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
                            disabled={attrsScouted}
                            onClick={attrsScouted ? undefined : () => handleIFAScouting(a.player_id, "draft_attrs_precise")}
                            title={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
                            aria-label={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
                          >
                            Attrs{attrsScouted ? " ✓" : ""}
                          </button>
                          <button
                            className={`${ifaActionBtn} ${potsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
                            disabled={potsScouted}
                            onClick={potsScouted ? undefined : () => handleIFAScouting(a.player_id, "draft_potential_precise")}
                            title={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
                            aria-label={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
                          >
                            Pots{potsScouted ? " ✓" : ""}
                          </button>
                          {isActive && a.phase !== "completed" && (
                            <button
                              className={`${ifaActionBtn} ${a.my_offer ? "bg-orange-600/20 text-orange-400 hover:bg-orange-600/40" : "bg-green-600/20 text-green-400 hover:bg-green-600/40"}`}
                              onClick={() => openOfferFromAuction(a)}
                              title={a.my_offer ? "Update Offer" : "Make Offer"}
                              aria-label={a.my_offer ? "Update Offer" : "Make Offer"}
                            >
                              {a.my_offer ? "Update" : "Offer"}
                            </button>
                          )}
                        </div>
                      );
                    }}
                  />
                </Border>

                {/* Available Prospects (no auction yet) */}
                {isActive && (
                  <Border classes="p-4">
                    <Text variant="h6" classes="mb-2">Available Prospects ({availableProspects.length})</Text>
                    <IFAEligibleTable
                      prospects={availableProspects}
                      category={boardCategory}
                      filterType={filterType}
                      renderActions={(p) => {
                        const attrsScouted = p.scouting?.attrs_precise;
                        const potsScouted = p.scouting?.pots_precise;
                        return (
                          <div className="flex flex-wrap gap-1.5 sm:gap-0.5 items-center">
                            <button
                              className={`${ifaActionBtn} ${attrsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
                              disabled={attrsScouted}
                              onClick={attrsScouted ? undefined : () => handleIFAScouting(p.player_id, "draft_attrs_precise")}
                              title={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
                              aria-label={attrsScouted ? "Already scouted" : "Scout Precise Attributes"}
                            >
                              Attrs{attrsScouted ? " ✓" : ""}
                            </button>
                            <button
                              className={`${ifaActionBtn} ${potsScouted ? "bg-gray-600/20 text-gray-500 line-through cursor-not-allowed" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"}`}
                              disabled={potsScouted}
                              onClick={potsScouted ? undefined : () => handleIFAScouting(p.player_id, "draft_potential_precise")}
                              title={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
                              aria-label={potsScouted ? "Already scouted" : "Scout Precise Potentials"}
                            >
                              Pots{potsScouted ? " ✓" : ""}
                            </button>
                            <button
                              className={`${ifaActionBtn} bg-green-600/20 text-green-400 hover:bg-green-600/40`}
                              onClick={() => handleStartAuction(p.player_id)}
                              title="Start Auction"
                              aria-label="Start Auction"
                            >
                              Start Auction
                            </button>
                          </div>
                        );
                      }}
                    />
                  </Border>
                )}
              </>
            )}
          </>
        )}

        {/* My Offers Tab */}
        {activeTab === "myoffers" && (
          <Border classes="p-4">
            <Text variant="h6" classes="mb-2">My IFA Offers</Text>
            {orgOffers.length === 0 ? (
              <Text variant="small" classes="text-gray-400">You have no IFA offers.</Text>
            ) : (
              <div className="baseball-table-wrapper overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className={th}>Stars</th>
                      <th className={th}>Player</th>
                      <th className={th}>Age</th>
                      <th className={th}>Type</th>
                      <th className={th}>Bonus</th>
                      <th className={th}>Status</th>
                      <th className={th}>Auction</th>
                      <th className={th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgOffers.map((o) => (
                      <tr key={o.offer_id} className="border-b border-gray-800 hover:bg-gray-700/30">
                        <td className="px-2 py-1">{starDisplay(o.star_rating)}</td>
                        <td className="px-2 py-1 font-medium">{o.firstName} {o.lastName}</td>
                        <td className="px-2 py-1">{o.age}</td>
                        <td className="px-2 py-1">{o.ptype === "Pitcher" ? "P" : "Pos"}</td>
                        <td className="px-2 py-1 text-green-400 font-semibold">{formatCurrency(o.bonus)}</td>
                        <td className="px-2 py-1">{offerStatusBadge(o.status)}</td>
                        <td className="px-2 py-1">{phaseBadge(o.auction_phase)}</td>
                        <td className="px-2 py-1">
                          {o.status === "active" && o.auction_phase !== "completed" && isActive ? (
                            <button
                              className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/40"
                              onClick={() => openOfferFromOrgOffer(o)}
                            >
                              Update
                            </button>
                          ) : o.status === "won" ? (
                            <span className="text-blue-400 text-xs font-semibold">Signed!</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Border>
        )}
      </div>

      {/* Auction Detail Modal */}
      {selectedAuctionId > 0 && (
        <IFAPlayerDetail
          isOpen={detailModal.isModalOpen}
          onClose={detailModal.handleCloseModal}
          auctionId={selectedAuctionId}
          orgId={orgId}
          ifaStatus={ifaState?.status ?? "pending"}
          onMakeOffer={openOfferFromDetail}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* Offer Modal */}
      {offerContext && (
        <IFAOfferModal
          isOpen={offerModal.isModalOpen}
          onClose={offerModal.handleCloseModal}
          playerName={offerContext.playerName}
          auctionId={offerContext.auctionId}
          phase={offerContext.phase}
          starRating={offerContext.starRating}
          slotValue={offerContext.slotValue}
          existingOffer={offerContext.existingOffer}
          orgId={orgId}
          leagueYearId={leagueYearId}
          poolRemaining={pool?.remaining ?? 0}
          onSuccess={handleOfferSuccess}
        />
      )}
    </PageContainer>
  );
};
