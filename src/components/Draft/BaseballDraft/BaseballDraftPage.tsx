import { FC } from "react";
import { League } from "../../../_constants/constants";
import { BaseballDraftee } from "../../../models/baseball/baseballDraftModels";
import { useBaseballDraft } from "./useBaseballDraft";
import BaseballDraftSidebar from "./BaseballDraftSidebar";
import BaseballDraftClock from "./BaseballDraftClock";
import BaseballDraftTicker from "./BaseballDraftTicker";
import BaseballUpcomingPicks from "./BaseballUpcomingPicks";
import BaseballRoundStrip from "./BaseballRoundStrip";
import BaseballBigBoard from "./BaseballBigBoard";
import BaseballEligiblePlayers from "./BaseballEligiblePlayers";
import BaseballScoutingView from "./BaseballScoutingView";
import BaseballWarRoom from "./BaseballWarRoom";
import BaseballPreferences from "./BaseballPreferences";
import BaseballMyPicks from "./BaseballMyPicks";
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
    boardPicks,
    currentPick,
    phase,
    isPaused,
    secondsRemaining,
    currentRound,
    currentPickNumber,
    currentOverall,
    currentRoundMode,
    autoRoundsLocked,
    totalRounds,
    picksPerRound,
    draftedPlayerIds,
    isAutoRoundsRunning,
    isLoading,
    error,

    // Round modes
    roundModes,

    // Eligible players
    eligiblePlayers,
    eligibleTotal,
    eligibleLimit,
    eligibleOffset,
    fetchEligiblePlayers,

    // User context
    userOrgId,
    userOrgAbbrev,
    isAdmin,
    isUserTurn,
    leagueYearId,
    orgMap,

    // Scouting
    scoutingBudget,
    refreshScoutingBudget,
    scoutModalPlayerId,
    isScoutModalOpen,
    openScoutModal,
    closeScoutModal,

    // Actions
    makePick,

    // Preferences
    autoPrefs,
    refreshAutoPrefs,
    saveAutoPrefs,

    // Org picks
    orgPicks,
    refreshOrgPicks,

    // Signing
    signPick,
    passPick,

    // Trades
    tradeProposals,
    refreshTradeProposals,
    proposeTrade,
    acceptTrade,
    rejectTrade,

    // Admin
    initializeDraft,
    setRoundModes,
    startDraft,
    pauseDraft,
    resumeDraft,
    resetTimer,
    runAutoRounds,
    advanceToSigning,
    exportDraft,
    completeDraft,

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
          showSigning={phase === "SIGNING" || phase === "COMPLETE"}
          hasOrg={userOrgId != null}
          autoRoundsLocked={autoRoundsLocked}
        />
      </div>

      {/* Main Content */}
      <div className="lg:col-span-10 flex flex-col gap-3">
        {/* Header Bar — hidden on Big Board view */}
        {activeTab !== "bigboard" && (
          <div className="flex flex-col gap-2">
            {/* Round Strip */}
            <div className="rounded-lg bg-gray-800 px-3 py-2">
              <BaseballRoundStrip
                roundModes={roundModes}
                currentRound={currentRound}
                totalRounds={totalRounds}
              />
            </div>

            <div className="flex gap-3 items-stretch">
              <div className="flex-shrink-0">
                <BaseballDraftClock
                  currentPick={currentPick}
                  currentRound={currentRound}
                  currentPickNumber={currentPickNumber}
                  secondsRemaining={secondsRemaining}
                  phase={phase}
                  currentRoundMode={currentRoundMode}
                  isUserTurn={isUserTurn}
                  orgMap={orgMap}
                />
              </div>
              <div className="flex-1 min-w-0">
                <BaseballUpcomingPicks
                  upcomingPicks={upcomingPicks}
                  currentPick={currentPick}
                  userOrgId={userOrgId}
                  orgMap={orgMap}
                />
              </div>
            </div>
            {recentPicks.length > 0 && (
              <BaseballDraftTicker recentPicks={recentPicks} orgMap={orgMap} />
            )}
          </div>
        )}

        {/* Tab Views */}
        {activeTab === "bigboard" && (
          <BaseballBigBoard
            boardPicks={boardPicks}
            currentOverall={currentOverall}
            currentRound={currentRound}
            totalRounds={totalRounds}
            userOrgId={userOrgId}
            orgMap={orgMap}
            roundModes={roundModes}
            showSignStatus={phase === "SIGNING" || phase === "COMPLETE"}
          />
        )}

        {activeTab === "eligible" && (
          <BaseballEligiblePlayers
            eligiblePlayers={eligiblePlayers}
            eligibleTotal={eligibleTotal}
            eligibleLimit={eligibleLimit}
            eligibleOffset={eligibleOffset}
            draftedPlayerIds={draftedPlayerIds}
            isUserTurn={isUserTurn}
            onFetchPlayers={fetchEligiblePlayers}
            onDraftPlayer={(player: BaseballDraftee) => makePick(player.player_id)}
            onScoutPlayer={openScoutModal}
            onAddToQueue={(playerId: number) => {
              if (autoPrefs) {
                const currentQueue = autoPrefs.queue.map((e) => e.player_id);
                if (!currentQueue.includes(playerId)) {
                  saveAutoPrefs({ queue: [...currentQueue, playerId] });
                }
              } else {
                saveAutoPrefs({ queue: [playerId] });
              }
            }}
            scoutingBudget={scoutingBudget}
            autoRoundsLocked={autoRoundsLocked}
          />
        )}

        {activeTab === "scouting" && leagueYearId && (
          <BaseballScoutingView
            draftees={eligiblePlayers}
            draftedPlayerIds={draftedPlayerIds}
            scoutingBudget={scoutingBudget}
            scoutModalPlayerId={scoutModalPlayerId}
            isScoutModalOpen={isScoutModalOpen}
            onOpenScoutModal={openScoutModal}
            onCloseScoutModal={closeScoutModal}
            onBudgetChanged={refreshScoutingBudget}
            orgId={userOrgId ?? 0}
            leagueYearId={leagueYearId}
            onFetchPlayers={fetchEligiblePlayers}
            eligibleTotal={eligibleTotal}
            eligibleLimit={eligibleLimit}
            eligibleOffset={eligibleOffset}
          />
        )}

        {activeTab === "warroom" && (
          <BaseballWarRoom
            teamPicks={teamPicks}
            allPicks={boardPicks}
            currentOverall={currentOverall}
            userOrgId={userOrgId}
            userOrgAbbrev={userOrgAbbrev}
            orgMap={orgMap}
            tradeProposals={tradeProposals}
            onProposeTrade={proposeTrade}
            onAcceptTrade={acceptTrade}
            onRejectTrade={rejectTrade}
            onRefreshTrades={refreshTradeProposals}
            organizations={organizations}
          />
        )}

        {activeTab === "preferences" && (
          <BaseballPreferences
            autoPrefs={autoPrefs}
            autoRoundsLocked={autoRoundsLocked}
            eligiblePlayers={eligiblePlayers}
            draftedPlayerIds={draftedPlayerIds}
            onSave={saveAutoPrefs}
            onFetchPlayers={fetchEligiblePlayers}
          />
        )}

        {activeTab === "mypicks" && (
          <BaseballMyPicks
            orgPicks={orgPicks}
            phase={phase}
            orgMap={orgMap}
            userOrgAbbrev={userOrgAbbrev}
            onSignPick={signPick}
            onPassPick={passPick}
            onRefresh={refreshOrgPicks}
          />
        )}

        {activeTab === "signing" && (
          <BaseballPickSigning
            orgPicks={orgPicks}
            orgMap={orgMap}
            onSignPick={signPick}
            onPassPick={passPick}
            onRefresh={refreshOrgPicks}
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
            currentRoundMode={currentRoundMode}
            secondsRemaining={secondsRemaining}
            totalRounds={totalRounds}
            autoRoundsLocked={autoRoundsLocked}
            isAutoRoundsRunning={isAutoRoundsRunning}
            roundModes={roundModes}
            leagueYearId={leagueYearId}
            onInitializeDraft={initializeDraft}
            onSetRoundModes={setRoundModes}
            onStartDraft={startDraft}
            onPauseDraft={pauseDraft}
            onResumeDraft={resumeDraft}
            onResetTimer={resetTimer}
            onRunAutoRounds={runAutoRounds}
            onAdvanceToSigning={advanceToSigning}
            onExportDraft={exportDraft}
            onCompleteDraft={completeDraft}
            boardPicks={boardPicks}
          />
        )}
      </div>
    </div>
  );
};
