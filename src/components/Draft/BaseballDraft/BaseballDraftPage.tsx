import { FC, useMemo } from "react";
import { League, SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { BaseballDraftee } from "../../../models/baseball/baseballDraftModels";
import { useBaseballDraft } from "./useBaseballDraft";
import BaseballDraftSidebar from "./BaseballDraftSidebar";
import BaseballDraftClock from "./BaseballDraftClock";
import BaseballDraftTicker from "./BaseballDraftTicker";
import BaseballUpcomingPicks from "./BaseballUpcomingPicks";
import BaseballBigBoard from "./BaseballBigBoard";
import BaseballDraftBoard from "./BaseballDraftBoard";
import BaseballScoutingView from "./BaseballScoutingView";
import BaseballWarRoom from "./BaseballWarRoom";
import BaseballPickSigning from "./BaseballPickSigning";
import BaseballAdminBoard from "./BaseballAdminBoard";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";

interface BaseballDraftPageProps {
  league: League;
}

export const BaseballDraftPage: FC<BaseballDraftPageProps> = ({ league }) => {
  const { organizations } = useSimBaseballStore();
  const draft = useBaseballDraft();

  const {
    // State
    allPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    draftedPlayerIds,
    isLoading,
    error,

    // Draft board
    draftees,
    drafteesTotal,
    drafteesPage,
    drafteesPages,
    fetchDraftBoard,

    // User context
    userOrgId,
    userOrgAbbrev,
    isAdmin,
    isUserTurn,
    leagueYearId,

    // Scouting
    scoutingBudget,
    refreshScoutingBudget,
    scoutModalPlayerId,
    isScoutModalOpen,
    openScoutModal,
    closeScoutModal,

    // Actions
    makePick,

    // Signing
    signingStatuses,
    signPick,
    refreshSigningStatus,

    // Trades
    tradeProposals,
    refreshTradeProposals,
    proposeTrade,
    acceptTrade,
    rejectTrade,

    // Admin
    startDraft,
    pauseDraft,
    resumeDraft,
    resetTimer,
    setDraftPick,
    removePlayerFromPick,
    advanceToSigning,
    exportDraft,

    // Tabs
    activeTab,
    setActiveTab,

    // Computed
    upcomingPicks,
    recentPicks,
    teamPicks,
  } = draft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading draft...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 w-full min-h-[600px]">
      {/* Sidebar */}
      <div className="lg:col-span-2">
        <BaseballDraftSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          showSigning={phase === "signing" || phase === "complete"}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-10 flex flex-col gap-3">
        {/* Header Bar — hidden on Big Board view */}
        {activeTab !== "bigboard" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 items-stretch">
              <div className="flex-shrink-0">
                <BaseballDraftClock
                  currentPick={currentPick}
                  currentRound={currentRound}
                  currentPickNumber={currentPickNumber}
                  secondsRemaining={secondsRemaining}
                  isPaused={isPaused}
                  isUserTurn={isUserTurn}
                />
              </div>
              <div className="flex-1 min-w-0">
                <BaseballUpcomingPicks
                  upcomingPicks={upcomingPicks}
                  currentPick={currentPick}
                  userOrgId={userOrgId}
                />
              </div>
            </div>
            {recentPicks.length > 0 && (
              <BaseballDraftTicker recentPicks={recentPicks} />
            )}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === "bigboard" && (
          <BaseballBigBoard
            allPicks={allPicks}
            currentOverall={currentOverall}
            userOrgId={userOrgId}
          />
        )}

        {activeTab === "draftboard" && (
          <BaseballDraftBoard
            draftees={draftees}
            drafteesTotal={drafteesTotal}
            drafteesPage={drafteesPage}
            drafteesPages={drafteesPages}
            draftedPlayerIds={draftedPlayerIds}
            isUserTurn={isUserTurn}
            onFetchPage={fetchDraftBoard}
            onDraftPlayer={(player: BaseballDraftee) => makePick(player.player_id)}
            onScoutPlayer={openScoutModal}
            scoutingBudget={scoutingBudget}
          />
        )}

        {activeTab === "scouting" && leagueYearId && (
          <BaseballScoutingView
            draftees={draftees}
            draftedPlayerIds={draftedPlayerIds}
            scoutingBudget={scoutingBudget}
            scoutModalPlayerId={scoutModalPlayerId}
            isScoutModalOpen={isScoutModalOpen}
            onOpenScoutModal={openScoutModal}
            onCloseScoutModal={closeScoutModal}
            onBudgetChanged={refreshScoutingBudget}
            orgId={userOrgId ?? 0}
            leagueYearId={leagueYearId}
            onFetchPage={fetchDraftBoard}
            drafteesTotal={drafteesTotal}
            drafteesPage={drafteesPage}
            drafteesPages={drafteesPages}
          />
        )}

        {activeTab === "warroom" && (
          <BaseballWarRoom
            teamPicks={teamPicks}
            allPicks={allPicks}
            currentOverall={currentOverall}
            userOrgId={userOrgId}
            userOrgAbbrev={userOrgAbbrev}
            tradeProposals={tradeProposals}
            onProposeTrade={proposeTrade}
            onAcceptTrade={acceptTrade}
            onRejectTrade={rejectTrade}
            onRefreshTrades={refreshTradeProposals}
            organizations={organizations}
          />
        )}

        {activeTab === "signing" && (
          <BaseballPickSigning
            signingStatuses={signingStatuses}
            onSignPick={signPick}
            onRefresh={refreshSigningStatus}
            userOrgAbbrev={userOrgAbbrev}
          />
        )}

        {activeTab === "admin" && (
          <BaseballAdminBoard
            phase={phase}
            isPaused={isPaused}
            currentRound={currentRound}
            currentPickNumber={currentPickNumber}
            currentOverall={currentOverall}
            secondsRemaining={secondsRemaining}
            onStartDraft={startDraft}
            onPauseDraft={pauseDraft}
            onResumeDraft={resumeDraft}
            onResetTimer={resetTimer}
            onSetPick={setDraftPick}
            onRemovePlayer={removePlayerFromPick}
            onAdvanceToSigning={advanceToSigning}
            onExportDraft={exportDraft}
            allPicks={allPicks}
          />
        )}
      </div>
    </div>
  );
};
