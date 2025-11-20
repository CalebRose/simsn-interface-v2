import { useMemo, useState } from "react";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
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
import { usePagination } from "../../_hooks/usePagination";
import { getFBAWeekID, getHCKWeekID } from "../../_helper/statsPageHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";

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
  const { setSelectedLeague, selectedLeague, selectedTeam } = useLeagueStore();
  const {
    cfb_Timestamp,
    collegeNews: cfbNews,
    proNews: nflNews,
  } = useSimFBAStore();
  const {
    cbb_Timestamp,
    collegeNews: cbbNews,
    proNews: nbaNews,
  } = useSimBBAStore();
  const {
    hck_Timestamp,
    collegeNews: chlNews,
    proNews: phlNews,
  } = useSimHCKStore();
  const isLoadingData = !selectedTeam;
  const backgroundColor = "#1f2937";
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(2501);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedNewsType, setSelectedNewsType] = useState<string>("");

  const ts = useMemo(() => {
    if (selectedLeague === SimCHL || selectedLeague === SimPHL) {
      return hck_Timestamp;
    } else if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      return cfb_Timestamp;
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      return cbb_Timestamp;
    }
  }, [selectedLeague, hck_Timestamp, cfb_Timestamp, cbb_Timestamp]);

  const selectedLeagueNews = useMemo(() => {
    switch (selectedLeague) {
      case SimCFB:
        return cfbNews;
      case SimNFL:
        return nflNews;
      case SimCBB:
        return cbbNews;
      case SimNBA:
        return nbaNews;
      case SimCHL:
        return chlNews;
      case SimPHL:
        return phlNews;
      default:
        return [];
    }
  }, [selectedLeague, cfbNews, nflNews, cbbNews, nbaNews, chlNews, phlNews]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(selectedLeagueNews.length, 30);

  const changeLeagueOption = (opts: SingleValue<SelectOption>) => {
    const leagueOption = opts?.value as League;
    setSelectedLeague(leagueOption);
    setCurrentPage(0);
  };

  const SelectSeasonOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    let newWeekID = getHCKWeekID(1, num);
    if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      newWeekID = getFBAWeekID(1, num);
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      newWeekID = getFBAWeekID(1, num);
    }
    setSelectedSeason(num);
    setSelectedWeek(newWeekID);
    setCurrentPage(0);
  };

  const SelectWeekOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedWeek(num);
    setCurrentPage(0);
  };

  const SelectNewsTypeOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    setSelectedNewsType(value);
    setCurrentPage(0);
  };

  return {
    changeLeagueOption,
    SelectSeasonOption,
    SelectWeekOption,
    SelectNewsTypeOption,
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    backgroundColor,
    darkerBackgroundColor,
    textColorClass,
    teamColors,
    ts,
    setSelectedWeek,
    selectedSeason,
    setSelectedSeason,
    selectedNewsType,
    setSelectedNewsType,
    isLoadingData,
    cfbNews,
    nflNews,
    cbbNews,
    nbaNews,
    chlNews,
    phlNews,
    selectedWeek,
    setSelectedLeague,
    selectedLeague,
    selectedTeam,
  };
};
