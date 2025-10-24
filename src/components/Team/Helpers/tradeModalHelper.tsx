import { NFLTradeProposalDTO } from "../../../models/footballModels";
import { TradeOption, TradeProposal } from "../../../models/hockeyModels";
import { TradeBlockRow } from "../TeamPageTypes";

export const getTradeOptionsList = (rows: TradeBlockRow[]) => {
  const list: { label: string; value: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const label = item.isPlayer
      ? `${item.position} ${item.name} ${item.overall}`
      : `${item.season} Round ${item.draftRound}, Pick ${item.draftPick}`;

    // Keep index as the value.
    const value = i.toString();
    const obj = { label: label, value: value };
    list.push(obj);
  }

  return list;
};

export const mapSelectedOptionsToTradeOptions = (
  rows: TradeBlockRow[],
  teamID: number,
  salaryPercentages?: Record<number, number>
): any[] => {
  const list = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    let salaryPercentage = 0;
    if (row.isPlayer && salaryPercentages) {
      salaryPercentage = salaryPercentages[row.player!.ID] || 0;
    }

    const obj = {
      TeamID: teamID,
      PlayerID: row.isPlayer ? row.id : 0,
      OptionType: row.isPlayer ? "Player" : "DraftPick",
      DraftPickID: row.isPlayer ? 0 : row.id,
      Player: row.player,
      Draftpick: row.pick,
      SalaryPercentage: salaryPercentage,
    };
    list.push(obj);
  }
  return list;
};

export const mapHCKTradeProposals = (
  proposals: TradeProposal[],
  teamID: number
): TradeProposal[] => {
  const list: TradeProposal[] = [];
  if (!proposals || proposals.length === 0) return list;
  for (let i = 0; i < proposals.length; i++) {
    const item = proposals[i];
    const obj = new TradeProposal({
      ...item,
      TeamTradeOptions: item.TeamTradeOptions.filter(
        (x) => x.TeamID === teamID
      ),
      RecepientTeamTradeOptions: item.TeamTradeOptions.filter(
        (x) => x.TeamID !== teamID
      ),
    });
    list.push(obj);
  }
  return list;
};

export const mapFBATradeProposals = (
  proposals: NFLTradeProposalDTO[],
  teamID: number
): NFLTradeProposalDTO[] => {
  const list: NFLTradeProposalDTO[] = [];
  if (!proposals || proposals.length === 0) return list;
  for (let i = 0; i < proposals.length; i++) {
    const item = proposals[i];
    const obj = new NFLTradeProposalDTO({
      ...item,
      TeamTradeOptions: item.NFLTeamTradeOptions.filter(
        (x) => x.NFLTeamID === teamID
      ),
      RecepientTeamTradeOptions: item.RecepientTeamTradeOptions.filter(
        (x) => x.NFLTeamID !== teamID
      ),
    });
    list.push(obj);
  }
  return list;
};

export const mapTradeOptions = (
  options: TradeOption[],
  teamID: number
): TradeOption[] => {
  const list: TradeOption[] = [];
  if (!options || options.length === 0) return list;
  for (let i = 0; i < options.length; i++) {
    const item = options[i];
    if (item.TeamID === teamID) {
      const obj = new TradeOption({
        ...item,
      });
      list.push(obj);
    }
  }
  return list;
};
