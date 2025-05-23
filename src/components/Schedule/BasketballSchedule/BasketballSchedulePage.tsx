import { FC, useEffect, useMemo, useState } from "react";
import {
  League,
  SimCBB,
  SimNBA,
  Overview,
} from "../../../_constants/constants";
import { useAuthStore } from "../../../context/AuthContext";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { Text } from "../../../_design/Typography";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { ActionModal } from "../../Common/ActionModal";
import { useResponsive } from "../../../_hooks/useMobile";

interface SchedulePageProps {
  league: League;
  ts: any;
}

export const BasketballSchedulePage = ({ league, ts }: SchedulePageProps) => {
  const { currentUser } = useAuthStore();
  const bbStore = useSimBBAStore();
  const {
    cbbTeam,
    cbbTeamMap,
    cbbRosterMap,
    cbbTeamOptions,
    allCBBStandings,
    nbaTeam,
    nbaTeamMap,
    proRosterMap: nbaRosterMap,
    nbaTeamOptions,
    allProStandings: allNBAStandings,
  } = bbStore;

  const [selectedTeam, setSelectedTeam] = useState(cbbTeam);
  const [category, setCategory] = useState(Overview);
  const [resultsOverride, setResultsOverride] = useState<boolean>(false);

  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  let backgroundColor = teamColors.One;
  let borderColor = teamColors.Two;
  const { isMobile } = useResponsive();

  if (isBrightColor(backgroundColor)) {
    [backgroundColor, borderColor] = [borderColor, backgroundColor];
  }

  const selectedRoster = useMemo(() => {
    if (selectedTeam && cbbRosterMap) {
      return cbbRosterMap[selectedTeam.ID];
    }
    return null;
  }, [cbbRosterMap, selectedTeam]);

  const selectTeamOption = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const nextTeam = cbbTeamMap ? cbbTeamMap[value] : null;
    setSelectedTeam(nextTeam);
    setCategory(Overview);
  };

  return (
    <>
      <Text>BASKETBALL SCHEDULE PAGE</Text>
    </>
  );
};
