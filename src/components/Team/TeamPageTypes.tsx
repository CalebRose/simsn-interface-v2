import {
  DraftPick as NBADraftPick,
  NBAPlayer,
} from "../../models/basketballModels";
import { NFLDraftPick, NFLPlayer } from "../../models/footballModels";
import {
  DraftPick as PHLDraftPick,
  ProfessionalPlayer,
} from "../../models/hockeyModels";

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
  player?: ProfessionalPlayer | NFLPlayer | NBAPlayer;
  pick?: PHLDraftPick | NFLDraftPick | NBADraftPick;
  season?: number;
}
