import {
  League,
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  SimCHL,
  SimPHL,
} from "../../../_constants/constants";
import { useResponsive } from "../../../_hooks/useMobile";
import { useLeagueStore } from "../../../context/LeagueContext";
import { useState, useMemo } from "react";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { Timestamp as FBTimestamp } from "../../../models/footballModels";
import { Timestamp as BKTimestamp } from "../../../models/basketballModels";
import { Timestamp as HKTimestamp } from "../../../models/hockeyModels";
import { useFilteredStandings } from "./SchedulePageHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
export const useAdvancedStandings = (
  league: League,
  view: string,
  selectedTeamID: number,
  selectedSeasonID: number,
) => {
  const { ts } = useLeagueStore();
  const [selectedLeague, setSelectedLeague] = useState<number>(1);
  const [selectedTeamIDs, setSelectedTeamIDs] = useState<number[]>([]);
  const [selectedConferenceIDs, setSelectedConferenceIDs] = useState<number[]>(
    [],
  );
  const [selectedDivisionIDs, setSelectedDivisionIDs] = useState<number[]>([]);
  const {
    cfbTeamOptions,
    nflTeamOptions,
    cfbConferenceOptions,
    nflConferenceOptions,
    cfbTeamMap,
    proTeamMap,
  } = useSimFBAStore();
  const {
    cbbTeamOptions,
    nbaTeamOptions,
    cbbConferenceOptions,
    nbaConferenceOptions,
    cbbTeamMap,
    nbaTeamMap,
  } = useSimBBAStore();
  const {
    chlTeamOptions,
    phlTeamOptions,
    chlConferenceOptions,
    phlConferenceOptions,
    chlTeamMap,
    phlTeamMap,
    chlPlayerMap,
    proPlayerMap: phlPlayerMap,
    chlRosterMap,
    proRosterMap: phlRosterMap,
    collegeStandingsMapBySeason: chlStandingsMapBySeason,
    proStandingsMapBySeason: phlStandingsMapBySeason,
  } = useSimHCKStore();
  const { isMobile, isDesktop, isUltraWide } = useResponsive();

  const seasonID = useMemo(() => {
    if (selectedSeasonID) return selectedSeasonID;
    if (league === SimCFB || league === SimNFL) {
      const timestamp = ts as FBTimestamp;
      return timestamp.CollegeSeasonID;
    }
    if (league === SimCBB || league === SimNBA) {
      const timestamp = ts as BKTimestamp;
      return timestamp.SeasonID;
    }
    const timestamp = ts as HKTimestamp;
    return timestamp.SeasonID || 0;
  }, [ts, selectedSeasonID]);

  const standingsBySeason = useMemo(() => {
    switch (league) {
      case SimCHL:
        return chlStandingsMapBySeason[seasonID] || [];
      case SimPHL:
        return phlStandingsMapBySeason[seasonID] || [];
      default:
        return [];
    }
  }, [league, seasonID, chlStandingsMapBySeason, phlStandingsMapBySeason]);

  const leagueTeamMap = useMemo(() => {
    switch (league) {
      case SimCFB:
        return cfbTeamMap;
      case SimNFL:
        return proTeamMap;
      case SimCBB:
        return cbbTeamMap;
      case SimNBA:
        return nbaTeamMap;
      case SimCHL:
        return chlTeamMap;
      case SimPHL:
        return phlTeamMap;
      default:
        return {};
    }
  }, [
    league,
    cfbTeamMap,
    proTeamMap,
    cbbTeamMap,
    nbaTeamMap,
    chlTeamMap,
    phlTeamMap,
  ]);

  const leagueOptions = useMemo(() => {
    if (league === SimCHL) {
      return [
        { value: "1", label: "SimCHL" },
        { value: "2", label: "Canadian Hockey League" },
      ];
    }
    return [];
  }, [league]);

  const leagueDivisionOptions = useMemo(() => {
    if (league === SimPHL) {
      return [
        { label: "Atlantic", value: "1" },
        { label: "Metropolitan", value: "2" },
        { label: "Central", value: "3" },
        { label: "Pacific", value: "4" },
      ];
    }
    return [];
  }, [league]);

  const hockeyTeamMap = useMemo(
    () => (league === SimCHL ? chlTeamMap : phlTeamMap),
    [league, chlTeamMap, phlTeamMap],
  );

  const footballTeamMap = useMemo(
    () => (league === SimCFB ? cfbTeamMap : proTeamMap),
    [league, cfbTeamMap, proTeamMap],
  );

  const basketballTeamMap = useMemo(
    () => (league === SimCBB ? cbbTeamMap : nbaTeamMap),
    [league, cbbTeamMap, nbaTeamMap],
  );

  const leagueTeamOptions = useMemo(() => {
    switch (league) {
      case SimCFB:
        return cfbTeamOptions;
      case SimNFL:
        return nflTeamOptions;
      case SimCBB:
        return cbbTeamOptions;
      case SimNBA:
        return nbaTeamOptions;
      case SimCHL:
        return chlTeamOptions;
      case SimPHL:
        return phlTeamOptions;
      default:
        return [];
    }
  }, [
    league,
    cfbTeamOptions,
    nflTeamOptions,
    cbbTeamOptions,
    nbaTeamOptions,
    chlTeamOptions,
    phlTeamOptions,
  ]);

  const leagueConferenceOptions = useMemo(() => {
    switch (league) {
      case SimCFB:
        return cfbConferenceOptions;
      case SimNFL:
        return nflConferenceOptions;
      case SimCBB:
        return cbbConferenceOptions;
      case SimNBA:
        return nbaConferenceOptions;
      case SimCHL:
        return chlConferenceOptions;
      case SimPHL:
        return phlConferenceOptions;
      default:
        return [];
    }
  }, [
    league,
    cfbConferenceOptions,
    nflConferenceOptions,
    cbbConferenceOptions,
    nbaConferenceOptions,
    chlConferenceOptions,
    phlConferenceOptions,
  ]);

  const isFootball = useMemo(
    () => league === SimCFB || league === SimNFL,
    [league],
  );

  const isBasketball = useMemo(
    () => league === SimCBB || league === SimNBA,
    [league],
  );

  const isHockey = useMemo(
    () => league === SimCHL || league === SimPHL,
    [league],
  );

  const SelectConferences = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedConferenceIDs(() => opts);
  };

  const SelectDivisions = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedDivisionIDs(() => opts);
  };

  const SelectTeams = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedTeamIDs(() => opts);
  };

  const SelectLeague = (options: SingleValue<SelectOption>) => {
    if (options) {
      setSelectedLeague(() => Number(options.value));
    }
  };

  const filteredStandings = useFilteredStandings(
    standingsBySeason,
    view,
    league,
    selectedLeague,
    selectedTeamIDs,
    selectedTeamID,
    selectedConferenceIDs,
    selectedDivisionIDs,
    leagueTeamMap,
  );

  const tableColumns = useMemo(() => {
    let columns = [
      { header: "Team", accessor: "TeamName" },
      { header: "Conference", accessor: "ConferenceID" },
    ];
    if (league === SimNFL || league === SimPHL || league === SimNBA) {
      columns.push({ header: "Division", accessor: "DivisionID" });
    }
    columns.push({ header: "Coach", accessor: "Coach" });
    if (isHockey) {
      columns = columns.concat([
        { header: "P", accessor: "Points" },
        { header: "T. W.", accessor: "TotalWins" },
        { header: "T. L.", accessor: "TotalLosses" },
        { header: "OT. W.", accessor: "TotalOTWins" },
        { header: "OT. L.", accessor: "TotalOTLosses" },
        { header: "SO. W.", accessor: "ShootoutWins" },
        { header: "SO. L.", accessor: "ShootoutLosses" },
        { header: "C. W.", accessor: "ConferenceWins" },
        { header: "C. L.", accessor: "ConferenceLosses" },
        { header: "COT. W.", accessor: "ConferenceOTWins" },
        { header: "COT. L.", accessor: "ConferenceOTLosses" },
      ]);
      if (league === SimCHL) {
        columns = columns.concat([
          { header: "R.", accessor: "Rank" },
          { header: "RW.", accessor: "RankedWins" },
          { header: "RL.", accessor: "RankedLosses" },
        ]);
      }
      columns = columns.concat([
        { header: "GF", accessor: "GoalsFor" },
        { header: "GA", accessor: "GoalsAgainst" },
        { header: "GD", accessor: "GoalDifference" },
        { header: "Strk.", accessor: "Streak" },
        { header: "HW.", accessor: "HomeWins" },
        { header: "AW.", accessor: "AwayWins" },
        { header: "Status", accessor: "PostSeasonStatus" },
      ]);
      if (league === SimCHL) {
        columns = columns.concat([
          { header: "Preseason Rank", accessor: "PreseasonRank" },
          { header: "Pairwise Rank", accessor: "PairwiseRank" },
          { header: "RPI Rank", accessor: "RPIRank" },
          { header: "RPI", accessor: "RPI" },
          { header: "SOS", accessor: "SOS" },
          { header: "SOR", accessor: "SOR" },
          { header: "T1W", accessor: "Tier1Wins" },
          { header: "T2W", accessor: "Tier2Wins" },
          { header: "BL", accessor: "BadLosses" },
          { header: "Conf. SOS", accessor: "ConferenceStrengthAdj" },
        ]);
      }
    } else if (isBasketball) {
      columns = columns.concat([]);
    } else if (isFootball) {
      columns = columns.concat([]);
    }
    return columns;
  }, [league, isFootball, isBasketball, isHockey, isDesktop, isUltraWide]);

  return {
    filteredStandings,
    tableColumns,
    seasonID,
    standingsBySeason,
    leagueTeamMap,
    hockeyTeamMap,
    footballTeamMap,
    basketballTeamMap,
    leagueTeamOptions,
    leagueConferenceOptions,
    leagueDivisionOptions,
    leagueOptions,
    SelectTeams,
    SelectConferences,
    SelectLeague,
    SelectDivisions,
  };
};
