import { useState, useMemo, useCallback } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  NFLDraftPick,
  NFLPlayer,
  NFLTradeProposal,
} from "../../../models/footballModels";
import {
  DraftPick,
  ProfessionalPlayer,
  TradeProposal,
} from "../../../models/hockeyModels";
import { League, SimNFL } from "../../../_constants/constants";
import { useFirestore, firestore } from "../../../firebase/firebase";
import { TradeService } from "../../../_services/tradeService";

// ----- Types ----------------------------------------------------------------

export type AnyTradeProposal = NFLTradeProposal | TradeProposal;
type AnyPlayer = NFLPlayer | ProfessionalPlayer;
type AnyDraftPick = NFLDraftPick | DraftPick;

export interface WarRoomDoc {
  id: string;
  sentRequests: AnyTradeProposal[];
  requests: AnyTradeProposal[];
}

interface ApprovedTradesDoc {
  approvedRequests: AnyTradeProposal[];
}

export interface DraftTradeStateProps {
  league: League;
  /** Firestore collection + doc for the admin approved-trades queue */
  ApprovedTradesCollectionName: string;
  ApprovedTradesDocName: string;
  /** Firestore collection where each team's war-room doc lives */
  WarRoomCollectionName: string;
  /**
   * Firestore document ID for the current user's war-room.
   * For NFL this is the team abbreviation/name string used as the doc key.
   */
  UserWarRoomDocName: string;
}

// ----- Helpers --------------------------------------------------------------

/** Resolve the Firestore war-room doc ID for a trade proposal's sending team */
const getSenderDocID = (item: AnyTradeProposal): string => {
  const nfl = item as NFLTradeProposal;
  if (nfl.NFLTeam) return nfl.NFLTeam;
  const phl = item as TradeProposal;
  return phl.TeamID?.toString() ?? "";
};

/** Resolve the Firestore war-room doc ID for a trade proposal's receiving team */
const getRecipientDocID = (item: AnyTradeProposal): string => {
  const nfl = item as NFLTradeProposal;
  if (nfl.RecepientTeam) return nfl.RecepientTeam;
  const phl = item as TradeProposal;
  return phl.RecepientTeamID?.toString() ?? "";
};

const generateUniqueID = (): string =>
  `trade_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// ----- Class (kept for compatibility) ---------------------------------------

export class DraftTradeState {
  [key: string]: any;
  tradeCollection: any[];

  constructor() {
    this.tradeCollection = [];
  }
}

// ----- Hook -----------------------------------------------------------------

export const useDraftTradeState = ({
  league,
  ApprovedTradesCollectionName,
  ApprovedTradesDocName,
  WarRoomCollectionName,
  UserWarRoomDocName,
}: DraftTradeStateProps) => {
  const isNFL = league === SimNFL;

  // Both stores must be called unconditionally (Rules of Hooks)
  const nflStore = useSimFBAStore();
  const hckStore = useSimHCKStore();

  // ---- Firestore subscriptions -------------------------------------------

  /**
   * Admin approved-trades queue (e.g. nfldraftstate / UCNjOhC0hbqZhl1BWBy6).
   * Mirrors `approvedTrades` / `updateApprovedTrades` from the original page.
   */
  const [approvedTradesData, updateApprovedTrades] =
    useFirestore<ApprovedTradesDoc>(
      ApprovedTradesCollectionName,
      ApprovedTradesDocName,
    );

  /**
   * The current user's own war-room document.
   * Mirrors the `tradeWarRoom` (the user slice of `tradeCollection`) from the
   * original page, giving a live view of `sentRequests` and `requests`.
   */
  const [userWarRoomData, updateUserWarRoom] = useFirestore<WarRoomDoc>(
    WarRoomCollectionName,
    UserWarRoomDocName,
  );

  // ---- Local UI state ----------------------------------------------------

  const [tradePartnerTeamID, setTradePartnerTeamID] = useState<number>(0);

  // ---- League-resolved context values ------------------------------------

  const userTeam = useMemo(
    () => (isNFL ? (nflStore.nflTeam ?? null) : (hckStore.phlTeam ?? null)),
    [isNFL, nflStore.nflTeam, hckStore.phlTeam],
  );

  const userTeamID = userTeam?.ID ?? 0;

  const teamMap = useMemo(
    () => (isNFL ? nflStore.proTeamMap : hckStore.phlTeamMap),
    [isNFL, nflStore.proTeamMap, hckStore.phlTeamMap],
  );

  const teamOptions = useMemo(
    () => (isNFL ? nflStore.nflTeamOptions : hckStore.phlTeamOptions),
    [isNFL, nflStore.nflTeamOptions, hckStore.phlTeamOptions],
  );

  const rosterMap = useMemo(
    () =>
      (isNFL ? nflStore.proRosterMap : hckStore.proRosterMap) as Record<
        number,
        AnyPlayer[]
      >,
    [isNFL, nflStore.proRosterMap, hckStore.proRosterMap],
  );

  const draftPickMap = useMemo(
    () =>
      (isNFL ? nflStore.nflDraftPickMap : hckStore.phlDraftPickMap) as Record<
        number,
        AnyDraftPick[]
      >,
    [isNFL, nflStore.nflDraftPickMap, hckStore.phlDraftPickMap],
  );

  const tradeProposalsMap = useMemo(
    () =>
      (isNFL
        ? nflStore.tradeProposalsMap
        : hckStore.tradeProposalsMap) as Record<number, AnyTradeProposal[]>,
    [isNFL, nflStore.tradeProposalsMap, hckStore.tradeProposalsMap],
  );

  // ---- Derived / memoized state ------------------------------------------

  /** Approved requests currently waiting in the admin queue */
  const approvedRequests: AnyTradeProposal[] = useMemo(
    () => approvedTradesData?.approvedRequests ?? [],
    [approvedTradesData],
  );

  const tradePartnerTeam = useMemo(
    () =>
      teamMap && tradePartnerTeamID > 0
        ? (teamMap[tradePartnerTeamID] ?? null)
        : null,
    [teamMap, tradePartnerTeamID],
  );

  const userTradablePlayers = useMemo(
    () => (rosterMap && userTeamID > 0 ? (rosterMap[userTeamID] ?? []) : []),
    [rosterMap, userTeamID],
  );

  const userTradablePicks = useMemo(
    () =>
      draftPickMap && userTeamID > 0 ? (draftPickMap[userTeamID] ?? []) : [],
    [draftPickMap, userTeamID],
  );

  const partnerTradablePlayers = useMemo(
    () =>
      rosterMap && tradePartnerTeamID > 0
        ? (rosterMap[tradePartnerTeamID] ?? [])
        : [],
    [rosterMap, tradePartnerTeamID],
  );

  const partnerTradablePicks = useMemo(
    () =>
      draftPickMap && tradePartnerTeamID > 0
        ? (draftPickMap[tradePartnerTeamID] ?? [])
        : [],
    [draftPickMap, tradePartnerTeamID],
  );

  /** Whether the user can propose a trade (partner selected and not the user's own team) */
  const canProposeTrade = useMemo(
    () => tradePartnerTeamID > 0 && tradePartnerTeamID !== userTeamID,
    [tradePartnerTeamID, userTeamID],
  );

  /** All trade proposals that involve the user's team (from the REST context) */
  const userTradeProposals = useMemo(
    () =>
      tradeProposalsMap && userTeamID > 0
        ? (tradeProposalsMap[userTeamID] ?? [])
        : [],
    [tradeProposalsMap, userTeamID],
  );

  // ---- Helpers -----------------------------------------------------------

  /** Returns a Firestore DocumentReference for any team's war-room doc */
  const getWarRoomDocRef = useCallback(
    (teamDocID: string) => doc(firestore, WarRoomCollectionName, teamDocID),
    [WarRoomCollectionName],
  );

  const selectTradePartner = useCallback((teamID: number) => {
    setTradePartnerTeamID(teamID);
  }, []);

  // ---- Firebase trade operations -----------------------------------------
  // These mirror ProposeTrade / AcceptTrade / RejectTrade / VetoTrade from
  // NFLDraftPage.js — purely Firestore, no REST API calls.

  /**
   * ProposeTrade — mirrors original `ProposeTrade(dto, modalDTO)`.
   * Stamps a unique ID, pushes the proposal into:
   *   • user's war-room `sentRequests`
   *   • partner's war-room `requests`
   *
   * Uses arrayUnion so concurrent updates from other clients are safe.
   */
  const handleProposeTrade = useCallback(
    async (modalDTO: AnyTradeProposal) => {
      const newDTO = {
        ...modalDTO,
        ID: generateUniqueID(),
      } as unknown as AnyTradeProposal;

      const recipientDocID = getRecipientDocID(newDTO);
      if (!recipientDocID) return;

      // 1. Add to user's sentRequests
      await updateUserWarRoom({ sentRequests: arrayUnion(newDTO) as any });

      // 2. Add to partner's requests (direct update — no subscription needed)
      await updateDoc(getWarRoomDocRef(recipientDocID), {
        requests: arrayUnion(newDTO),
      });
    },
    [updateUserWarRoom, getWarRoomDocRef],
  );

  /**
   * AcceptTrade — mirrors original `AcceptTrade(item)`.
   * Removes the proposal from both war-rooms and pushes it into the admin
   * approved-trades queue (`approvedTradesData.approvedRequests`).
   */
  const handleAcceptTrade = useCallback(
    async (item: AnyTradeProposal) => {
      const senderDocID = getSenderDocID(item);
      const recipientDocID = getRecipientDocID(item);
      if (!senderDocID || !recipientDocID) return;

      // Remove from sender's sentRequests
      await updateDoc(getWarRoomDocRef(senderDocID), {
        sentRequests: arrayRemove(item),
      });

      // Remove from recipient's requests
      await updateDoc(getWarRoomDocRef(recipientDocID), {
        requests: arrayRemove(item),
      });

      // Push into admin approved queue
      const updatedQueue = [...approvedRequests, item];
      await updateApprovedTrades({ approvedRequests: updatedQueue as any });
    },
    [approvedRequests, updateApprovedTrades, getWarRoomDocRef],
  );

  /**
   * RejectTrade — mirrors original `RejectTrade(item)`.
   * Removes the proposal from both war-rooms; no admin queue update.
   */
  const handleRejectTrade = useCallback(
    async (item: AnyTradeProposal) => {
      const senderDocID = getSenderDocID(item);
      const recipientDocID = getRecipientDocID(item);
      if (!senderDocID || !recipientDocID) return;

      await updateDoc(getWarRoomDocRef(senderDocID), {
        sentRequests: arrayRemove(item),
      });

      await updateDoc(getWarRoomDocRef(recipientDocID), {
        requests: arrayRemove(item),
      });
    },
    [getWarRoomDocRef],
  );

  /**
   * VetoTrade — mirrors original `VetoTrade(id)`.
   * Filters the proposal out of the admin approved-trades queue by ID.
   */
  const handleVetoTrade = useCallback(
    async (item: AnyTradeProposal) => {
      const filteredQueue = approvedRequests.filter(
        (x) => (x as any).ID !== (item as any).ID,
      );
      await updateApprovedTrades({ approvedRequests: filteredQueue as any });
    },
    [approvedRequests, updateApprovedTrades],
  );

  // ---- Return ------------------------------------------------------------

  return {
    // League
    league,
    isNFL,

    // Team state
    userTeam,
    userTeamID,
    tradePartnerTeamID,
    tradePartnerTeam,
    selectTradePartner,
    teamOptions,

    // Tradable assets
    userTradablePlayers,
    userTradablePicks,
    partnerTradablePlayers,
    partnerTradablePicks,

    // Trade eligibility
    canProposeTrade,

    // Proposals (from context REST data)
    userTradeProposals,

    // Live Firestore war-room data for the user's team
    userWarRoomData,

    // Admin approved queue (live from Firestore)
    approvedRequests,

    // Firebase trade operations (war-room + approved queue)
    proposeTrade: handleProposeTrade,
    acceptTrade: handleAcceptTrade,
    rejectTrade: handleRejectTrade,
    vetoTrade: handleVetoTrade,
    updateUserWarRoom,
    updateApprovedTrades,
  };
};
