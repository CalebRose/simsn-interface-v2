import { getLogo } from "../../_utility/getLogo";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { LockIcon } from "../../_design/Icons";
import { League } from "../../_constants/constants";
import { FC } from "react";
import { CollegePlayer } from "../../models/hockeyModels";
import { Border } from "../../_design/Borders";
import {
  getCHLAttributes,
  getAdditionalHockeyAttributes,
} from "../Team/TeamPageUtils";
import { getYear } from "../../_utility/getYear";
import { HeightToFeetAndInches } from "../../_utility/getHeightByFeetAndInches";
import { useTeamColors } from "../../_hooks/useTeamColors";

interface TeamCardProps {
  teamID: number;
  league: League;
  team: string;
  conference: string;
  disable: boolean | undefined;
  retro: boolean | undefined;
  setSelectedTeam: any;
  t: any;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  teamID,
  league,
  team,
  conference,
  disable,
  retro,
  setSelectedTeam,
  t,
}) => {
  const logo = getLogo(league, teamID, retro);
  const teamColors = useTeamColors(t.ColorOne, t.ColorTwo, t.ColorThree);
  const backgroundColor = !disable ? teamColors.One : "#4B5563"; // Default to Tailwind's gray-600 if no color provided
  const borderColor = !disable ? teamColors.Two : "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  return (
    <button
      className={`relative md:p-0.75 border-2 rounded-2xl md:mx-2 mb-2 md:mb-4 shadow-lg cursor-pointer ${
        disable ? "grayscale" : ""
      }`}
      style={{ backgroundColor, borderColor }}
      onClick={() => setSelectedTeam(t)}
    >
      <div
        className={`flex flex-col items-center w-full justify-center h-[15vh] max-h-[18vh] lg:h-[180px] rounded-2xl`}
      >
        {logo && (
          <div className="flex flex-col items-center justify-center align-center h-full w-auto max-w-full md:px-4 md:py-4">
            <Logo
              label={`${team}`}
              url={logo}
              classes="max-h-10 max-w-16 md:max-w-16 lg:max-w-32 md:max-h-18 lg:max-h-20"
              containerClass="md:items-center p-4"
              textClass={`${textColorClass} text-center md:text-[0.8rem]`}
            />
            <Text
              variant="small"
              classes={`font-semibold ${textColorClass} md:text-[0.8rem]`}
            >
              {conference}
            </Text>
          </div>
        )}
        {disable && <LockIcon textColorClass={textColorClass} />}
      </div>
    </button>
  );
};

interface MobileAttributeProps {
  label: string;
  value: string | number | null;
  textColorClass?: string;
}

const MobileAttribute: FC<MobileAttributeProps> = ({
  label,
  value,
  textColorClass = "",
}) => {
  return (
    <Text variant="small" classes={textColorClass}>
      <span className="font-semibold">{label}</span>: {value}
    </Text>
  );
};

interface CHLTeamPageMobilePlayerCardProps {
  colorOne?: string;
  colorTwo?: string;
  colorThree?: string;
  player: CollegePlayer;
}

export const CHLRosterMobilePlayerCard: FC<
  CHLTeamPageMobilePlayerCardProps
> = ({ player, colorOne, colorTwo, colorThree }) => {
  const attributes = getAdditionalHockeyAttributes(player);
  const backgroundColor = colorThree || "#4B5563";
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  return (
    <div key={player.ID}>
      <Border direction="col" styles={{ backgroundColor }}>
        <Text variant="h5" className="text-white font-semibold">
          {player.FirstName} {player.LastName}
        </Text>
        <div className="flex flex-row gap-x-2 flex-wrap">
          <Text variant="small" classes={textColorClass}>
            ID: {player.ID}
          </Text>
          <Text variant="small" classes={textColorClass}>
            Position: {player.Position}
          </Text>
          <Text variant="small" classes={textColorClass}>
            Year: {getYear(player.Year, player.IsRedshirt)}
          </Text>
          <Text variant="small" classes={textColorClass}>
            Height: {HeightToFeetAndInches(player.Height).feet}'{" "}
            {HeightToFeetAndInches(player.Height).inches}"
          </Text>
          <Text variant="small" classes={textColorClass}>
            Weight: {player.Weight} lbs
          </Text>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2 text-sm pb-1">
          {attributes.map((attr) => (
            <MobileAttribute
              label={attr.label}
              value={attr.value}
              textColorClass={textColorClass}
            />
          ))}
        </div>
      </Border>
    </div>
  );
};
