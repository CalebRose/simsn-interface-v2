import { useEffect, useState } from "react";
import { PageContainer } from "../../_design/Container";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { isBrightColor } from "../../_utility/isBrightColor";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { teamByLeague } from "../../_utility/useLeagueSelector";
import { LeagueSelector } from "../Common/LeagueSelector";

export const NewsPage = () => {
  const {
    currentUser,
    isCFBUser,
    isCBBUser,
    isCHLUser,
    isNFLUser,
    isNBAUser,
    isPHLUser,
  } = useAuthStore();
  const { setSelectedLeague, selectedLeague, ts, selectedTeam, SetTeam } =
    useLeagueStore();
  const { cfbTeam, nflTeam } = useSimFBAStore();
  const { cbbTeam, nbaTeam } = useSimBBAStore();
  const { chlTeam, phlTeam } = useSimHCKStore();
  const isLoadingData = !selectedTeam;
  const backgroundColor = "#1f2937";
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  return (
    <PageContainer>
      <>
        <div className="flex flex-col px-2 mt-1">
          <div className="flex flex-row mb-1">
            <LeagueSelector
              selectedLeague={selectedLeague as League}
              onLeagueSelect={SetTeam}
              teams={{
                cfbTeam,
                nflTeam,
                cbbTeam,
                nbaTeam,
                chlTeam,
                phlTeam,
              }}
            />
          </div>
          <div></div>
        </div>
      </>
    </PageContainer>
  );
};
