import { VbProPlayer, VbRosterPlayer } from "../../_services/volleyballService";

// The player window itself lives in VbPlayerCard. This file keeps the two
// roster-row helpers the roster and lineup pages share.

export type VbAnyPlayer = VbRosterPlayer | VbProPlayer;

export const isVbProPlayer = (player: VbAnyPlayer): player is VbProPlayer =>
  "ProRatings" in player;

export { VbAwardList, VbFact } from "./VbPlayerCard";
