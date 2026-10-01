import { useState, useMemo } from "react";
import { useResponsive } from "../../../_hooks/useMobile";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { buildHockeyPlayerMap, useFilteredGames } from "./SchedulePageHelper";
import {
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  SimCHL,
  SimPHL,
  League,
} from "../../../_constants/constants";
import { useLeagueStore } from "../../../context/LeagueContext";
import { Timestamp as FBTimestamp } from "../../../models/footballModels";
import { Timestamp as BKTimestamp } from "../../../models/basketballModels";
import { Timestamp as HKTimestamp } from "../../../models/hockeyModels";

export const useAdvancedSchedule = (
  league: League,
  week: number,
  games: any[],
  view: string,
  selectedTeamID: number,
  isPreseason?: boolean,
) => {
  const { ts } = useLeagueStore();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [selectedTeamIDs, setSelectedTeamIDs] = useState<number[]>([]);
  const [selectedConferenceIDs, setSelectedConferenceIDs] = useState<number[]>(
    [],
  );
  const {
    cfbTeamOptions,
    nflTeamOptions,
    cfbConferenceOptions,
    nflConferenceOptions,
    cfbTeamMap,
    proTeamMap,
    cfbPlayerMap,
    proPlayerMap: nflPlayerMap,
  } = useSimFBAStore();
  const {
    cbbTeamOptions,
    nbaTeamOptions,
    cbbConferenceOptions,
    nbaConferenceOptions,
    cbbTeamMap,
    nbaTeamMap,
    cbbPlayerMap,
    proPlayerMap: nbaPlayerMap,
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
  }, [ts]);

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

  const leaguePlayerMap = useMemo(() => {
    switch (league) {
      case SimCFB:
        return cfbPlayerMap;
      case SimNFL:
        return nflPlayerMap;
      case SimCBB:
        return cbbPlayerMap;
      case SimNBA:
        return nbaPlayerMap;
      case SimCHL:
        return chlPlayerMap;
      case SimPHL:
        return phlPlayerMap;
      default:
        return {};
    }
  }, [
    league,
    cfbPlayerMap,
    nflPlayerMap,
    cbbPlayerMap,
    nbaPlayerMap,
    chlPlayerMap,
    phlPlayerMap,
  ]);

  const gamePlayerMap = useMemo(() => {
    switch (league) {
      case SimCHL:
        return buildHockeyPlayerMap(chlRosterMap);
      case SimPHL:
        return buildHockeyPlayerMap(phlRosterMap);
      default:
        return {};
    }
  }, [league, chlRosterMap, phlRosterMap]);

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

  const filteredGames = useFilteredGames(
    games,
    week,
    view,
    league,
    selectedTeamIDs,
    selectedTeamID,
    selectedConferenceIDs,
    leagueTeamMap,
    isPreseason,
  );

  console.log({ games, filteredGames, isPreseason });

  const SelectConferences = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedConferenceIDs(() => opts);
  };

  const SelectTeams = (options: any) => {
    const opts = [...options.map((x: any) => Number(x.value))];
    setSelectedTeamIDs(() => opts);
  };

  const tableColumns = useMemo(() => {
    let columns = [
      { header: "ID", accessor: "ID" },
      { header: "Week", accessor: "Week" },
    ];
    if (isHockey) {
      columns.push({ header: "Game Title", accessor: "GameTitle" });
    } else if (isBasketball) {
      columns.push({ header: "Game Title", accessor: "GameTitle" });
    } else {
      columns.push({ header: "Time", accessor: "TimeSlot" });
      columns.push({ header: "Game Title", accessor: "GameTitle" });
    }

    columns = columns.concat([
      { header: "A.Coach", accessor: "AwayTeamCoach" },
      { header: "A.Team", accessor: "AwayTeam" },
      { header: "A.R.", accessor: "AwayTeamRank" },
      { header: "A.Score", accessor: "AwayTeamScore" },
      { header: "H.Score", accessor: "HomeTeamScore" },
      { header: "H.R.", accessor: "HomeTeamRank" },
      { header: "H.Team", accessor: "HomeTeam" },
      { header: "H.Coach", accessor: "HomeTeamCoach" },
    ]);
    if (isHockey) {
      columns = columns.concat([
        { header: "Arena", accessor: "Arena" },
        { header: "City", accessor: "City" },
        { header: "State", accessor: "State" },
        { header: "Country", accessor: "Country" },
        { header: "Attendance", accessor: "AttendanceCount" },
        { header: "Star One", accessor: "StarOne" },
        { header: "Star Two", accessor: "StarTwo" },
        { header: "Star Three", accessor: "StarThree" },
      ]);
    } else if (isBasketball) {
      columns = columns.concat([
        { header: "Arena", accessor: "Arena" },
        { header: "City", accessor: "City" },
        { header: "State", accessor: "State" },
        { header: "Country", accessor: "Country" },
        { header: "Attendance", accessor: "AttendanceCount" },
      ]);
    } else {
      columns = columns.concat([
        { header: "Stadium", accessor: "Stadium" },
        { header: "City", accessor: "City" },
        { header: "State", accessor: "State" },
        { header: "Attendance", accessor: "AttendanceCount" },
        { header: "MVP", accessor: "MVP" },
      ]);
    }
    return columns;
  }, [league, isFootball, isBasketball, isHockey, isDesktop, isUltraWide]);

  return {
    leagueTeamOptions,
    leagueConferenceOptions,
    leagueTeamMap,
    leaguePlayerMap,
    selectedTeamIDs,
    selectedConferenceIDs,
    filteredGames,
    standingsBySeason,
    isFootball,
    isBasketball,
    isHockey,
    selectedGame,
    setSelectedGame,
    SelectConferences,
    SelectTeams,
    tableColumns,
    gamePlayerMap,
  };
};
