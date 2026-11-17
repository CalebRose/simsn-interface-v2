import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SportSurface } from "../Common/SportKit";
import { useNavigate } from "react-router-dom";
import { SportButton } from "../Common/SportKit";
import { Logo } from "../../_design/Logo";
import { Modal } from "../../_design/Modal";
import { Tag } from "../../_design/Tags";
import { UnderlineTabs } from "../../_design/UnderlineTabs";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbAward,
  VbTeam,
  VolleyballRecruitingService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbTeams } from "./useVbData";
import { useVbFace } from "./useVbFaces";
import { VbEmpty, vbLinkClass, vbLinkProps, VbLoad, VbPlayerFace } from "./VbCommon";
import {
  vbAwardLabel,
  vbHeight,
  vbLabel,
  vbMoney,
  vbPaths,
  vbTeamLogo,
} from "./vbFormatting";
import { VbGrade, VbGradeCard, vbGradeNote, vbGradesFor } from "./VbGrades";
import { VbRatingsGrid } from "./VbRatings";
import { VbPlayerStatsTable } from "./VbStats";

// One player view for the whole of volleyball: wherever a player's name
// appears, selecting it opens this window. It is built like the baseball
// player window: face and biography at the top, then tabs.

const OpenPlayer = createContext<(playerId: number) => void>(() => {});

/** Opens the player window for a player id. Works on any volleyball page. */
export const useVbOpenPlayer = () => useContext(OpenPlayer);

/**
 * A player's name, with her face beside it, that opens her window. The faces
 * of a whole table are fetched together (useVbFace).
 */
export const VbPlayerLink: FC<{
  playerId: number;
  name: ReactNode;
  classes?: string;
  /** The face beside the name. Off where the row already draws one. */
  face?: boolean;
  /** Her team, for the ring round the face and her jersey colours. */
  team?: Pick<VbTeam, "ColorOne" | "ColorTwo" | "ColorThree"> | null;
  /** Or just its id, looked up among the league's teams. */
  teamId?: number | null;
}> = ({ playerId, name, classes = "", face = true, team, teamId }) => {
  const open = useVbOpenPlayer();
  const faceData = useVbFace(playerId, face);
  const { vbTeamsById } = useSimVBStore();
  const shownTeam = team ?? (teamId ? vbTeamsById[teamId] : null);
  const link = (
    <span
      {...vbLinkProps(() => open(playerId))}
      className={`${vbLinkClass} ${classes}`}
    >
      {name}
    </span>
  );
  if (!face) return link;
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 align-middle">
      <VbPlayerFace
        face={faceData}
        team={shownTeam}
        variant="avatar"
        classes="h-7 w-7"
      />
      {link}
    </span>
  );
};

export const VbAwardList: FC<{ awards: VbAward[] }> = ({ awards }) =>
  awards.length ? (
    <ul className="space-y-1 text-left text-sm">
      {awards.map((award, index) => (
        <li key={index} className="flex gap-3">
          <span className="w-10 shrink-0 tabular-nums text-(--text-muted)">
            {award.Season}
          </span>
          <span>
            {vbAwardLabel(award)}
            <span className="text-(--text-muted)"> · {award.Team}</span>
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <VbEmpty>No awards on record.</VbEmpty>
  );

/** A labelled fact in a biography grid. */
export const VbFact: FC<{
  label: string;
  value: ReactNode;
  title?: string;
}> = ({ label, value, title }) => (
  <div className="text-left" title={title}>
    <div className="text-xs uppercase text-(--text-muted)">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);

const positionNotes: Record<string, string> = {
  started: "The role she started in most in her latest season with starts",
  best_fit: "Her best-fit role: she has no starts on record",
  recruiting: "Her listed role as a recruit",
};

type CardTab = "attributes" | "statistics" | "awards" | "contract";

const PlayerWindow: FC<{ playerId: number; onClose: () => void }> = ({
  playerId,
  onClose,
}) => {
  const navigate = useNavigate();
  const { vbTeamsById, vbLeagues, cvbTeam } = useSimVBStore();
  const [tab, setTab] = useState<CardTab>("attributes");
  const profile = useVbResource(`player:${playerId}`, () =>
    VolleyballService.getPlayer(playerId),
  );
  const faces = useVbResource(`face:${playerId}`, () =>
    VolleyballService.getFaces([playerId]),
  );
  const stats = useVbResource(
    tab === "statistics" ? `player-stats:${playerId}:all` : null,
    () => VolleyballService.getPlayerStats(playerId),
  );
  const awards = useVbResource(
    tab === "awards" ? `player-awards:${playerId}` : null,
    () => VolleyballService.getPlayerAwards(playerId),
  );
  const player = profile.data;
  const home = player ? (player.Team ?? player.LastTeam) : null;
  const kind = home?.LeagueKind ?? "college";
  useVbTeams(kind);
  const team = home ? vbTeamsById[home.TeamID] : undefined;
  const pro = Boolean(player?.ProRatings);
  // A college coach sees their own staff's estimate of a college player:
  // family grades, overalls and all 26 ratings, each as a range.
  const scoutId = player && !pro && cvbTeam ? cvbTeam.TeamID : undefined;
  const estimate = useVbResource(
    scoutId ? `estimate:${scoutId}:${playerId}` : null,
    () => VolleyballRecruitingService.getEstimates(scoutId!, [playerId]),
  );
  const athlete = estimate.data?.Athletes.find(
    (item) => item.PlayerID === playerId,
  );
  const grades = player ? vbGradesFor(player.AbilityGrades, athlete) : null;
  const ratings = player?.ProRatings ?? athlete?.Grades;

  const tabs: Array<readonly [CardTab, string]> = [
    ["attributes", "Attributes"],
    ["statistics", "Statistics"],
    ["awards", "Awards"],
    ...(player?.Contract ? [["contract", "Contract"] as const] : []),
  ];

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={
        player
          ? `${player.Jersey ? `#${player.Jersey} ` : ""}${player.Name}`
          : "Player"
      }
      maxWidth="max-w-3xl"
      actions={
        <>
          <SportButton
            variant="secondary"
            onClick={() => {
              onClose();
              navigate(vbPaths(kind).player(playerId));
            }}
          >
            Full profile
          </SportButton>
          <SportButton variant="danger" onClick={onClose}>
            Close
          </SportButton>
        </>
      }
    >
      <VbLoad
        loading={profile.loading}
        error={profile.error}
        notPublished=""
        rows={6}
      >
        {player && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col">
                <VbPlayerFace
                  face={faces.data?.[playerId]}
                  team={team ?? null}
                  classes="h-24 w-24 sm:h-32 sm:w-32"
                />
                {home ? (
                  <div
                    {...vbLinkProps(() => {
                      onClose();
                      navigate(vbPaths(home.LeagueKind).team(home.TeamID));
                    })}
                    className="flex cursor-pointer flex-col items-center gap-1 text-xs"
                    title={player.Team ? home.Name : `Last team: ${home.Name}`}
                  >
                    <Logo
                      url={vbTeamLogo(team, kind, vbLeagues[kind])}
                      variant="small"
                    />
                    <span className="text-(--text-muted)">
                      {player.Team ? home.Name : `Last: ${home.Name}`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-(--text-muted)">No team</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                    <VbFact
                      label="Position"
                      value={player.Position ?? "—"}
                      title={
                        player.PositionSource
                          ? positionNotes[player.PositionSource]
                          : undefined
                      }
                    />
                    {player.Class && <VbFact label="Class" value={player.Class} />}
                    <VbFact label="Age" value={player.Age ?? "—"} />
                    <VbFact label="Height" value={vbHeight(player.HeightCm)} />
                    <VbFact
                      label="Reach"
                      value={vbHeight(player.StandingReachCm)}
                      title="Standing reach"
                    />
                    {player.Hometown && (
                      <VbFact label="Hometown" value={player.Hometown} />
                    )}
                    <VbFact label="Status" value={vbLabel(player.Status)} />
                  </div>
                  {grades?.Overall && (
                    <div className="flex shrink-0 flex-col items-center rounded-lg bg-(--sport-surface-2) px-3 py-2">
                      <div className="text-xs uppercase text-(--text-muted)">
                        Overall
                      </div>
                      <div className="text-3xl">
                        <VbGrade value={grades.Overall} />
                      </div>
                    </div>
                  )}
                </div>
                {player.Tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {player.Tags.map((tag) => (
                      <Tag key={tag}>{vbLabel(tag)}</Tag>
                    ))}
                  </div>
                )}
                {player.Contract && (
                  <div className="text-left text-xs text-(--text-muted)">
                    {vbMoney(player.Contract.Salary)} through{" "}
                    {player.Contract.Through}
                  </div>
                )}
                {player.Injury && (
                  <div className="text-left text-sm text-(--accent-error)">
                    {player.Injury.Status}: {vbLabel(player.Injury.BodyPart)} ·
                    expected back {player.Injury.ExpectedReturn}
                  </div>
                )}
              </div>
            </div>

            <UnderlineTabs tabs={tabs} value={tab} onChange={setTab} />

            {tab === "attributes" && (
              <div className="space-y-3">
                {grades ? (
                  <SportSurface classes="p-3">
                    <VbGradeCard grades={grades} position={player.Position} />
                  </SportSurface>
                ) : (
                  <SportSurface classes="p-3">
                    <VbEmpty>No grades are available for her.</VbEmpty>
                  </SportSurface>
                )}
                {ratings ? (
                  <SportSurface classes="p-3">
                    <VbRatingsGrid values={ratings} />
                  </SportSurface>
                ) : (
                  <SportSurface classes="border border-dashed border-(--sport-divider) p-3 opacity-70">
                    <div className="text-left text-xs italic text-(--text-muted)">
                      Her 26 individual ratings are known only to coaching
                      staffs, as estimates.
                    </div>
                  </SportSurface>
                )}
                <div className="text-left text-xs text-(--text-muted)">
                  {vbGradeNote(grades, pro)}
                  {pro ? " Ratings are true values on a 0–50 scale." : ""}
                </div>
              </div>
            )}
            {tab === "statistics" && (
              <SportSurface classes="overflow-x-auto p-0">
                <VbLoad loading={stats.loading} error={stats.error} rows={4}>
                  {stats.data && (
                    <VbPlayerStatsTable stats={stats.data} perSet={false} />
                  )}
                </VbLoad>
              </SportSurface>
            )}
            {tab === "awards" && (
              <SportSurface classes="p-3">
                <VbLoad loading={awards.loading} error={awards.error} rows={3}>
                  <VbAwardList awards={awards.data?.Awards ?? []} />
                </VbLoad>
              </SportSurface>
            )}
            {tab === "contract" && player.Contract && (
              <SportSurface classes="p-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <VbFact label="Salary" value={vbMoney(player.Contract.Salary)} />
                  <VbFact label="Through" value={player.Contract.Through} />
                  <VbFact label="Kind" value={vbLabel(player.Contract.Kind)} />
                </div>
              </SportSurface>
            )}
          </div>
        )}
      </VbLoad>
    </Modal>
  );
};

/**
 * Holds the one player window for a volleyball page. The page shell wraps
 * every volleyball page in it.
 */
export const VbPlayerCardProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [playerId, setPlayerId] = useState<number | null>(null);
  const open = useCallback((id: number) => setPlayerId(id), []);
  const close = useCallback(() => setPlayerId(null), []);
  // A window left open would follow the user to the next page.
  useEffect(() => close, [close]);
  return (
    <OpenPlayer.Provider value={open}>
      {children}
      {playerId !== null && (
        <PlayerWindow key={playerId} playerId={playerId} onClose={close} />
      )}
    </OpenPlayer.Provider>
  );
};
