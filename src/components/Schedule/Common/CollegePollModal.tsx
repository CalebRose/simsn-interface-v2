import { FC, useMemo, useState } from "react";
import { BASE_HCK_SEASON, League, SimCHL } from "../../../_constants/constants";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Modal } from "../../../_design/Modal";
import { Timestamp as HCKTimestamp } from "../../../models/hockeyModels";
import {
  getHCKDisplayWeek,
  getHCKWeekID,
  MakeHCKSeasonsOptionList,
  MakeHCKWeeksOptionList,
} from "../../../_helper/statsPageHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { getLogo } from "../../../_utility/getLogo";
import { useAuthStore } from "../../../context/AuthContext";
import { Logo } from "../../../_design/Logo";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { darkenColor } from "../../../_utility/getDarkerColor";

interface CollegePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  timestamp: any;
}

export const CollegePollModal: FC<CollegePollModalProps> = ({
  league,
  isOpen,
  onClose,
  timestamp,
}) => {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Official ${league} Poll`}
        maxWidth="max-w-[60rem]"
        actions={
          <>
            <ButtonGroup>
              <Button size="sm" onClick={onClose}>
                <Text variant="small">Close</Text>
              </Button>
            </ButtonGroup>
          </>
        }
      >
        {league === SimCHL && (
          <HCKCollegePollModal
            isOpen={isOpen}
            onClose={onClose}
            league={league}
            timestamp={timestamp}
          />
        )}
      </Modal>
    </>
  );
};

interface CollegePollRowProps {
  poll: any;
  idx: number;
  darkerBackgroundColor: string;
  backgroundColor: string;
  teamMap: any;
  standingsMap: any;
  league: League;
  isRetro: boolean;
}

const CollegePollRow: FC<CollegePollRowProps> = ({
  poll,
  idx,
  darkerBackgroundColor,
  backgroundColor,
  teamMap,
  standingsMap,
  league,
  isRetro,
}) => {
  const team = teamMap[poll.TeamID];
  const standings = standingsMap[poll.TeamID];
  const logo = getLogo(league, team.ID, isRetro);
  let description = "";
  if (standings) {
    description = `${standings.TotalWins}-${standings.TotalLosses}-${standings.TotalOTLosses} (${standings.ConferenceWins}-${standings.ConferenceLosses}-${standings.ConferenceOTLosses})`;
  }
  return (
    <div
      className="grid grid-cols-10 border-b border-b-[#34455d] h-[3rem]"
      style={{
        backgroundColor:
          idx % 2 === 0 ? darkerBackgroundColor : backgroundColor,
      }}
    >
      <div className="text-left col-span-1 flex items-center">
        <Text variant="xs" className="font-semibold">
          {idx + 1}
        </Text>
      </div>
      <div className="text-left col-span-4">
        <div className="grid grid-cols-5 space-x-4 h-full">
          <div className="col-span-1 items-center flex">
            <Logo url={logo} variant="xs" />
          </div>
          <div className="col-span-4 items-center flex">
            <Text variant="xs">{team.TeamName}</Text>
          </div>
        </div>
      </div>
      <div className="text-left col-span-3 flex items-center">
        <Text variant="xs" className="font-semibold">
          {description}
        </Text>
      </div>
      <div className="text-left col-span-2 flex items-center">
        <Text variant="xs" className="font-semibold">
          {poll.Votes} Votes ({poll.No1Votes})
        </Text>
      </div>
    </div>
  );
};

export const HCKCollegePollModal: FC<CollegePollModalProps> = ({
  league,
  timestamp,
}) => {
  const ts = timestamp as HCKTimestamp;
  const { currentUser } = useAuthStore();
  const { collegePolls, chlTeamMap, chlStandingsMap, chlTeam } =
    useSimHCKStore();
  const { isMobile } = useResponsive();
  const [selectedWeek, setSelectedWeek] = useState<number>(2501);
  const [selectedSeason, setSelectedSeason] = useState<number>(1); // SEASON ID
  const teamColors = useTeamColors(
    chlTeam?.ColorOne,
    chlTeam?.ColorTwo,
    chlTeam?.ColorThree
  );
  const seasonOptions = useMemo(() => {
    if (!ts) {
      return [{ label: "2025", value: "1" }];
    }
    return MakeHCKSeasonsOptionList(ts);
  }, [ts]);

  const weekOptions = useMemo(() => {
    return MakeHCKWeeksOptionList(selectedSeason);
  }, [selectedSeason]);

  const SelectSeasonOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    const newWeekID = getHCKWeekID(1, num);
    setSelectedSeason(num);
    setSelectedWeek(newWeekID);
  };

  const SelectWeekOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedWeek(num);
  };

  const CurrentCollegePoll = useMemo(() => {
    const pollIdx = collegePolls.findIndex(
      (x) => x.WeekID === Number(selectedWeek)
    );
    const pollArr: any[] = [];
    if (pollIdx < 0) {
      return pollArr;
    }
    for (let i = 1; i <= 20; i++) {
      const obj: any = {};
      obj[`Team`] = collegePolls[pollIdx][`Rank${i}`];
      obj[`TeamID`] = collegePolls[pollIdx][`Rank${i}ID`];
      obj[`Votes`] = collegePolls[pollIdx][`Rank${i}Votes`];
      obj[`No1Votes`] = collegePolls[pollIdx][`Rank${i}No1Votes`];
      pollArr.push(obj);
    }
    return pollArr;
  }, [selectedWeek, collegePolls]);
  const backgroundColor = "#1f2937";
  const darkerBackgroundColor = darkenColor(backgroundColor, -5);
  const borderColor = teamColors.Two;
  const displaySeason = useMemo(() => {
    return BASE_HCK_SEASON + selectedSeason;
  }, [selectedSeason]);

  const displayWeek = useMemo(() => {
    return getHCKDisplayWeek(selectedWeek, displaySeason);
  }, [selectedWeek, displaySeason]);

  return (
    <>
      <div className="grid grid-cols-2 mb-3">
        <CategoryDropdown
          label={`Current Season: ${displaySeason}`}
          options={seasonOptions}
          change={SelectSeasonOption}
          isMulti={false}
          isMobile={isMobile}
        />
        <CategoryDropdown
          label={`Current Week: ${displayWeek}`}
          options={weekOptions}
          change={SelectWeekOption}
          isMulti={false}
          isMobile={isMobile}
        />
      </div>
      <div
        className="grid grid-cols-10 border-b-2 pb-2"
        style={{
          borderColor,
        }}
      >
        <div className="text-left col-span-1">
          <Text variant="body" className="font-semibold">
            Rank
          </Text>
        </div>
        <div className="text-left col-span-4">
          <Text variant="body" className="font-semibold">
            Team
          </Text>
        </div>
        <div className="text-left col-span-3">
          <Text variant="body" className="font-semibold">
            Record
          </Text>
        </div>
        <div className="text-left col-span-2">
          <Text variant="body" className="font-semibold">
            Votes
          </Text>
        </div>
      </div>
      <div className="overflow-y-auto max-h-[30rem]">
        {CurrentCollegePoll.length === 0 && (
          <Text variant="h4" classes="my-4">
            The official poll has yet to be curated for the designated week.
          </Text>
        )}
        {CurrentCollegePoll.length > 0 &&
          CurrentCollegePoll.map((poll, idx) => (
            <CollegePollRow
              key={idx}
              poll={poll}
              idx={idx}
              darkerBackgroundColor={darkerBackgroundColor}
              backgroundColor={backgroundColor}
              teamMap={chlTeamMap}
              standingsMap={chlStandingsMap}
              league={league}
              isRetro={currentUser?.isRetro || false}
            />
          ))}
      </div>
    </>
  );
};
