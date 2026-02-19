import React from "react";
import {
  CollegePlayerSeasonStats as CFBPlayerSeasonStats,
  NFLPlayerSeasonStats,
} from "../../models/footballModels";
import {
  FootballStatsType,
  StatsView,
  BASE_FBA_SEASON,
} from "../../_constants/constants";
import { TableCell } from "../../_design/Table";
import { Text } from "../../_design/Typography";
import {
  getFBStatsDisplayValue,
  getHCKStatsDisplayValue,
} from "../../_utility/statsDisplayUtils";
import {
  CollegePlayerSeasonStats as CHLPlayerSeasonStats,
  ProfessionalPlayerSeasonStats,
} from "../../models/hockeyModels";

interface FBPlayerStatsRowProps {
  item: CFBPlayerSeasonStats | NFLPlayerSeasonStats;
  index: number;
  backgroundColor: string;
  valueLabels: string[];
  footballStatsType: FootballStatsType;
  statsView: StatsView;
}

export const FBPlayerStatsRow: React.FC<FBPlayerStatsRowProps> = ({
  item,
  index,
  backgroundColor,
  valueLabels,
  footballStatsType,
  statsView,
}) => {
  const isCareerRow = (item as any).isCareer;

  return (
    <div
      key={index}
      className={`table-row border-b dark:border-gray-700 text-left ${
        isCareerRow ? "font-semibold" : ""
      }`}
      style={{ backgroundColor }}
    >
      <TableCell>
        <Text variant="small">
          {isCareerRow ? "Career" : BASE_FBA_SEASON + item.SeasonID}
        </Text>
      </TableCell>

      {valueLabels.map((label, vIdx) => {
        const display = getFBStatsDisplayValue(
          item,
          label,
          footballStatsType,
          statsView,
        );

        return (
          <TableCell key={label + vIdx}>
            <Text variant="small">{display}</Text>
          </TableCell>
        );
      })}
    </div>
  );
};

interface HCKPlayerStatsRowProps {
  item: CHLPlayerSeasonStats | ProfessionalPlayerSeasonStats;
  index: number;
  backgroundColor: string;
  valueLabels: string[];
  isGoalie: boolean;
  statsView: StatsView;
}

export const HCKPlayerStatsRow: React.FC<HCKPlayerStatsRowProps> = ({
  item,
  index,
  backgroundColor,
  valueLabels,
  isGoalie,
  statsView,
}) => {
  const isCareerRow = (item as any).isCareer;

  return (
    <div
      key={index}
      className={`table-row border-b dark:border-gray-700 text-left ${
        isCareerRow ? "font-semibold" : ""
      }`}
      style={{ backgroundColor }}
    >
      <TableCell>
        <Text variant="small">
          {isCareerRow ? "Career" : BASE_FBA_SEASON + item.SeasonID}
        </Text>
      </TableCell>

      {valueLabels.map((label, vIdx) => {
        const display = getHCKStatsDisplayValue(
          item,
          label,
          isGoalie,
          statsView,
        );

        return (
          <TableCell key={label + vIdx}>
            <Text variant="small">{display}</Text>
          </TableCell>
        );
      })}
    </div>
  );
};
