import { FC, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  VbLeagueKind,
  VbLineup,
  VbLineupView,
  VbPolicy,
  VbTeam,
  VolleyballManageService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
import { VbLoad, VbPanel, VbPlayerFace } from "./VbCommon";
import { vbErrorLines } from "./vbErrors";
import { vbLabel, vbShare } from "./vbFormatting";
import {
  VbField,
  vbFieldClass,
  VbManagePage,
  VbSaveBar,
  VbSlider,
  useVbManaged,
} from "./VbManage";
import { VbRatingsTable, VbRatingValues } from "./VbRatings";
import { useSportBannerFacts } from "../Common/SportBanner";
import { useVbFace } from "./useVbFaces";

const slots = [
  "Setter",
  "Outside1",
  "Outside2",
  "Middle1",
  "Middle2",
  "Opposite",
  "Libero",
] as const;
type Slot = (typeof slots)[number];
type Picks = Record<Slot, number | null>;

const slotLabels: Record<Slot, string> = {
  Setter: "Setter",
  Outside1: "Outside hitter",
  Outside2: "Outside hitter",
  Middle1: "Middle blocker",
  Middle2: "Middle blocker",
  Opposite: "Opposite",
  Libero: "Libero (optional)",
};

interface Draft {
  /** The staff picks the lineup every match. */
  auto: boolean;
  picks: Picks;
  policy: VbPolicy;
}

const noPicks: Picks = {
  Setter: null,
  Outside1: null,
  Outside2: null,
  Middle1: null,
  Middle2: null,
  Opposite: null,
  Libero: null,
};

const draftFrom = (view: VbLineupView): Draft => ({
  auto: view.Lineup === null,
  picks: view.Lineup
    ? {
        Setter: view.Lineup.Setter,
        Outside1: view.Lineup.Outsides[0],
        Outside2: view.Lineup.Outsides[1],
        Middle1: view.Lineup.Middles[0],
        Middle2: view.Lineup.Middles[1],
        Opposite: view.Lineup.Opposite,
        Libero: view.Lineup.Libero ?? null,
      }
    : noPicks,
  policy: view.Policy,
});

const policyFields: Array<{
  key: keyof VbPolicy;
  label: string;
  help: string;
}> = [
  {
    key: "FatigueSubOut",
    label: "Take a player off at",
    help: "How tired a player gets before she is substituted.",
  },
  {
    key: "FatigueSubIn",
    label: "Bring her back at",
    help: "How far she must recover first. Must be below the level above.",
  },
  {
    key: "TimeoutOnOpponentRun",
    label: "Timeout after a run of",
    help: "Call a timeout once the opponent scores this many points in a row.",
  },
  {
    key: "ServeAggression",
    label: "Serve aggression",
    help: "Higher means more aces and more service errors.",
  },
];

/** A lineup pick's face, or an empty circle until someone is picked. */
const PickFace: FC<{
  playerId: number | null | undefined;
  team: VbTeam;
  classes: string;
}> = ({ playerId, team, classes }) => {
  const face = useVbFace(playerId);
  return (
    <VbPlayerFace
      face={playerId ? face : null}
      team={team}
      variant="avatar"
      classes={classes}
    />
  );
};

const LineupBody: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({
  kind,
  team,
}) => {
  const id = team.TeamID;
  const pro = kind === "pro";
  const view = useVbManaged(`manage-lineup:${id}`, () =>
    VolleyballManageService.getLineup(id),
  );
  // The candidates. A pro's ratings are true; a college player's are her
  // staff's estimates.
  const roster = useVbResource<{
    Players: Array<{
      PlayerID: number;
      Name: string;
      Jersey: string | null;
      ProRatings?: Record<string, number>;
      Injury?: { Status: string } | null;
    }>;
  }>(`${pro ? "pro-roster" : "roster"}:${id}`, () =>
    pro ? VolleyballService.getProRoster(id) : VolleyballService.getRoster(id),
  );
  const estimates = useVbResource(pro ? null : `estimates:${id}:${id}`, () =>
    VolleyballManageService.getTeamEstimates(id, id),
  );
  // Each player's best role, and whether the system is a 6-2, come from the
  // development and tactics views. Both are helpers here: the page still
  // works if either fails.
  const development = useVbResource(`manage-development:${id}`, () =>
    VolleyballManageService.getDevelopment(id),
  );
  const tactics = useVbResource(`manage-tactics:${id}`, () =>
    VolleyballManageService.getTactics(id),
  );
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const players = roster.data?.Players ?? [];
  const bestRole = Object.fromEntries(
    (development.data?.Players ?? []).map((player) => [
      player.PlayerID,
      player.BestRole,
    ]),
  );
  const ratings: Record<number, VbRatingValues | undefined> = pro
    ? Object.fromEntries(
        players.map((player) => [player.PlayerID, player.ProRatings]),
      )
    : Object.fromEntries(
        (estimates.data?.Athletes ?? []).map((athlete) => [
          athlete.PlayerID,
          athlete.Grades,
        ]),
      );
  const twoSetters = tactics.data?.Tactics.Offense.System === "6-2";
  // Whose lineup plays, and whether there is something to save.
  const auto = view.data ? (draft ?? draftFrom(view.data)).auto : null;
  useSportBannerFacts([
    auto === true && "Staff picks the lineup",
    auto === false && "Your picks",
    draft !== null && "Unsaved changes",
  ]);

  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved = view.data;
  const current = draft ?? draftFrom(saved);
  const change = (next: Partial<Draft>) => {
    setDraft({ ...current, ...next });
    setErrors([]);
  };
  const effective = (key: keyof VbPolicy) =>
    current.policy[key] ?? saved.Defaults[key];

  const save = async () => {
    const problems: string[] = [];
    const { picks } = current;
    if (!current.auto) {
      const missing = slots.filter(
        (slot) => slot !== "Libero" && picks[slot] === null,
      );
      if (missing.length) {
        problems.push("Pick a player for every slot except the libero.");
      }
    }
    if (effective("FatigueSubIn") >= effective("FatigueSubOut")) {
      problems.push(
        "The level to bring a player back must be below the level to take her off.",
      );
    }
    if (problems.length) return setErrors(problems);

    const lineup: VbLineup | null = current.auto
      ? null
      : {
          Setter: picks.Setter!,
          Outsides: [picks.Outside1!, picks.Outside2!],
          Middles: [picks.Middle1!, picks.Middle2!],
          Opposite: picks.Opposite!,
          Libero: picks.Libero,
        };
    // A policy that is sent replaces the saved one whole, so this is always
    // the full policy: every field the coach set, and none left on the default.
    const custom = Object.fromEntries(
      Object.entries(current.policy).filter(([, value]) => value !== null),
    );
    setSaving(true);
    try {
      view.store(
        await VolleyballManageService.saveLineup(id, {
          Lineup: lineup,
          Policy: Object.keys(custom).length ? custom : null,
        }),
      );
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Lineup saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  const projected = saved.Projected;
  const serve = saved.ServeAggression;

  const taken = (slot: Slot) =>
    new Set(
      slots
        .filter((other) => other !== slot)
        .map((other) => current.picks[other])
        .filter((playerId): playerId is number => playerId !== null),
    );

  return (
    <>
      <VbPanel title="Starting lineup">
        <div className="space-y-2 p-3">
          <label className="flex items-center gap-2 text-left text-sm">
            <input
              type="checkbox"
              checked={current.auto}
              onChange={(event) => change({ auto: event.target.checked })}
            />
            Let my staff pick the lineup every match
          </label>
          {!current.auto && (
            <div className="grid gap-x-6 sm:grid-cols-2">
              {slots.map((slot) => {
                const used = taken(slot);
                const label =
                  slot === "Opposite" && twoSetters
                    ? "Second setter (6-2)"
                    : slotLabels[slot];
                return (
                  <VbField key={slot} label={label}>
                    <div className="flex items-center gap-2">
                    <PickFace
                      playerId={current.picks[slot]}
                      team={team}
                      classes="h-9 w-9"
                    />
                    <select
                      className={`${vbFieldClass} w-full`}
                      aria-label={label}
                      value={current.picks[slot] ?? ""}
                      onChange={(event) =>
                        change({
                          picks: {
                            ...current.picks,
                            [slot]: event.target.value
                              ? Number(event.target.value)
                              : null,
                          },
                        })
                      }
                    >
                      <option value="">
                        {slot === "Libero" ? "Best one left" : "Choose..."}
                      </option>
                      {players.map((player) => (
                        <option
                          key={player.PlayerID}
                          value={player.PlayerID}
                          disabled={used.has(player.PlayerID)}
                        >
                          {player.Jersey ? `#${player.Jersey} ` : ""}
                          {player.Name}
                          {bestRole[player.PlayerID]
                            ? ` · ${bestRole[player.PlayerID]}`
                            : ""}
                          {player.Injury ? ` · ${player.Injury.Status}` : ""}
                        </option>
                      ))}
                    </select>
                    </div>
                  </VbField>
                );
              })}
            </div>
          )}
          <div className="text-left text-xs text-(--text-muted)">
            The picks are placed in rotation order for you. A pick who is
            injured on match day is replaced by the best fit left on the
            roster, never by another of your picks. Substitutions follow the
            policy below; there is no depth chart.
          </div>
        </div>
      </VbPanel>

      {projected && projected.Rotation?.length > 0 && (
        <VbPanel title="Next match: projected starters">
          {/* The six as they line up for the first serve, net at the top. */}
          <div className="p-3">
            <div className="mx-auto grid max-w-xl grid-cols-3 border-t-4 border-(--text-primary)">
              {[4, 3, 2, 5, 6, 1].map((position) => {
                const spot = projected.Rotation.find(
                  (item) => item.Position === position,
                );
                return (
                  <div
                    key={position}
                    className="flex min-h-20 flex-col items-center justify-center border border-(--border-primary) p-2 text-center text-sm"
                  >
                    <div className="text-xs text-(--text-muted)">
                      {position === 1 ? "Serves first" : `Serves ${position}`}
                      {spot?.Role ? ` · ${vbLabel(spot.Role)}` : ""}
                    </div>
                    {spot && (
                      <PickFace
                        playerId={spot.PlayerID}
                        team={team}
                        classes="my-1 h-12 w-12"
                      />
                    )}
                    <div className="font-semibold">
                      {spot
                        ? (spot.Name ?? `Player ${spot.PlayerID}`)
                        : "—"}
                    </div>
                    {spot &&
                      projected.LiberoReplaces?.includes(spot.PlayerID) && (
                        <div className="text-xs text-(--text-muted)">
                          libero comes on for her
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            {projected.LiberoName && (
              <div className="mt-2 text-center text-sm">
                <span className="text-(--text-muted)">Libero</span>{" "}
                <span className="font-semibold">{projected.LiberoName}</span>
              </div>
            )}
          </div>
          <div className="space-y-1 px-3 py-2 text-left text-xs text-(--text-muted)">
            {projected.Unavailable?.length > 0 && (
              <div className="text-(--accent-error)">
                Unavailable:{" "}
                {projected.Unavailable.map(
                  (player) => player.Name ?? `Player ${player.PlayerID}`,
                ).join(", ")}
              </div>
            )}
            {projected.ChangedFromPicks && (
              <div className="text-(--accent-warning)">
                This differs from your saved picks, because a pick cannot play.
              </div>
            )}
            <div>
              This is the lineup as it stands for the next match. An injury
              before then can still change it.
            </div>
          </div>
        </VbPanel>
      )}

      <VbPanel title="Match policy">
        <div className="p-3">
          {policyFields.map(({ key, label, help }) => {
            const custom = current.policy[key] !== null;
            const setValue = (value: number | null) =>
              change({ policy: { ...current.policy, [key]: value } });
            return (
              <VbField key={key} label={label} help={help}>
                <div className="flex flex-wrap items-center gap-3">
                  {key === "TimeoutOnOpponentRun" ? (
                    <input
                      type="number"
                      className={`${vbFieldClass} w-20`}
                      aria-label={label}
                      min={2}
                      max={10}
                      step={1}
                      disabled={!custom}
                      value={effective(key)}
                      onChange={(event) =>
                        setValue(
                          Math.min(10, Math.max(2, Number(event.target.value))),
                        )
                      }
                    />
                  ) : (
                    <VbSlider
                      label={label}
                      value={effective(key)}
                      disabled={!custom}
                      onChange={setValue}
                    />
                  )}
                  <label className="flex items-center gap-1 text-xs text-(--text-muted)">
                    <input
                      type="checkbox"
                      checked={!custom}
                      onChange={(event) =>
                        setValue(
                          event.target.checked ? null : saved.Defaults[key],
                        )
                      }
                    />
                    Use the default (
                    {key === "TimeoutOnOpponentRun"
                      ? `${saved.Defaults[key]} points`
                      : vbShare(saved.Defaults[key])}
                    )
                  </label>
                </div>
              </VbField>
            );
          })}
          {serve && typeof serve.Effective === "number" && (
            <div className="text-left text-xs text-(--text-muted)">
              Serve aggression in force as saved: {vbShare(serve.Effective)},
              from{" "}
              {serve.Source === "policy"
                ? "this policy"
                : serve.Source === "team_system"
                  ? "your team system under Tactics"
                  : "the default"}
              . For any one
              match the first of these that is set wins: your game plan for
              that opponent, this policy, your team system under Tactics, then
              50%.
            </div>
          )}
        </div>
      </VbPanel>

      <VbSaveBar
        dirty={draft !== null}
        saving={saving}
        errors={errors}
        onSave={save}
        onReset={() => {
          setDraft(null);
          setErrors([]);
        }}
      />

      <VbPanel title={pro ? "Roster ratings" : "Your staff's estimate"}>
        <VbLoad
          loading={roster.loading || estimates.loading}
          error={roster.error ?? estimates.error}
          rows={12}
        >
          <VbRatingsTable
            players={players}
            values={ratings}
            lead={{
              heading: "Best role",
              cell: (playerId) => bestRole[playerId] ?? "—",
            }}
          />
          <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
            {pro
              ? "Pro ratings are true values on a 0–50 scale."
              : "Grades run F to A+. A range means your staff is not sure of the rating."}
          </div>
        </VbLoad>
      </VbPanel>
    </>
  );
};

export const VolleyballLineupPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbManagePage kind={kind} title="Lineup">
    {(team) => <LineupBody key={team.TeamID} kind={kind} team={team} />}
  </VbManagePage>
);
