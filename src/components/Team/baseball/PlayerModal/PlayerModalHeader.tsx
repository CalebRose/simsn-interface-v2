import { FC, memo, useMemo } from "react";
import { Text } from "../../../../_design/Typography";
import { Logo } from "../../../../_design/Logo";
import PlayerPicture from "../../../../_utility/usePlayerFaces";
import { getLogo } from "../../../../_utility/getLogo";
import { SimMLB, SimCollegeBaseball } from "../../../../_constants/constants";
import type { League } from "../../../../_constants/constants";
import type { ScoutingPlayerResponse } from "../../../../models/baseball/baseballScoutingModels";
import type { IFAAuctionDetail } from "../../../../models/baseball/baseballIFAModels";
import type { FAPlayerDetailResponse } from "../../../../models/baseball/baseballFreeAgencyModels";
import { useSimBaseballStore } from "../../../../context/SimBaseballContext";
import { useAuthStore } from "../../../../context/AuthContext";
import { BioField } from "./sections/BioField";
import { heightDisplay, formatCurrency } from "./utils/playerModalUtils";
import { getClassYear } from "../../../../_utility/baseballHelpers";
import type { PlayerModalContext } from "./usePlayerModalData";

interface PlayerModalHeaderProps {
  player: ScoutingPlayerResponse | null;
  faDetail: FAPlayerDetailResponse | null;
  ifaDetail: IFAAuctionDetail | null;
  context: PlayerModalContext;
  league: string;
  playerId: number;
}

export const PlayerModalHeader: FC<PlayerModalHeaderProps> = memo(
  ({ player, faDetail, ifaDetail, context, league, playerId }) => {
    const { allTeams } = useSimBaseballStore();
    const { currentUser } = useAuthStore();

    const isFreeAgent = context === "freeAgency" || context === "ifa";

    const team = useMemo(() => {
      if (isFreeAgent) return null;
      if (!player?.bio || !allTeams || allTeams.length === 0) return null;
      const playerOrgId = player.bio.org_id;
      if (!playerOrgId) return null;
      return allTeams.find((t) => t.org_id === playerOrgId) ?? null;
    }, [allTeams, player?.bio, isFreeAgent]);

    const teamLogo = useMemo(() => {
      if (!team) return "";
      return getLogo(
        league === SimMLB ? SimMLB : SimCollegeBaseball,
        team.team_id,
        currentUser?.IsRetro,
      );
    }, [team, league, currentUser?.IsRetro]);

    // IFA header
    if (context === "ifa" && ifaDetail) {
      return (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <BioField label="Age" value={String(ifaDetail.age)} />
          <BioField
            label="Type"
            value={ifaDetail.ptype === "Pitcher" ? "P" : "Pos"}
          />
          <BioField label="Country" value={ifaDetail.area} />
          <BioField
            label="Stars"
            value={
              "★".repeat(ifaDetail.star_rating) +
              "☆".repeat(5 - ifaDetail.star_rating)
            }
          />
          <BioField
            label="Slot Value"
            value={formatCurrency(ifaDetail.slot_value)}
          />
        </div>
      );
    }

    // FA header (standalone FA modal style)
    if (context === "freeAgency" && faDetail && !player) {
      const bio = faDetail.bio;
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-sm text-gray-300">
          <span>
            Age: <strong>{bio.age}</strong>
          </span>
          <span>{bio.ptype}</span>
          <span>
            {bio.bat_hand}/{bio.pitch_hand}
          </span>
          <span>
            {heightDisplay(bio.height)} {bio.weight} lbs
          </span>
          <span>
            OVR: <strong>{bio.displayovr ?? "—"}</strong>
          </span>
          {faDetail.demand?.war != null && (
            <span>
              WAR: <strong>{faDetail.demand.war}</strong>
            </span>
          )}
        </div>
      );
    }

    // Standard scouting / FA+scouting header
    if (!player) return null;
    const bio = player.bio;
    const isCollege = league === SimCollegeBaseball;

    return (
      <div className="flex gap-4">
        {/* Player Face + Team Logo */}
        <div className="flex flex-col items-center shrink-0">
          <div className="flex items-center justify-center h-[6rem] w-[6rem] sm:h-[8rem] sm:w-[8rem] px-5 rounded-lg border-2 bg-white">
            <PlayerPicture
              playerID={playerId}
              league={league as League}
              team={team}
            />
          </div>
          {isFreeAgent ? (
            <span className="mt-1 text-xs font-semibold text-gray-400">
              Free Agent
            </span>
          ) : team ? (
            <Logo
              url={teamLogo}
              label={team.team_abbrev ?? ""}
              classes="h-[3rem] max-h-[3rem]"
              containerClass="p-1"
              textClass="text-small"
            />
          ) : null}
        </div>

        {/* Bio Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
            <BioField label="Age" value={String(bio.age)} />
            <BioField label="Type" value={bio.ptype} />
            <BioField label="Area" value={bio.area} />
            <BioField label="Height" value={heightDisplay(bio.height)} />
            <BioField label="Weight" value={`${bio.weight} lbs`} />
            <BioField
              label="Bats / Throws"
              value={`${bio.bat_hand ?? "—"} / ${bio.pitch_hand ?? "—"}`}
            />
            <BioField label="Durability" value={bio.durability} />
            <BioField label="Injury Risk" value={bio.injury_risk} />
            <BioField label="Stamina" value={String(bio.stamina ?? 100)} />
            <BioField
              label="Origin"
              value={bio.intorusa === "usa" ? "USA" : "International"}
            />
          </div>
          {/* Contract/Year summary line */}
          {player.contract && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {isCollege ? (
                <span>
                  {getClassYear(player.contract).label || "—"} (Year{" "}
                  {player.contract.current_year} of {player.contract.years})
                  {player.contract.is_extension && (
                    <span className="ml-1 text-yellow-600 dark:text-yellow-400">
                      (Redshirt)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  Contract: Yr {player.contract.current_year} of{" "}
                  {player.contract.years}
                  {player.contract.current_year_detail?.base_salary != null && (
                    <span className="ml-1">
                      — $
                      {player.contract.current_year_detail.base_salary.toLocaleString()}
                    </span>
                  )}
                  {player.contract.on_ir && (
                    <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">
                      IL
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
