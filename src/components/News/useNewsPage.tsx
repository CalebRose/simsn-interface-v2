import { useTeamColors } from "../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";

export const useNewsPage = () => {
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
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );

  return { backgroundColor, darkerBackgroundColor, textColorClass, teamColors };
};
