import { SportSegmented } from "../Common/SportKit";
import { FC, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import { Modal } from "../../_design/Modal";
import { Tag } from "../../_design/Tags";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import {
  VbAttentionView,
  VbDevelopmentPlan,
  VbDevelopmentView,
  VbLeagueKind,
  VbTeam,
  VolleyballManageService,
} from "../../_services/volleyballService";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  vbLinkClass,
  vbLinkProps,
  VbLoad,
  vbNum,
  VbPanel,
  vbRowClass,
  vbTableClass,
} from "./VbCommon";
import { vbErrorLines } from "./vbErrors";
import { VbPlayerLink } from "./VbPlayerCard";
import { vbLabel, vbShare } from "./vbFormatting";
import {
  VbChoice,
  VbField,
  vbFieldClass,
  VbManagePage,
  VbSaveBar,
  VbSlider,
  useVbManaged,
} from "./VbManage";

// The seven training areas. A plan may name one rating to emphasize within
// an area; the API's FocusOptions says which, and the lists here are only
// used when it sends none.
const areas: Array<[area: string, ratings: string[]]> = [
  ["Serve", ["servePower", "servePlacement", "serveMovement"]],
  ["Receive", ["serveReceive", "ballControl"]],
  ["Set", ["settingHands", "tempo", "setterVision"]],
  ["Attack", ["attackPower", "attackPlacement", "approachTiming", "attackVision"]],
  ["Block", ["blockTechnique", "blockFootwork", "blockRead"]],
  ["Defense", ["digging", "pursuit", "defensiveRead"]],
  [
    "Physical",
    ["vertical", "quickness", "lateralMovement", "power", "reflexes", "stamina"],
  ],
];

const evenPlan: VbDevelopmentPlan = {
  Areas: Object.fromEntries(areas.map(([area]) => [area, 1 / areas.length])),
};

/** Shares as the server will store them: scaled to sum to 1. */
const normalized = (plan: VbDevelopmentPlan) => {
  const total = areas.reduce((sum, [area]) => sum + (plan.Areas[area] ?? 0), 0);
  return total > 0 ? total : 1;
};

// One colour per training area, the same wherever a split is drawn.
const areaColors: Record<string, string> = {
  Serve: "#f59e0b",
  Receive: "#10b981",
  Set: "#8b5cf6",
  Attack: "#ef4444",
  Block: "#3b82f6",
  Defense: "#14b8a6",
  Physical: "#9ca3af",
};

// Starting points for a plan. Each is a set of weights; the editor shows
// them as shares of the whole.
const presets: Array<[label: string, weights: Record<string, number>]> = [
  ["Even", Object.fromEntries(areas.map(([area]) => [area, 1]))],
  ["Attack first", { Serve: 1, Receive: 1, Set: 1, Attack: 3, Block: 1, Defense: 1, Physical: 1 }],
  ["Serve and pass", { Serve: 3, Receive: 3, Set: 1, Attack: 1, Block: 1, Defense: 1, Physical: 1 }],
  ["Block and defend", { Serve: 1, Receive: 1, Set: 1, Attack: 1, Block: 3, Defense: 3, Physical: 1 }],
  ["Physical base", { Serve: 1, Receive: 1, Set: 1, Attack: 1, Block: 1, Defense: 1, Physical: 4 }],
];

/** A plan's split as one bar, each area a coloured segment. */
const SplitBar: FC<{ plan: VbDevelopmentPlan; tall?: boolean }> = ({
  plan,
  tall = false,
}) => {
  const total = normalized(plan);
  return (
    <div
      className={`flex w-full overflow-hidden rounded ${tall ? "h-5" : "h-2.5"}`}
      role="img"
      aria-label={areas
        .map(([area]) => `${area} ${vbShare((plan.Areas[area] ?? 0) / total)}`)
        .join(", ")}
    >
      {areas.map(([area]) => {
        const share = (plan.Areas[area] ?? 0) / total;
        return share > 0 ? (
          <div
            key={area}
            title={`${area} ${vbShare(share)}`}
            style={{ width: `${share * 100}%`, backgroundColor: areaColors[area] }}
          />
        ) : null;
      })}
    </div>
  );
};

const PlanEditor: FC<{
  plan: VbDevelopmentPlan;
  focusOptions?: Record<string, string[]>;
  onChange: (plan: VbDevelopmentPlan) => void;
}> = ({ plan, focusOptions, onChange }) => {
  const total = normalized(plan);
  return (
    <div className="space-y-3">
      <div>
        <SplitBar plan={plan} tall />
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {areas.map(([area]) => (
            <span key={area} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: areaColors[area] }}
              />
              {area} {vbShare((plan.Areas[area] ?? 0) / total)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 text-xs uppercase text-(--text-muted)">
          Start from
        </span>
        {presets.map(([label, weights]) => (
          <SportButton
            key={label}
            size="xs"
            variant="secondary"
            // An emphasis is kept: a preset only moves the time.
            onClick={() => onChange({ ...plan, Areas: { ...weights } })}
          >
            {label}
          </SportButton>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {areas.map(([area, fallback]) => {
          // Matched without regard to case, in case the API keys areas its own way.
          const served = Object.entries(focusOptions ?? {}).find(
            ([key]) => key.toLowerCase() === area.toLowerCase(),
          )?.[1];
          const ratings = served ?? fallback;
          const share = (plan.Areas[area] ?? 0) / total;
          return (
            <div
              key={area}
              className="rounded-lg bg-(--sport-surface-2) p-2 text-left"
              style={{ borderTop: `4px solid ${areaColors[area]}` }}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold">{area}</span>
                <span className="text-lg font-bold tabular-nums">
                  {vbShare(share)}
                </span>
              </div>
              <input
                type="range"
                className="w-full"
                aria-label={`${area} share`}
                min={0}
                max={1}
                step={0.05}
                value={plan.Areas[area] ?? 0}
                onChange={(event) =>
                  onChange({
                    ...plan,
                    Areas: { ...plan.Areas, [area]: Number(event.target.value) },
                  })
                }
              />
              <select
                className={`${vbFieldClass} mt-1 w-full`}
                aria-label={`${area} emphasis`}
                value={plan.Focus?.[area] ?? ""}
                onChange={(event) => {
                  const focus = { ...plan.Focus };
                  if (event.target.value) focus[area] = event.target.value;
                  else delete focus[area];
                  onChange({ ...plan, Focus: focus });
                }}
              >
                <option value="">No emphasis</option>
                {ratings.map((rating) => (
                  <option key={rating} value={rating}>
                    Emphasize {vbLabel(rating).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
      <div className="text-left text-xs text-(--text-muted)">
        The sliders are weights: the shares always add up to 100%. An emphasis
        puts more of an area's time into one rating.
      </div>
    </div>
  );
};

type Source = VbDevelopmentView["Players"][number]["Source"];

const sourceLabels: Record<Source, string> = {
  player: "Own plan",
  template: "Team plan",
  default: "Default",
};

const sourceTags: Record<Source, "blue" | "green" | "gray"> = {
  player: "blue",
  template: "green",
  default: "gray",
};

const TrainingPlans: FC<{ team: VbTeam }> = ({ team }) => {
  const id = team.TeamID;
  const view = useVbManaged(`manage-development:${id}`, () =>
    VolleyballManageService.getDevelopment(id),
  );
  const [template, setTemplate] = useState<VbDevelopmentPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [editing, setEditing] = useState<{
    PlayerID: number;
    Name: string;
    plan: VbDevelopmentPlan;
  } | null>(null);
  const [playerErrors, setPlayerErrors] = useState<string[]>([]);
  const [show, setShow] = useState<Source | "all">("all");

  const save = async (
    body: Parameters<typeof VolleyballManageService.saveDevelopment>[1],
    done: () => void,
    fail: (lines: string[]) => void,
  ) => {
    setSaving(true);
    try {
      view.store(await VolleyballManageService.saveDevelopment(id, body));
      done();
      enqueueSnackbar("Training plan saved.", { variant: "success" });
    } catch (reason) {
      fail(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved = view.data;
  const currentTemplate = template ?? saved.Template ?? evenPlan;
  const savePlayer = (plan: VbDevelopmentPlan | null) =>
    editing &&
    save(
      { Players: [{ PlayerID: editing.PlayerID, Plan: plan }] },
      () => {
        setEditing(null);
        setPlayerErrors([]);
      },
      setPlayerErrors,
    );
  const counts = saved.Players.reduce<Record<Source, number>>(
    (sum, player) => ({ ...sum, [player.Source]: sum[player.Source] + 1 }),
    { player: 0, template: 0, default: 0 },
  );
  const players = saved.Players.filter(
    (player) => show === "all" || player.Source === show,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ["Weekly hours", String(saved.WeeklyHours)],
            ["On the team plan", String(counts.template)],
            ["On their own plan", String(counts.player)],
            ["On the default", String(counts.default)],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg bg-(--sport-surface-2) p-2 text-left"
          >
            <div className="text-xs uppercase text-(--text-muted)">{label}</div>
            <div className="text-xl font-bold tabular-nums">{value}</div>
          </div>
        ))}
      </div>

      <VbPanel title="1 · Team plan">
        <div className="space-y-3 p-3">
          <div className="text-left text-xs text-(--text-muted)">
            How every player's training time is split, unless she has a plan
            of her own.{" "}
            {saved.Template
              ? ""
              : "No team plan is saved yet, so players are on the default."}
          </div>
          <PlanEditor
            plan={currentTemplate}
            focusOptions={saved.FocusOptions}
            onChange={(plan) => {
              setTemplate(plan);
              setErrors([]);
            }}
          />
          <div className="flex flex-wrap items-start gap-3">
            <VbSaveBar
              dirty={template !== null}
              saving={saving}
              errors={errors}
              onSave={() =>
                save(
                  { Template: currentTemplate },
                  () => {
                    setTemplate(null);
                    setErrors([]);
                  },
                  setErrors,
                )
              }
              onReset={() => {
                setTemplate(null);
                setErrors([]);
              }}
            />
            {saved.Template && (
              <SportButton
                size="sm"
                variant="danger"
                disabled={saving}
                onClick={() =>
                  save({ Template: null }, () => setTemplate(null), setErrors)
                }
              >
                Remove the team plan
              </SportButton>
            )}
          </div>
        </div>
      </VbPanel>

      <VbPanel title="2 · Players">
        <div className="px-3 pt-2">
          <SportSegmented
            label="Whose plan"
            value={show}
            onChange={setShow}
            options={[
              ["all", `Everyone (${saved.Players.length})`],
              ["player", `Own plan (${counts.player})`],
              ["template", `Team plan (${counts.template})`],
              ["default", `Default (${counts.default})`],
            ]}
          />
        </div>
        <table data-keep-table className={`${vbTableClass} mt-2 min-w-[720px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Player</th>
              <th className={vbCell}>Best role</th>
              <th className={vbCell}>Follows</th>
              <th className={`${vbCell} w-1/3`}>How her time is split</th>
              <th className={vbCell}>Emphasis</th>
              <th className={vbCell} />
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const emphasis = Object.values(player.Effective.Focus ?? {});
              const edit = () => {
                setPlayerErrors([]);
                setEditing({
                  PlayerID: player.PlayerID,
                  Name: player.Name,
                  plan: player.Plan ?? player.Effective,
                });
              };
              return (
                <tr key={player.PlayerID} className={vbRowClass}>
                  <td className={vbCell}>
                    <VbPlayerLink
                      playerId={player.PlayerID}
                      name={player.Name}
                      team={team}
                    />
                  </td>
                  <td className={vbCell}>{player.BestRole}</td>
                  <td className={vbCell}>
                    <Tag variant={sourceTags[player.Source]}>
                      {sourceLabels[player.Source]}
                    </Tag>
                  </td>
                  <td className={vbCell}>
                    <SplitBar plan={player.Effective} />
                  </td>
                  <td className="px-2 py-1.5 text-left text-xs text-(--text-muted)">
                    {emphasis.length
                      ? emphasis.map((rating) => vbLabel(rating)).join(", ")
                      : "—"}
                  </td>
                  <td className={`${vbCell} text-right`}>
                    <SportButton size="xs" variant="secondary" onClick={edit}>
                      {player.Source === "player" ? "Edit plan" : "Give her a plan"}
                    </SportButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!players.length && <VbEmpty>No player is on that kind of plan.</VbEmpty>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 text-xs text-(--text-muted)">
          {areas.map(([area]) => (
            <span key={area} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: areaColors[area] }}
              />
              {area}
            </span>
          ))}
        </div>
      </VbPanel>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing ? `Training plan: ${editing.Name}` : ""}
        maxWidth="max-w-3xl"
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={saving}
              onClick={() => savePlayer(null)}
            >
              Follow the team plan
            </SportButton>
            <SportButton disabled={saving} onClick={() => savePlayer(editing!.plan)}>
              {saving ? "Saving..." : "Save her plan"}
            </SportButton>
          </>
        }
      >
        {editing && (
          <>
            <PlanEditor
              plan={editing.plan}
              focusOptions={saved.FocusOptions}
              onChange={(plan) => setEditing({ ...editing, plan })}
            />
            {playerErrors.length > 0 && (
              <ul className="mt-2 space-y-1 text-left text-sm text-(--accent-error)">
                {playerErrors.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

interface AttentionDraft {
  mode: VbAttentionView["Mode"];
  points: Record<string, number>;
}

const Attention: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({ kind, team }) => {
  const id = team.TeamID;
  const view = useVbManaged(`manage-attention:${id}`, () =>
    VolleyballManageService.getAttention(id),
  );
  const [draft, setDraft] = useState<AttentionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved = view.data;
  const current: AttentionDraft = draft ?? {
    mode: saved.Mode,
    points: Object.fromEntries(
      saved.Buckets.map((bucket) => [
        bucket,
        saved.Manual?.[bucket] ?? saved.Current?.[bucket] ?? 0,
      ]),
    ),
  };
  const change = (next: Partial<AttentionDraft>) => {
    setDraft({ ...current, ...next });
    setErrors([]);
  };
  // A pro club has no recruiting and no fundraising to attend to: those two
  // must hold zero.
  const closed = (bucket: string) =>
    kind === "pro" && (bucket === "Recruiting" || bucket === "Fundraising");
  const allocation = Object.fromEntries(
    saved.Buckets.map((bucket) => [
      bucket,
      closed(bucket) ? 0 : (current.points[bucket] ?? 0),
    ]),
  );
  const spent = Object.values(allocation).reduce((sum, n) => sum + n, 0);
  const manual = current.mode === "manual";
  const over = spent > saved.Budget;

  const save = async () => {
    if (manual) {
      const problems: string[] = [];
      if (spent !== saved.Budget) {
        problems.push(
          `Spread exactly ${saved.Budget} points; you have placed ${spent}.`,
        );
      }
      if ((allocation.StaffManagement ?? 0) < saved.MinimumStaffManagement) {
        problems.push(
          `Staff management needs at least ${saved.MinimumStaffManagement} points for your ${saved.DirectReports} direct reports.`,
        );
      }
      if (problems.length) return setErrors(problems);
    }
    setSaving(true);
    try {
      view.store(
        await VolleyballManageService.saveAttention(
          id,
          manual
            ? { Mode: "manual", Allocation: allocation }
            : { Mode: "adaptive" },
        ),
      );
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Attention saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };
  const step = (bucket: string, by: number) =>
    change({
      points: {
        ...current.points,
        [bucket]: Math.max(0, (current.points[bucket] ?? 0) + by),
      },
    });

  return (
    <div className="space-y-3">
      <VbPanel title="Where your own time goes">
        <div className="space-y-3 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["adaptive", "Adaptive", "The simulation shifts your time through the year, as each part of the season needs."],
                ["manual", "Manual", "Your numbers are used all year."],
              ] as const
            ).map(([mode, label, detail]) => (
              <div
                key={mode}
                {...vbLinkProps(() => change({ mode }))}
                role="button"
                aria-pressed={current.mode === mode}
                className={`cursor-pointer rounded border-2 p-3 text-left text-sm ${
                  current.mode === mode
                    ? "border-(--accent-primary) bg-(--accent-primary)/10"
                    : "border-transparent bg-(--sport-surface-2) hover:bg-(--text-primary)/10"
                }`}
              >
                <div className="font-semibold">{label}</div>
                <div className="text-xs text-(--text-muted)">{detail}</div>
              </div>
            ))}
          </div>

          {manual && (
            <div aria-live="polite">
              <div className="flex justify-between text-xs uppercase text-(--text-muted)">
                <span>Points placed</span>
                <span
                  className={`font-semibold tabular-nums ${spent === saved.Budget ? "text-(--accent-success)" : over ? "text-(--accent-error)" : "text-(--text-primary)"}`}
                >
                  {spent} of {saved.Budget}
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-(--text-primary)/15">
                <div
                  className={`h-2 rounded ${over ? "bg-(--accent-error)" : "bg-(--accent-success)"}`}
                  style={{
                    width: `${Math.min(100, saved.Budget > 0 ? (spent / saved.Budget) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {saved.Buckets.map((bucket) => {
              const shut = closed(bucket);
              const floor =
                bucket === "StaffManagement" ? saved.MinimumStaffManagement : 0;
              return (
                <div
                  key={bucket}
                  className={`rounded-lg bg-(--sport-surface-2) p-2 text-left ${shut ? "opacity-50" : ""}`}
                >
                  <div className="text-sm font-semibold">{vbLabel(bucket)}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <SportButton
                      size="xs"
                      variant="secondary"
                      aria-label={`Less ${vbLabel(bucket)}`}
                      disabled={!manual || shut || allocation[bucket] <= 0}
                      onClick={() => step(bucket, -1)}
                    >
                      −
                    </SportButton>
                    <span className="w-8 text-center text-lg font-bold tabular-nums">
                      {allocation[bucket]}
                    </span>
                    <SportButton
                      size="xs"
                      variant="secondary"
                      aria-label={`More ${vbLabel(bucket)}`}
                      disabled={!manual || shut || spent >= saved.Budget}
                      onClick={() => step(bucket, 1)}
                    >
                      +
                    </SportButton>
                    <span className="ml-auto text-xs text-(--text-muted)">
                      {shut
                        ? "Not used by a pro club"
                        : saved.Current
                          ? `Applied now: ${saved.Current[bucket] ?? 0}`
                          : ""}
                    </span>
                  </div>
                  {floor > 0 && (
                    <div className="mt-1 text-xs text-(--text-muted)">
                      Needs at least {floor} for your {saved.DirectReports}{" "}
                      direct reports.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-left text-xs text-(--text-muted)">
            {manual
              ? ""
              : "In adaptive mode the numbers are set for you. "}
            {saved.CurrentPeriod
              ? `The applied numbers are for ${vbLabel(saved.CurrentPeriod).toLowerCase()}.`
              : ""}
          </div>
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
    </div>
  );
};

type DevelopmentTab = "plans" | "attention";

const tabs: Array<readonly [DevelopmentTab, string]> = [
  ["plans", "Training plans"],
  ["attention", "Your attention"],
];

const DevelopmentBody: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({
  kind,
  team,
}) => {
  const [tab, setTab] = useSportSectionTab(tabs, "plans");
  return (
    <>
      <SportBannerSections tabs={tabs} value={tab} onChange={setTab} />
      {/* Both stay mounted so switching tabs does not drop unsaved edits. */}
      <div className={tab === "plans" ? "" : "hidden"}>
        <TrainingPlans team={team} />
      </div>
      <div className={tab === "attention" ? "" : "hidden"}>
        <Attention kind={kind} team={team} />
      </div>
    </>
  );
};

export const VolleyballDevelopmentPage: FC<{ kind: VbLeagueKind }> = ({
  kind,
}) => (
  <VbManagePage kind={kind} title="Development">
    {(team) => <DevelopmentBody key={team.TeamID} kind={kind} team={team} />}
  </VbManagePage>
);
