import { NFLDraftPick, NFLPlayer } from "../../models/footballModels";
import { DraftPick, ProfessionalPlayer } from "../../models/hockeyModels";

export interface TradeBlockRow {
  id: number;
  isPlayer: boolean;
  name: string;
  position: string;
  arch: string;
  year: string;
  overall: string;
  draftRound: string;
  draftPick: string;
  value: string;
  player?: ProfessionalPlayer | NFLPlayer;
  pick?: DraftPick | NFLDraftPick;
  season?: number;
}
