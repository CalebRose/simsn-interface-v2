import { Dispatch, FC, ReactNode, SetStateAction, useMemo } from "react";
import {
  Croot as HockeyCroot,
  RecruitPlayerProfile as HockeyCrootProfile,
} from "../../../models/hockeyModels";
import {
  Attributes,
  ButtonColor,
  CloseToHome,
  League,
  ModalAction,
  Potentials,
  Preferences,
  RecruitInfoType,
  RemoveRecruitType,
  ScholarshipOffered,
  ScholarshipRevoked,
  ScoutAttributeType,
  SimCBB,
  SimCFB,
  SimCHL,
  ToggleScholarshipType,
} from "../../../_constants/constants";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  Croot as FootballCroot,
  RecruitPlayerProfile as FootballCrootProfile,
  RecruitingTeamProfile,
} from "../../../models/footballModels";
import { Table, TableCell } from "../../../_design/Table";
import {
  getAdditionalCrootPreferenceAttributes,
  getAdditionalHockeyAttributeGrades,
  getAdditionalHockeyCrootAttributes,
  getCFBCrootAttributes,
} from "../../Team/TeamPageUtils";
import { Input } from "../../../_design/Inputs";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import {
  Croot as BasketballCroot,
  PlayerRecruitProfile as BasketballCrootProfile,
  TeamRecruitingProfile,
} from "../../../models/basketballModels";
import { SadFace, Scholarship, TrashCan } from "../../../_design/Icons";
import {
  annotateCountry,
  annotateRegion,
} from "../../../_helper/StateAbbreviationHelper";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import {
  CalculateAdjustedCFBPoints,
  isBadFit,
  isGoodFit,
  ValidateAffinity,
  ValidateCloseToHome,
} from "../../../_helper/recruitingHelper";

const getRecruitProfileColumns = (
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
  if (league === SimCFB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "City", accessor: "City" },
      { header: "HS", accessor: "HighSchool" },
      { header: "State", accessor: "State" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "AF1", accessor: "AffinityOne" },
      { header: "AF2", accessor: "AffinityTwo" },
      { header: "Status", accessor: "RecruitingStatus" },
      { header: "Leaders", accessor: "lead" },
      { header: "Add Points", accessor: "CurrentWeeksPoints" },
      { header: "Mod.", accessor: "ModifiedPoints" },
      { header: "Total", accessor: "TotalPoints" },
      { header: "Actions", accessor: "actions" },
    ];
    return columns;
  }
  if (league === SimCBB) {
    let columns: { header: string; accessor: string }[] = [
      { header: "ID", accessor: "" },
      { header: "Name", accessor: "LastName" },
      { header: "Pos", accessor: "Position" },
      { header: "Arch", accessor: "Archetype" },
      { header: "⭐", accessor: "Stars" },
      { header: "State", accessor: "State" },
      { header: "Country", accessor: "Country" },
      { header: "Ovr", accessor: "OverallGrade" },
      { header: "Ins", accessor: "Finishing" },
      { header: "Mid", accessor: "Shooting2" },
      { header: "3pt", accessor: "Shooting3" },
      { header: "FT", accessor: "FreeThrow" },
      { header: "BW", accessor: "Ballwork" },
      { header: "RB", accessor: "Rebounding" },
      { header: "Int. D", accessor: "InteriorDefense" },
      { header: "Per. D", accessor: "PerimeterDefense" },
      { header: "Pot", accessor: "PotentialGrade" },
      { header: "Status", accessor: "RecruitingStatus" },
      { header: "Leaders", accessor: "lead" },
      { header: "Add Points", accessor: "CurrentWeeksPoints" },
      { header: "Mod.", accessor: "ModifiedPoints" },
      { header: "Total", accessor: "TotalPoints" },
      { header: "Actions", accessor: "actions" },
    ];
    return columns;
  }
  return [];
};

interface CHLProfileRowProps {
  profile: HockeyCrootProfile;
  croot: HockeyCroot;
  isMobile: boolean;
  category: string;
  ChangeInput: (id: number, name: string, points: number) => void;
  openModal: (action: ModalAction, player: HockeyCroot) => void;
  setAttribute: (attr: string) => void;
  backgroundColor: string;
}

export const CHLProfileRow: FC<CHLProfileRowProps> = ({
  profile,
  croot,
  isMobile,
  category,
  ChangeInput,
  openModal,
  setAttribute,
  backgroundColor,
}) => {
  // 1) Build attribute lists once
  let attrList = getAdditionalHockeyCrootAttributes(croot);
  if (category === Potentials)
    attrList = getAdditionalHockeyAttributeGrades(croot);
  const prefList = getAdditionalCrootPreferenceAttributes(croot);

  // 2) Scholarship button state
  const toggleVariant =
    profile.Scholarship && !profile.ScholarshipRevoked
      ? "success"
      : !profile.Scholarship && profile.ScholarshipRevoked
      ? "danger"
      : "secondary";

  // 3) Compute modifier
  let modValue = profile.CurrentWeeksPoints * profile.Modifier;
  if (profile.IsHomeState) modValue *= 1.25;
  else if (profile.IsPipelineState) modValue *= 1.15;

  // 4) Change handler
  const onPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Math.max(0, Math.min(20, Number(e.target.value)));
    ChangeInput(profile.ID, e.target.name, val);
  };

  // 5) Leading teams (memo)
  const leadingTeams = useMemo(() => {
    if (!croot.LeadingTeams?.length) return "None";
    if (croot.IsSigned) {
      return <Logo url={getLogo(SimCHL, croot.TeamID, false)} variant="tiny" />;
    }
    const tops = croot.LeadingTeams.filter((x) => x.Odds > 0).slice(0, 4);
    if (!tops.length) return "None";
    return tops.map((x) => (
      <Logo
        key={x.TeamID}
        url={getLogo(SimCHL, x.TeamID, false)}
        variant="tiny"
      />
    ));
  }, [croot]);

  // 6) Buttons
  const toggleScholarship = () => {
    setAttribute(profile.Scholarship ? ScholarshipRevoked : ScholarshipOffered);
    openModal(ToggleScholarshipType, croot);
  };
  const scoutAttribute = (attr: string) => {
    setAttribute(attr);
    openModal(ScoutAttributeType, croot);
  };

  return (
    <div
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell>
        <span className={`text-xs`}>{croot.ID}</span>
      </TableCell>{" "}
      <TableCell>
        <span
          className={`text-xs cursor-pointer font-semibold ${
            croot.IsCustomCroot ? "text-blue-400" : ""
          }`}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "#fcd53f";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "";
          }}
          onClick={() => openModal(RecruitInfoType, croot)}
        >
          {croot.FirstName} {croot.LastName}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Position}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Archetype}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Stars}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateCountry(croot.Country)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateRegion(croot.State)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.OverallGrade}</span>
      </TableCell>
      {category === Attributes && !isMobile && (
        <>
          {attrList.map((attr) => (
            <TableCell>
              <span className={`text-xs`}>{attr.value}</span>
            </TableCell>
          ))}
        </>
      )}
      {category === Potentials && (
        <>
          {attrList.map((attr) => (
            <TableCell>
              {profile[attr.label] ? (
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
        <span className={`text-xs`}>{croot.RecruitingStatus}</span>
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
            disabled={profile.IsLocked || profile.IsSigned}
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
            variant={toggleVariant as ButtonColor}
            size="xs"
            onClick={toggleScholarship}
            disabled={profile.ScholarshipRevoked}
          >
            {profile.ScholarshipRevoked ? <SadFace /> : <Scholarship />}
          </Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => openModal(RemoveRecruitType, croot)}
          >
            <TrashCan />
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface CFBProfileRowProps {
  profile: FootballCrootProfile;
  teamProfile: RecruitingTeamProfile;
  croot: FootballCroot;
  isMobile: boolean;
  category: string;
  ChangeInput: (id: number, name: string, points: number) => void;
  openModal: (action: ModalAction, player: FootballCroot) => void;
  setAttribute: (attr: string) => void;
  backgroundColor: string;
}

export const CFBProfileRow: FC<CFBProfileRowProps> = ({
  profile,
  teamProfile,
  croot,
  isMobile,
  category,
  ChangeInput,
  openModal,
  setAttribute,
  backgroundColor,
}) => {
  // 2) Scholarship button state
  const toggleVariant =
    profile.Scholarship && !profile.ScholarshipRevoked
      ? "success"
      : !profile.Scholarship && profile.ScholarshipRevoked
      ? "danger"
      : "secondary";

  // 3) Compute modifier
  let modifier = CalculateAdjustedCFBPoints(profile, teamProfile, croot);

  // 4) Change handler
  const onPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Math.max(0, Math.min(20, Number(e.target.value)));
    ChangeInput(profile.ID, e.target.name, val);
  };

  // 5) Leading teams (memo)
  const leadingTeams = useMemo(() => {
    if (!croot.LeadingTeams?.length) return "None";
    if (croot.IsSigned) {
      return <Logo url={getLogo(SimCFB, croot.TeamID, false)} variant="tiny" />;
    }
    const tops = croot.LeadingTeams.filter((x) => x.Odds > 0).slice(0, 4);
    if (!tops.length) return "None";
    return tops.map((x) => (
      <Logo
        key={x.TeamID}
        url={getLogo(SimCFB, x.TeamID, false)}
        variant="tiny"
      />
    ));
  }, [croot.LeadingTeams]);

  // 6) Buttons
  const toggleScholarship = () => {
    setAttribute(
      profile.Scholarship && !profile.ScholarshipRevoked
        ? ScholarshipRevoked
        : ScholarshipOffered
    );
    openModal(ToggleScholarshipType, croot);
  };

  const isCrootGoodFit = useMemo(() => {
    return isGoodFit(
      teamProfile.OffensiveScheme,
      teamProfile.DefensiveScheme,
      croot.Position,
      croot.Archetype
    );
  }, [teamProfile]);

  const isCrootBadFit = useMemo(() => {
    return isBadFit(
      teamProfile.OffensiveScheme,
      teamProfile.DefensiveScheme,
      croot.Position,
      croot.Archetype
    );
  }, [teamProfile]);

  const nameColor = useMemo(() => {
    if (croot.IsCustomCroot) {
      return "text-blue-400";
    } else if (isCrootGoodFit) {
      return "text-green-400";
    } else if (isCrootBadFit) {
      return "text-red-400";
    }
  }, [croot, isCrootGoodFit, isCrootBadFit]);

  const affinityOneValid = useMemo(() => {
    if (croot.AffinityOne === CloseToHome) {
      return ValidateCloseToHome(croot, teamProfile.TeamAbbreviation);
    }
    return ValidateAffinity(croot.AffinityOne, teamProfile);
  }, [croot, teamProfile]);

  const affinityTwoValid = useMemo(() => {
    if (croot.AffinityTwo === CloseToHome) {
      return ValidateCloseToHome(croot, teamProfile.TeamAbbreviation);
    }
    return ValidateAffinity(croot.AffinityTwo, teamProfile);
  }, [croot, teamProfile]);

  return (
    <div
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell>
        <span className={`text-xs`}>{croot.ID}</span>
      </TableCell>
      <TableCell>
        <span
          className={`text-xs cursor-pointer font-semibold ${nameColor}`}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "#fcd53f";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "";
          }}
          onClick={() => openModal(RecruitInfoType, croot)}
        >
          {croot.FirstName} {croot.LastName}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Position}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Archetype}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Stars}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.City}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.HighSchool}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateRegion(croot.State)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.OverallGrade}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.PotentialGrade}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs ${affinityOneValid ? "text-blue-400" : ""}`}>
          {croot.AffinityOne}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs ${affinityTwoValid ? "text-blue-400" : ""}`}>
          {croot.AffinityTwo}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.RecruitingStatus}</span>
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
            disabled={profile.IsLocked}
            onChange={onPointsChange}
          />
        </div>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{modifier.toFixed(3)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{profile.TotalPoints.toFixed(3)}</span>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={toggleVariant as ButtonColor}
            size="xs"
            onClick={toggleScholarship}
            disabled={profile.ScholarshipRevoked}
          >
            {profile.ScholarshipRevoked ? <SadFace /> : <Scholarship />}
          </Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => openModal(RemoveRecruitType, croot)}
          >
            <TrashCan />
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface CBBProfileRowProps {
  profile: BasketballCrootProfile;
  teamProfile: TeamRecruitingProfile;
  croot: BasketballCroot;
  isMobile: boolean;
  category: string;
  ChangeInput: (id: number, name: string, points: number) => void;
  openModal: (action: ModalAction, player: BasketballCroot) => void;
  setAttribute: (attr: string) => void;
  backgroundColor: string;
}

export const CBBProfileRow: FC<CBBProfileRowProps> = ({
  profile,
  teamProfile,
  croot,
  isMobile,
  category,
  ChangeInput,
  openModal,
  setAttribute,
  backgroundColor,
}) => {
  // 2) Scholarship button state
  const toggleVariant =
    profile.Scholarship && !profile.ScholarshipRevoked
      ? "success"
      : !profile.Scholarship && profile.ScholarshipRevoked
      ? "danger"
      : "secondary";

  // 3) Compute modifier
  let modifier = 1.0;
  if (profile.HasStateBonus) {
    modifier += 0.25;
  }
  if (profile.HasRegionBonus) {
    modifier += 0.15;
  }
  let modValue = profile.CurrentWeeksPoints * modifier;

  // 4) Change handler
  const onPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Math.max(0, Math.min(20, Number(e.target.value)));
    ChangeInput(profile.ID, e.target.name, val);
  };

  // 5) Leading teams (memo)
  const leadingTeams = useMemo(() => {
    if (!croot) return "None";
    if (!croot.LeadingTeams?.length) return "None";
    if (croot.IsSigned) {
      return <Logo url={getLogo(SimCBB, croot.TeamID, false)} variant="tiny" />;
    }
    const tops = croot.LeadingTeams.filter((x) => x.Odds > 0).slice(0, 4);
    if (!tops.length) return "None";
    return tops.map((x) => (
      <Logo
        key={x.TeamID}
        url={getLogo(SimCBB, x.TeamID, false)}
        variant="tiny"
      />
    ));
  }, [croot]);

  // 6) Buttons
  const toggleScholarship = () => {
    setAttribute(
      profile.Scholarship && !profile.ScholarshipRevoked
        ? ScholarshipRevoked
        : ScholarshipOffered
    );
    openModal(ToggleScholarshipType, croot);
  };

  const nameColor = useMemo(() => {
    if (!croot) return "";
    if (croot.IsCustomCroot) {
      return "text-blue-400";
    }
    return "";
  }, [croot]);

  if (!croot) return null;

  return (
    <div
      className="table-row border-b dark:border-gray-700 text-left"
      style={{ backgroundColor }}
    >
      <TableCell>
        <span className={`text-xs`}>{croot.ID}</span>
      </TableCell>
      <TableCell>
        <span
          className={`text-xs cursor-pointer font-semibold ${nameColor}`}
          onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "#fcd53f";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
            (e.target as HTMLElement).style.color = "";
          }}
          onClick={() => openModal(RecruitInfoType, croot)}
        >
          {croot.FirstName} {croot.LastName}
        </span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Position}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Archetype}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Stars}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateRegion(croot.State)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{annotateCountry(croot.Country)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.OverallGrade}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Finishing}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Shooting2}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Shooting3}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.FreeThrow}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Ballwork}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.Rebounding}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.InteriorDefense}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.PerimeterDefense}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.PotentialGrade}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{croot.SigningStatus}</span>
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
            disabled={profile.IsLocked}
            onChange={onPointsChange}
          />
        </div>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{modValue.toFixed(3)}</span>
      </TableCell>
      <TableCell>
        <span className={`text-xs`}>{profile.TotalPoints.toFixed(3)}</span>
      </TableCell>
      <TableCell>
        <ButtonGroup classes="flex-nowrap">
          <Button
            variant={toggleVariant as ButtonColor}
            size="xs"
            onClick={toggleScholarship}
            disabled={profile.ScholarshipRevoked}
          >
            {profile.ScholarshipRevoked ? <SadFace /> : <Scholarship />}
          </Button>
          <Button
            variant="danger"
            size="xs"
            onClick={() => openModal(RemoveRecruitType, croot)}
          >
            <TrashCan />
          </Button>
        </ButtonGroup>
      </TableCell>
    </div>
  );
};

interface RecruitProfileTableProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  recruitProfiles?:
    | HockeyCrootProfile[]
    | FootballCrootProfile[]
    | BasketballCrootProfile[];
  teamProfile?: any;
  recruitMap: any;
  teamMap: any;
  team: any;
  league: League;
  isMobile?: boolean;
  category: string;
  openModal: (
    action: ModalAction,
    player: HockeyCroot | FootballCroot | BasketballCroot
  ) => void;
  ChangeInput: (id: number, name: string, points: number) => void;
  setAttribute: Dispatch<SetStateAction<string>>;
}

export const RecruitProfileTable: FC<RecruitProfileTableProps> = ({
  colorOne,
  colorTwo,
  colorThree,
  recruitProfiles,
  recruitMap,
  teamMap,
  team,
  teamProfile,
  league,
  category,
  isMobile = false,
  ChangeInput,
  openModal,
  setAttribute,
}) => {
  const backgroundColor = colorOne;
  const borderColor = colorTwo;
  const secondaryBorderColor = colorThree;
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const columns = getRecruitProfileColumns(league, category, isMobile);

  const rowRenderer = (
    league: League
  ): ((item: any, index: number, backgroundColor: string) => ReactNode) => {
    if (league === SimCHL) {
      return (profile: HockeyCrootProfile, idx: number, bg: string) => {
        const croot = recruitMap[profile.RecruitID] as HockeyCroot;
        profile.Croot = croot;
        return (
          <CHLProfileRow
            profile={profile}
            key={profile.ID}
            croot={croot}
            isMobile={isMobile}
            backgroundColor={bg}
            category={category}
            ChangeInput={ChangeInput}
            openModal={openModal}
            setAttribute={setAttribute}
          />
        );
      };
    }
    if (league === SimCFB) {
      return (profile: FootballCrootProfile, idx: number, bg: string) => {
        const croot = recruitMap[profile.RecruitID] as FootballCroot;
        profile.Croot = croot;
        return (
          <CFBProfileRow
            teamProfile={teamProfile}
            profile={profile}
            key={profile.ID}
            croot={croot}
            isMobile={isMobile}
            backgroundColor={bg}
            category={category}
            ChangeInput={ChangeInput}
            openModal={openModal}
            setAttribute={setAttribute}
          />
        );
      };
    }
    return (profile: BasketballCrootProfile, idx: number, bg: string) => {
      const croot = recruitMap[profile.RecruitID] as BasketballCroot;
      profile.Croot = croot;
      return (
        <CBBProfileRow
          teamProfile={teamProfile}
          profile={profile}
          key={profile.ID}
          croot={croot}
          isMobile={isMobile}
          backgroundColor={bg}
          category={category}
          ChangeInput={ChangeInput}
          openModal={openModal}
          setAttribute={setAttribute}
        />
      );
    };
  };
  return (
    <Table
      columns={columns}
      data={recruitProfiles!!}
      team={team}
      rowRenderer={rowRenderer(league)}
      page="RecruitingProfileTable"
    />
  );
};
