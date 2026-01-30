import { FC, useMemo, useState } from "react";
import {
  CFBAward,
  DaveyOBrien,
  HeismanTrophy,
  CoachOfTheYear,
  DoakWalkerAward,
  BiletnikoffAward,
  MackeyAward,
  RimingtonTrophy,
  OutlandTrophy,
  JoeMoore,
  NagurskiAward,
  HendricksAward,
  ThorpeAward,
  ButkusAward,
  LouGrozaAward,
  RayGuyAward,
  JetAward,
  League,
  SimCFB,
} from "../../../_constants/constants";
import { AwardsList as CFBAwardsList } from "../../../models/footballModels";
import { Modal } from "../../../_design/Modal";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { useResponsive } from "../../../_hooks/useMobile";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";

interface AwardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: League;
  postSeasonAwards: CFBAwardsList;
  borderColor: string;
  backgroundColor: string;
  darkerBackgroundColor: string;
}

const CFBAwardsOptions: { label: string; value: CFBAward }[] = [
  { label: "Heisman Trophy", value: HeismanTrophy },
  { label: "Davey O'Brien Award", value: DaveyOBrien },
  { label: "Coach of the Year", value: CoachOfTheYear },
  { label: "Doak Walker Award", value: DoakWalkerAward },
  { label: "Biletnikoff Award", value: BiletnikoffAward },
  { label: "Mackey Award", value: MackeyAward },
  { label: "Rimington Trophy", value: RimingtonTrophy },
  { label: "Outland Trophy", value: OutlandTrophy },
  { label: "Joe Moore Award", value: JoeMoore },
  { label: "Nagurski Award", value: NagurskiAward },
  { label: "Hendricks Award", value: HendricksAward },
  { label: "Thorpe Award", value: ThorpeAward },
  { label: "Butkus Award", value: ButkusAward },
  { label: "Lou Groza Award", value: LouGrozaAward },
  { label: "Ray Guy Award", value: RayGuyAward },
  { label: "Jet Award", value: JetAward },
];

export const AwardsModal: FC<AwardsModalProps> = ({
  isOpen,
  onClose,
  league,
  postSeasonAwards,
  borderColor,
  backgroundColor,
  darkerBackgroundColor,
}) => {
  const { isMobile } = useResponsive();
  const [selectedAward, setSelectedAward] = useState<CFBAward>(HeismanTrophy);

  const SelectAwardsOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    setSelectedAward(value as CFBAward);
  };

  const awardsList = useMemo(() => {
    if (league === SimCFB) {
      return postSeasonAwards[selectedAward] || [];
    }
    return [];
  }, [league, postSeasonAwards, selectedAward]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${league} Post Season Awards`}
        classes="h-[70vh]"
      >
        <>
          <div className="grid grid-cols-2 mb-3 gap-x-4">
            <CategoryDropdown
              label={`Current Award`}
              options={CFBAwardsOptions}
              change={SelectAwardsOption}
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
            <div className="text-left col-span-1">
              <Text variant="body" className="font-semibold">
                Team
              </Text>
            </div>
            <div className="text-left col-span-4">
              <Text variant="body" className="font-semibold">
                Player
              </Text>
            </div>
            <div className="text-center col-span-2">
              <Text variant="body" className="font-semibold">
                Games
              </Text>
            </div>
            <div className="text-center col-span-2">
              <Text variant="body" className="font-semibold">
                Score
              </Text>
            </div>
          </div>
          <div className="overflow-y-auto max-h-[43vh]">
            {awardsList.length === 0 && (
              <Text variant="h4" classes="my-4">
                The Awards have yet to be curated for the designated week.
              </Text>
            )}
            {awardsList.length > 0 &&
              awardsList.map((award: any, idx: number) => (
                <AwardsRow
                  key={idx}
                  award={award}
                  idx={idx}
                  darkerBackgroundColor={darkerBackgroundColor}
                  backgroundColor={backgroundColor}
                  league={league}
                />
              ))}
          </div>
        </>
      </Modal>
    </>
  );
};

interface AwardsRowProps {
  award: any;
  idx: number;
  darkerBackgroundColor: string;
  backgroundColor: string;
  league: League;
}

export const AwardsRow: FC<AwardsRowProps> = ({
  award,
  idx,
  darkerBackgroundColor,
  backgroundColor,
  league,
}) => {
  const logo = useMemo(() => {
    if (!award) return "";
    return getLogo(league, award.TeamID, false);
  }, [league, award]);

  const playerLabel = useMemo(() => {
    if (!award) return "";
    if (league === SimCFB) {
      return `${award.Position} ${award.Archetype} ${award.FirstName} ${award.LastName}`;
    }
    return "";
  }, [league, award]);

  return (
    <>
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
        <div className="text-left col-span-1 flex items-center">
          <Logo url={logo} variant="xs" />
        </div>
        <div className="text-left col-span-4 items-center flex">
          <Text variant="xs">{playerLabel}</Text>
        </div>
        <div className="text-center col-span-2 flex items-center justify-center">
          <Text variant="xs" className="font-semibold">
            {award.Games}
          </Text>
        </div>
        <div className="text-center col-span-2 flex items-center justify-center">
          <Text variant="xs" className="font-semibold">
            {award.Score.toFixed(2)}
          </Text>
        </div>
      </div>
    </>
  );
};
