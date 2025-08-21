import { MatchResultsPlayer } from "../../../models/basketballModels";

export const getBasketballResultsColumns = () => {
  return [
    { header: "Player", accessor: "LastName" },
    { header: "Min", accessor: "Minutes" },
    { header: "FGM", accessor: "FGM" },
    { header: "FGA", accessor: "FGA" },
    { header: "FG%", accessor: "FGPercentage" },
    { header: "3PM", accessor: "ThreePM" },
    { header: "3PA", accessor: "ThreePA" },
    { header: "3P%", accessor: "ThreePAPercentage" },
    { header: "FTM", accessor: "FTM" },
    { header: "FTA", accessor: "FTA" },
    { header: "FT%", accessor: "FTPercentage" },
    { header: "Points", accessor: "Points" },
    { header: "Off. Reb.", accessor: "OffensiveRebounds" },
    { header: "Def. Reb.", accessor: "DefensiveRebounds" },
    { header: "Tot. Reb.", accessor: "TotalRebounds" },
    { header: "Assists", accessor: "Assists" },
    { header: "Steals", accessor: "Steals" },
    { header: "Blocks", accessor: "Blocks" },
    { header: "TO", accessor: "Turnovers" },
    { header: "Fouls", accessor: "Fouls" },
  ];
};

export const GetBasketballResultsValues = (item: MatchResultsPlayer) => {
  return [
    {
      label: "Player",
      value: `${item.Position} ${item.FirstName} ${item.LastName}`,
    },
    { label: "Min", value: item.Minutes },
    { label: "FGM", value: item.FGM },
    { label: "FGA", value: item.FGA },
    { label: "FG%", value: item.FGPercent.toFixed(2) },
    { label: "3PM", value: item.ThreePointsMade },
    { label: "3PA", value: item.ThreePointAttempts },
    { label: "3P%", value: item.ThreePointPercent.toFixed(2) },
    { label: "FTM", value: item.FTM },
    { label: "FTA", value: item.FTA },
    { label: "FT%", value: item.FTPercent.toFixed(2) },
    { label: "Points", value: item.Points },
    { label: "Offensive Rebounds", value: item.OffRebounds },
    { label: "Defensive Rebounds", value: item.DefRebounds },
    { label: "Total Rebounds", value: item.TotalRebounds },
    { label: "Assists", value: item.Assists },
    { label: "Steals", value: item.Steals },
    { label: "Blocks", value: item.Blocks },
    { label: "Turnovers", value: item.Turnovers },
    { label: "Fouls", value: item.Fouls },
  ];
};
