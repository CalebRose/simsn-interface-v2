import { Dispatch, FC, ReactNode, SetStateAction, useMemo } from "react";
import {
  Attributes,
  League,
  ModalAction,
  PortalInfoType,
  Potentials,
  Preferences,
  Promise,
  RemovePortalPlayerType,
  ScoutAttributeType,
  SimCHL,
} from "../../../_constants/constants";
import { Table, TableCell } from "../../../_design/Table";
import {
  CollegePlayer,
  TransferPortalProfile,
} from "../../../models/hockeyModels";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { Input } from "../../../_design/Inputs";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Handshake, TrashCan } from "../../../_design/Icons";
import {
  annotateCountry,
  annotateRegion,
} from "../../../_helper/StateAbbreviationHelper";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";
import {
  getAdditionalHCKPortalAttributes,
  getAdditionalHCKPortalPotentialAttributes,
  getAdditionalHCKPortalPreferenceAttributes,
} from "../../Team/TeamPageUtils";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useResponsive } from "../../../_hooks/useMobile";
import { getHockeyLetterGrade } from "../../../_utility/getLetterGrade";
import { getHCKModifierValue } from "../../../_helper/transferPortalHelper";

const getTransferProfileTableColumns = (
  league: League,
  category: string,
  isMobile: boolean
) => {
  if (league === SimCHL) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "Country", accessor: "Country" },
      { header: "Region", accessor: "State" },
      { header: "Ovr", accessor: "OverallGrade" },
    ];
    if (!isMobile && category === Attributes) {
      columns = columns.concat([
        { header: "Agi", accessor: "Agility" },
        { header: "FO", accessor: "Faceoffs" },
        { header: "LSA", accessor: "LongShotAccuracy" },
        { header: "LSP", accessor: "LongShotPower" },
        { header: "CSA", accessor: "CloseShotAccuracy" },
        { header: "CSP", accessor: "CloseShotPower" },
        { header: "Pass", accessor: "Passing" },
        { header: "PH", accessor: "PuckHandling" },
        { header: "Str", accessor: "Strength" },
        { header: "BChk", accessor: "BodyChecking" },
        { header: "SChk", accessor: "StickChecking" },
        { header: "SB", accessor: "ShotBlocking" },
        { header: "GK", accessor: "Goalkeeping" },
        { header: "GV", accessor: "GoalieVision" },
      ]);
    } else if (category === Potentials) {
      columns = columns.concat([
        { header: "Agi", accessor: "AgilityGrade" },
        { header: "FO", accessor: "FaceoffsGrade" },
        { header: "LSA", accessor: "LongShotAccuracyGrade" },
        { header: "LSP", accessor: "LongShotPowerGrade" },
        { header: "CSA", accessor: "CloseShotAccuracyGrade" },
        { header: "CSP", accessor: "CloseShotPowerGrade" },
        { header: "Pass", accessor: "PassingGrade" },
        { header: "PH", accessor: "PuckHandlingGrade" },
        { header: "Str", accessor: "StrengthGrade" },
        { header: "BChk", accessor: "BodyCheckingGrade" },
        { header: "SChk", accessor: "StickCheckingGrade" },
        { header: "SB", accessor: "ShotBlockingGrade" },
        { header: "GK", accessor: "GoalkeepingGrade" },
        { header: "GV", accessor: "GoalieVisionGrade" },
      ]);
    } else if (!isMobile && category === Preferences) {
      columns = columns.concat([
        { header: "Program", accessor: "ProgramPref" },
        { header: "Prof. Dev.", accessor: "ProfDevPref" },
        { header: "Trad.", accessor: "TraditionsPref" },
        { header: "Fac.", accessor: "FacilitiesPref" },
        { header: "Atm.", accessor: "AtmospherePref" },
        { header: "Aca.", accessor: "AcademicsPref" },
        { header: "Conf.", accessor: "ConferencePref" },
        { header: "Coach", accessor: "CoachPref" },
        { header: "Season", accessor: "SeasonMomentumPref" },
      ]);
    }
    columns = columns.concat([
      { header: "Status", accessor: "RecruitingStatus" },
      { header: "Leaders", accessor: "lead" },
      { header: "Add Points", accessor: "CurrentWeeksPoints" },
      { header: "Mod.", accessor: "ModifiedPoints" },
      { header: "Total", accessor: "TotalPoints" },
      { header: "Actions", accessor: "actions" },
    ]);
    return columns;
  }
  return [];
};

interface CHLProfileRowProps {
  profile: TransferPortalProfile;
  player: CollegePlayer;
  isMobile: boolean;
  category: string;
  ChangeInput: (id: number, name: string, points: number) => void;
  openModal: (action: ModalAction, player: CollegePlayer) => void;
  openPromiseModal: (player: CollegePlayer) => void;
  setAttribute: (attr: string) => void;
  backgroundColor: string;
}

export const CHLProfileRow: FC<CHLProfileRowProps> = ({
  profile,
  player,
  isMobile,
  category,
  ChangeInput,
  openModal,
  setAttribute,
  openPromiseModal,
  backgroundColor,
}) => {
  const hkStore = useSimHCKStore();
  const { transferProfileMapByPlayerID, collegePromiseMap } = hkStore;
  const { isTablet } = useResponsive();

  const transferProfiles = useMemo(() => {
    return transferProfileMapByPlayerID[player.ID];
  }, [transferProfileMapByPlayerID, player]);

  // 1) Build attribute lists once
  let attrList = getAdditionalHCKPortalAttributes(player);
  if (category === Potentials)
    attrList = getAdditionalHCKPortalPotentialAttributes(player);
  const prefList = getAdditionalHCKPortalPreferenceAttributes(player);
  const promise = collegePromiseMap[player.ID];
  // 3) Compute modifier
  let modValue = getHCKModifierValue(profile, promise);

  // 4) Change handler
  const onPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Math.max(0, Math.min(20, Number(e.target.value)));
    ChangeInput(profile.ID, e.target.name, val);
  };

  // 5) Leading teams (memo)
  const leadingTeamsList = useMemo(() => {
    const list = [];
    const sortedProfiles = transferProfiles.sort(
      (a, b) => a.TotalPoints - b.TotalPoints
    );
    let runningThreshold = 0;
    let totalPoints = 0;
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (runningThreshold === 0) {
        runningThreshold = sortedProfiles[i].TotalPoints * 0.66;
      }
      if (sortedProfiles[i].TotalPoints >= runningThreshold) {
        totalPoints += sortedProfiles[i].TotalPoints;
      }
    }
    for (let i = 0; i < sortedProfiles.length; i++) {
      if (sortedProfiles[i].RemovedFromBoard) continue;
      if (sortedProfiles[i].TotalPoints < runningThreshold) continue;
      let odds = 0;
      if (runningThreshold > 0) {
        odds = sortedProfiles[i].TotalPoints / totalPoints;
      }
      const obj = {
        TeamID: sortedProfiles[i].ProfileID,
        TeamAbbreviation: sortedProfiles[i].TeamAbbreviation,
        Odds: odds,
      };
      list.push(obj);
    }
    return list;
  }, [transferProfiles]);

  const leadingTeams = useMemo(() => {
    if (leadingTeamsList.length === 0) {
      return "None";
    }

    const competingTeams = leadingTeamsList.filter((x, idx) => x.Odds > 0);
    const topTeams = competingTeams.filter((x, idx) => idx <= 3);

    if (topTeams.length === 0) {
      return "None";
    }
    const competingIDs = topTeams.map((x) => x.TeamID);
    return competingIDs.map((x) => {
      const logo = getLogo(SimCHL, x, false);
      return (
        <div key={x}>
          <Logo url={logo} variant="tiny" />
        </div>
      );
    });
  }, [leadingTeamsList]);

  // 6) Buttons
  const scoutAttribute = (attr: string) => {
    setAttribute(attr);
    openModal(ScoutAttributeType, player);
  };

  const canPlacePointsDown = player.TeamID === 0 || player.TeamID >= 75;

  return (
    <div
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell>
        <span className={`text-xs`}>{player.ID}</span>
      </TableCell>{" "}
      <TableCell>
        <span
          className={`text-xs cursor-pointer font-semibold`}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "#fcd53f";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "";
          }}
          onClick={() => openModal(PortalInfoType, player)}
        >
          {player.FirstName} {player.LastName}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{player.Position}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{player.Archetype}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{player.Stars}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateCountry(player.Country)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateRegion(player.State)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>
          {getHockeyLetterGrade(player.Overall, player.Year)}
        </span>
      </TableCell>
      {category === Attributes && !isMobile && (
        <>
          {attrList.map((attr) => (
            <TableCell key={attr.label}>
              <span className={`text-xs`}>{attr.value}</span>
            </TableCell>
          ))}
        </>
      )}
      {category === Potentials && (
        <>
          {attrList.map((attr: any) => (
            <TableCell key={attr.label}>
              {profile[attr.label as keyof TransferPortalProfile] ? (
                <span className={`text-sm`}>{attr.value}</span>
              ) : (
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => scoutAttribute(attr.label)}
                >
                  ?
                </Button>
              )}
            </TableCell>
          ))}
        </>
      )}
      {category === Preferences && (
        <>
          {prefList.map((attr, idx) => (
            <TableCell key={idx}>
              <span className="text-sm">{attr.value}</span>
            </TableCell>
          ))}
        </>
      )}
      <TableCell>
        <span className={`text-xs`}>{player.RecruitingStatus}</span>
      </TableCell>
      <TableCell>
        <div className="flex flex-row gap-x-2 text-xs">{leadingTeams}</div>
      </TableCell>
      <TableCell>
        <div className="w-[1rem]">
          <Input
            type="number"
            key={profile.ID}
            label=""
            name="CurrentWeeksPoints"
            value={profile.CurrentWeeksPoints as number}
            classes="text-xs"
            disabled={!canPlacePointsDown}
            onChange={onPointsChange}
          />
        </div>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{modValue.toFixed(2)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{profile.TotalPoints.toFixed(2)}</span>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant="primary"
            size="xs"
            onClick={() => openPromiseModal(player)}
          >
            <Handshake />
          </Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => openModal(RemovePortalPlayerType, player)}
          >
            <TrashCan />
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface TransferPortalProfileTableProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  transferPortalProfiles?: TransferPortalProfile[];
  teamProfile?: any;
  playerMap: any;
  teamMap: any;
  team: any;
  league: League;
  isMobile?: boolean;
  category: string;
  openModal: (action: ModalAction, player: CollegePlayer) => void;
  openPromiseModal: (player: CollegePlayer) => void;
  ChangeInput: (id: number, name: string, points: number) => void;
  setAttribute: Dispatch<SetStateAction<string>>;
}

export const TransferPortalProfileTable: FC<
  TransferPortalProfileTableProps
> = ({
  colorOne,
  colorTwo,
  colorThree,
  transferPortalProfiles,
  playerMap,
  teamMap,
  team,
  teamProfile,
  league,
  category,
  isMobile = false,
  ChangeInput,
  openModal,
  setAttribute,
  openPromiseModal,
}) => {
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const secondaryBorderColor = colorThree;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const columns = getTransferProfileTableColumns(league, category, isMobile);

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    return (profile: TransferPortalProfile, idx: number, bg: string) => {
      const player = playerMap[profile.CollegePlayerID] as CollegePlayer;
      return (
        <CHLProfileRow
          profile={profile}
          key={profile.ID}
          player={player}
          isMobile={isMobile}
          backgroundColor={bg}
          category={category}
          ChangeInput={ChangeInput}
          openModal={openModal}
          openPromiseModal={openPromiseModal}
          setAttribute={setAttribute}
        />
      );
    };
  };
  return (
    <Table
      columns={columns}
      data={transferPortalProfiles!!}
      team={team}
      rowRenderer={rowRenderer(league)}
    />
  );
};
