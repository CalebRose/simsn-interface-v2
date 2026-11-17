import { useEffect } from "react";
import { useSimVBStore } from "../../context/SimVBContext";
import { VbClock, VbLeagueKind } from "../../_services/volleyballService";

const POLL_MS = 60_000;

/**
 * The league clock for one volleyball league, kept fresh while the calling
 * page is mounted. The API has no live feed, so this polls every minute and
 * whenever the window regains focus. Returns null until the first answer.
 */
export const useVbClock = (kind: VbLeagueKind): VbClock | null => {
  const { vbLeagues, vbClocks, refreshVbClock } = useSimVBStore();
  const leagueId = vbLeagues[kind]?.LeagueID;

  useEffect(() => {
    if (!leagueId) return;
    const refresh = () => {
      refreshVbClock(leagueId).catch(() => {
        // Keep showing the last clock; the next poll will try again.
      });
    };
    refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [leagueId, refreshVbClock]);

  return leagueId ? (vbClocks[leagueId] ?? null) : null;
};
