import { FC, ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import { Modal } from "../../_design/Modal";
import { Tag } from "../../_design/Tags";
import { useAuthStore } from "../../context/AuthContext";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbBuildCheck,
  VbBuildOptions,
  VbClaimRequest,
  VbCoach,
  VbLeagueKind,
  VbPhilosophy,
  VbRequestCoach,
  VbTeam,
  VolleyballClaimService,
  VolleyballCoachService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbLevelRequests, useVbResource, useVbTeams } from "./useVbData";
import { vbCoachPath } from "./VbCoachLink";
import { VbFact } from "./VbPlayerCard";
import { Text } from "../../_design/Typography";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { isBrightColor } from "../../_utility/isBrightColor";
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
  VbTeamLink,
} from "./VbCommon";
import { vbErrorLines } from "./vbErrors";
import { VbInboxPanel, VbJobOffers } from "./VbInbox";
import { useVbRequestTeam } from "./VbClaimButton";
import {
  vbLabel,
  vbLeagueConstant,
  vbMoney,
  vbPaths,
  vbTeamLogo,
} from "./vbFormatting";
import { useProfileResignation } from "../Profile/useProfileResignation";
import { VbGrade } from "./VbGrades";
import { VbPageShell } from "./VbPageShell";
import { Logo } from "../../_design/Logo";
import { ForumService } from "../../_services/forumService";
import {
  VbAnswerList,
  vbAnswersComplete,
  vbAnswersFrom,
  vbAnswersToSend,
  VbAnswerValues,
  VbApplicationQuestions,
} from "./VbApplication";

type Dial = [
  key: Exclude<keyof VbPhilosophy, "OffensiveSystem">,
  low: string,
  high: string,
];

// The seven dials of a coach's philosophy and what each end means. Every
// dial runs 0 to 1, and the first label is the 0 end. The API confirms which
// end is which in PhilosophyDials; if it ever disagrees with a label here,
// the API's own words are shown instead.
const dials: Dial[] = [
  ["TalentSource", "Develop talent", "Acquire talent"],
  ["SpendingSplit", "Spend on the roster", "Spend on staff"],
  ["TimeHorizon", "Build for later", "Win now"],
  ["RiskAppetite", "Conservative", "Aggressive"],
  ["DefensiveIdentity", "Read defense", "Commit defense"],
  ["FundraisingEngagement", "Little fundraising", "Heavy fundraising"],
  ["StaffStyle", "Lean and hands-on", "Full staff"],
];

const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const dialsFor = (options?: VbBuildOptions): Dial[] =>
  dials.map(([key, low, high]) => {
    const served = options?.PhilosophyDials?.[key];
    if (!served) return [key, low, high];
    // Each label here starts with the API's word for that end.
    const agrees = (label: string, word: string) =>
      label.toLowerCase().startsWith(word.toLowerCase().split(" ")[0]);
    return agrees(low, served.Zero) && agrees(high, served.One)
      ? [key, low, high]
      : [key, sentence(served.Zero), sentence(served.One)];
  });

const neutralPhilosophy: VbPhilosophy = {
  TalentSource: 0.5,
  SpendingSplit: 0.5,
  TimeHorizon: 0.5,
  RiskAppetite: 0.5,
  OffensiveSystem: "5-1",
  DefensiveIdentity: 0.5,
  FundraisingEngagement: 0.5,
  StaffStyle: 0.5,
};

const fieldClass =
  "w-full rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)";

const ErrorLines: FC<{ lines: string[] }> = ({ lines }) =>
  lines.length ? (
    <ul className="space-y-1 text-left text-sm text-(--accent-error)">
      {lines.map((line, index) => (
        <li key={index}>{line}</li>
      ))}
    </ul>
  ) : null;

type StepHeading = (title: string, hint: string) => ReactNode;

interface CoachFormProps {
  options: VbBuildOptions;
  /**
   * "reset" rebuilds an existing coach: background, stage and points only.
   * "apply" builds a coach that is sent with a team request and created only
   * when the request is approved.
   */
  mode: "create" | "reset" | "apply";
  /** The level of the coach being built: college and pro coaches are separate people. */
  level: VbLeagueKind;
  username: string;
  onDone: () => void;
  onCancel?: () => void;
  /** Apply mode: what sending does with the finished coach. */
  onApply?: (coach: VbRequestCoach) => Promise<void>;
  /** A stored application to start from. */
  initial?: VbRequestCoach | null;
  /** Steps before and after the coach's own, numbered in sequence. */
  top?: (heading: StepHeading) => ReactNode;
  bottom?: (heading: StepHeading) => ReactNode;
  /** Shown at the top of the summary panel. */
  summaryTop?: ReactNode;
  submitLabel?: string;
  /** Why sending is not possible yet; shown beside the button. */
  blocked?: string;
}

const CoachForm: FC<CoachFormProps> = ({
  options,
  mode,
  level,
  username,
  onDone,
  onCancel,
  onApply,
  initial,
  top,
  bottom,
  summaryTop,
  submitLabel,
  blocked,
}) => {
  // A stored build is used only where it still fits the current options.
  const [background, setBackground] = useState(
    options.Backgrounds.some((item) => item.Background === initial?.Background)
      ? initial!.Background
      : options.Backgrounds[0].Background,
  );
  const [stage, setStage] = useState(
    options.Stages.some((item) => item.Stage === initial?.Stage)
      ? initial!.Stage
      : options.Stages[0].Stage,
  );
  const [adjustments, setAdjustments] = useState<Record<string, number>>(
    initial?.Adjustments ?? {},
  );
  const [firstName, setFirstName] = useState(initial?.FirstName ?? "");
  const [lastName, setLastName] = useState(initial?.LastName ?? "");
  const [trait, setTrait] = useState(
    initial?.PickTrait && options.PickableTraits.includes(initial.PickTrait)
      ? initial.PickTrait
      : "",
  );
  const [philosophy, setPhilosophy] = useState(
    initial?.Philosophy ?? neutralPhilosophy,
  );
  // Everything but a rebuild designs the whole coach.
  const full = mode !== "reset";
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const base =
    options.Stages.find((item) => item.Stage === stage)?.BaseAbilities[
      background
    ] ?? {};
  const adjust = (attribute: string, change: number) =>
    setAdjustments((current) => ({
      ...current,
      [attribute]: (current[attribute] ?? 0) + change,
    }));
  const build = {
    Background: background,
    Stage: stage,
    Adjustments: Object.fromEntries(
      Object.entries(adjustments).filter(([, points]) => points !== 0),
    ),
  };
  // The server prices the build with the same check creation runs, a moment
  // after the user stops changing it.
  const buildKey = JSON.stringify(build);
  const [check, setCheck] = useState<{
    key: string;
    result: VbBuildCheck;
  } | null>(null);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      VolleyballCoachService.checkBuild(JSON.parse(buildKey))
        .then((result) => {
          if (active) setCheck({ key: buildKey, result });
        })
        .catch(() => {
          // Saving still runs the check and reports what is wrong.
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [buildKey]);
  const checked = check?.key === buildKey ? check.result : null;
  const philosophyDials = dialsFor(options);

  const coach: VbRequestCoach = {
    ...build,
    FirstName: firstName.trim() || undefined,
    LastName: lastName.trim() || undefined,
    Philosophy: philosophy,
    PickTrait: trait || undefined,
  };

  const submit = async () => {
    setSaving(true);
    setErrors([]);
    try {
      if (mode === "apply") {
        await onApply?.(coach);
        onDone();
        return;
      }
      if (mode === "reset") {
        await VolleyballCoachService.resetBuild(build, level);
      } else {
        await VolleyballCoachService.create({
          ...coach,
          Username: username,
          Level: level,
        });
      }
      enqueueSnackbar(
        mode === "reset" ? "Coach rebuilt." : "Coach created.",
        { variant: "success" },
      );
      onDone();
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  // What the next point on an ability costs, from the API's cost rule.
  const nextCost = (value: number) => {
    const rule = options.CostRule;
    const [first, second] = options.CostThresholds;
    if (!rule || first === undefined || second === undefined) return null;
    return value < first
      ? rule.PerPointBelowFirstThreshold
      : value < second
        ? rule.PerPointBelowSecondThreshold
        : rule.PerPointAbove;
  };
  const leans = new Set(
    (
      options.Backgrounds.find((item) => item.Background === background)
        ?.Leans ?? []
    ).map((lean) => lean.toLowerCase()),
  );
  const stageAge = options.Stages.find((item) => item.Stage === stage)?.Age;
  const results = options.Attributes.map((attribute) => ({
    attribute,
    start: base[attribute] ?? 0,
    points: adjustments[attribute] ?? 0,
    result: (base[attribute] ?? 0) + (adjustments[attribute] ?? 0),
  }));
  const strongest = [...results]
    .sort((a, b) => b.result - a.result)
    .slice(0, 3);
  const spent = checked?.Spent ?? 0;
  const budget = checked?.Budget ?? options.AdjustmentPoints;
  const over = checked ? !checked.Ok : false;
  const span = options.Cap - options.Floor;
  let step = 0;
  const heading: StepHeading = (title, hint) => (
    <div className="flex items-baseline gap-3 border-b border-(--sport-divider) px-3 py-2 text-left">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--accent-primary) text-xs font-bold text-white">
        {++step}
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-(--text-muted)">{hint}</div>
      </div>
    </div>
  );

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-3">
        {top?.(heading)}
        {full && (
          <VbPanel>
            {heading("Name", "Your username is fixed. A name is optional.")}
            <div className="grid gap-3 p-3 text-left text-sm sm:grid-cols-3">
              <label>
                <div className="mb-1 text-xs uppercase text-(--text-muted)">
                  Username
                </div>
                <input className={fieldClass} value={username} disabled />
              </label>
              <label>
                <div className="mb-1 text-xs uppercase text-(--text-muted)">
                  First name
                </div>
                <input
                  className={fieldClass}
                  value={firstName}
                  maxLength={40}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label>
                <div className="mb-1 text-xs uppercase text-(--text-muted)">
                  Last name
                </div>
                <input
                  className={fieldClass}
                  value={lastName}
                  maxLength={40}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
            </div>
          </VbPanel>
        )}

        <VbPanel>
          {heading(
            "Background",
            "Where your coach came from. It sets which abilities start highest.",
          )}
          <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
            {options.Backgrounds.map((item) => {
              const selected = item.Background === background;
              return (
                <div
                  key={item.Background}
                  {...vbLinkProps(() => setBackground(item.Background))}
                  role="button"
                  aria-pressed={selected}
                  className={`cursor-pointer rounded border-2 p-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-(--accent-primary) bg-(--accent-primary)/10"
                      : "border-transparent bg-(--sport-surface-2) hover:bg-(--text-primary)/10"
                  }`}
                >
                  <div className="font-semibold">{vbLabel(item.Background)}</div>
                  <div className="mt-1 text-xs uppercase text-(--text-muted)">
                    Strong in
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.Leans.map((lean) => (
                      <Tag key={lean} variant={selected ? "blue" : "gray"}>
                        {vbLabel(lean)}
                      </Tag>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </VbPanel>

        <VbPanel>
          {heading(
            "Career stage",
            "An older coach starts with higher abilities and less room to grow.",
          )}
          <div className="grid gap-2 p-3 sm:grid-cols-3">
            {options.Stages.map((item) => {
              const selected = item.Stage === stage;
              return (
                <div
                  key={item.Stage}
                  {...vbLinkProps(() => setStage(item.Stage))}
                  role="button"
                  aria-pressed={selected}
                  className={`cursor-pointer rounded border-2 p-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-(--accent-primary) bg-(--accent-primary)/10"
                      : "border-transparent bg-(--sport-surface-2) hover:bg-(--text-primary)/10"
                  }`}
                >
                  <div className="font-semibold">{vbLabel(item.Stage)}</div>
                  <div className="text-xs text-(--text-muted)">
                    Starts at age {item.Age}
                  </div>
                </div>
              );
            })}
          </div>
        </VbPanel>

        <VbPanel>
          {heading(
            "Abilities",
            `Move up to ${options.AdjustmentPoints} points. Each ability stays between ${options.Floor} and ${options.Cap}.`,
          )}
          <table data-keep-table className={vbTableClass}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Ability</th>
                <th className={`${vbCell} text-right`}>Start</th>
                <th className={`${vbCell} text-center`}>Adjust</th>
                <th className={`${vbCell} text-right`}>Result</th>
                <th className={`${vbCell} hidden w-40 sm:table-cell`} />
                <th
                  className={`${vbCell} hidden text-right sm:table-cell`}
                  title="What the next point up would cost"
                >
                  Next +1
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ attribute, start, points, result }) => {
                const cost = nextCost(result);
                return (
                  <tr key={attribute} className={vbRowClass}>
                    <td className={vbCell}>
                      {vbLabel(attribute)}
                      {leans.has(attribute.toLowerCase()) && (
                        <span
                          className="ml-2 text-xs text-(--accent-primary)"
                          title="Your background is strong here"
                        >
                          ●
                        </span>
                      )}
                    </td>
                    <td className={`${vbNum} text-(--text-muted)`}>
                      {start.toFixed(1)}
                    </td>
                    <td className={`${vbCell} text-center`}>
                      <div className="inline-flex items-center gap-2">
                        <SportButton
                          size="xs"
                          variant="secondary"
                          aria-label={`Lower ${vbLabel(attribute)}`}
                          disabled={result - 1 < options.Floor}
                          onClick={() => adjust(attribute, -1)}
                        >
                          −
                        </SportButton>
                        <span
                          className={`w-7 tabular-nums ${
                            points > 0
                              ? "text-(--accent-success)"
                              : points < 0
                                ? "text-(--accent-error)"
                                : "text-(--text-muted)"
                          }`}
                        >
                          {points > 0 ? `+${points}` : points}
                        </span>
                        <SportButton
                          size="xs"
                          variant="secondary"
                          aria-label={`Raise ${vbLabel(attribute)}`}
                          disabled={result + 1 > options.Cap}
                          onClick={() => adjust(attribute, 1)}
                        >
                          +
                        </SportButton>
                      </div>
                    </td>
                    <td className={`${vbNum} font-semibold`}>
                      {result.toFixed(1)}
                    </td>
                    <td className={`${vbCell} hidden sm:table-cell`}>
                      {/* Where the result sits between the floor and the cap. */}
                      <div className="h-2 rounded bg-(--text-primary)/15">
                        <div
                          className="h-2 rounded bg-(--accent-primary)"
                          style={{
                            width: `${Math.min(100, Math.max(0, ((result - options.Floor) / span) * 100))}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td
                      className={`${vbNum} hidden text-(--text-muted) sm:table-cell`}
                    >
                      {result + 1 > options.Cap || cost === null
                        ? "—"
                        : `${cost} pt`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
            <span className="text-(--accent-primary)">●</span> marks the
            abilities your background is strong in.{" "}
            {options.CostRule && options.CostThresholds.length >= 2
              ? `A point costs ${options.CostRule.PerPointBelowFirstThreshold} below ${options.CostThresholds[0]}, ${options.CostRule.PerPointBelowSecondThreshold} below ${options.CostThresholds[1]}, and ${options.CostRule.PerPointAbove} from there up.`
              : ""}{" "}
            Each point lowered gives back {options.LowerRefund} of a point
            {options.CostRule?.RefundRoundsDown ? ", rounded down in total" : ""}
            .
          </div>
        </VbPanel>

        {full && (
          <>
            <VbPanel>
              {heading(
                "Trait",
                "Pick one, and a second is drawn at random from the whole pool, good and bad. Or pick none and take the normal roll.",
              )}
              <div className="flex flex-wrap gap-1 p-3">
                {["", ...options.PickableTraits].map((item) => (
                  <SportButton
                    key={item || "none"}
                    size="xs"
                    variant="secondary"
                    isSelected={trait === item}
                    onClick={() => setTrait(item)}
                  >
                    {item ? vbLabel(item) : "No pick"}
                  </SportButton>
                ))}
              </div>
            </VbPanel>

            <VbPanel>
              {heading(
                "Philosophy",
                "How your coach runs a program. It decides everything you leave to your staff.",
              )}
              <div className="space-y-4 p-3 text-left text-sm">
                <div className="rounded border border-(--accent-warning) p-2 text-xs text-(--accent-warning)">
                  A philosophy is public and fixed for their whole career.
                </div>
                {philosophyDials.map(([key, low, high]) => (
                  <div key={key}>
                    <div className="mb-1 text-xs font-semibold uppercase text-(--text-muted)">
                      {vbLabel(key)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-right text-xs">
                        {low}
                      </span>
                      <input
                        type="range"
                        className="min-w-0 flex-1"
                        min={0}
                        max={1}
                        step={0.05}
                        aria-label={`${vbLabel(key)}: ${low} to ${high}`}
                        value={philosophy[key]}
                        onChange={(event) =>
                          setPhilosophy((current) => ({
                            ...current,
                            [key]: Number(event.target.value),
                          }))
                        }
                      />
                      <span className="w-32 shrink-0 text-xs">{high}</span>
                    </div>
                  </div>
                ))}
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase text-(--text-muted)">
                    Offensive system
                  </div>
                  <div className="flex gap-2">
                    {(options.OffensiveSystems ?? (["5-1", "6-2"] as const)).map(
                      (system) => (
                        <SportButton
                          key={system}
                          size="sm"
                          isSelected={philosophy.OffensiveSystem === system}
                          onClick={() =>
                            setPhilosophy((current) => ({
                              ...current,
                              OffensiveSystem: system,
                            }))
                          }
                        >
                          {system}
                        </SportButton>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </VbPanel>
          </>
        )}
        {bottom?.(heading)}
      </div>

      {/* The coach so far: stays in view while the steps scroll. */}
      <div className="lg:sticky lg:top-20">
        <VbPanel
          title={
            mode === "reset"
              ? "Rebuilt coach"
              : mode === "apply"
                ? "Your application"
                : "Your coach"
          }
        >
          <div className="space-y-3 p-3 text-left text-sm">
            {summaryTop}
            <div>
              <div className="font-semibold">
                {full
                  ? `${firstName} ${lastName}`.trim() || username
                  : username}
              </div>
              <div className="text-xs text-(--text-muted)">
                {vbLabel(background)} · {vbLabel(stage)}
                {stageAge ? ` · age ${stageAge}` : ""}
              </div>
            </div>
            <div aria-live="polite">
              <div className="flex justify-between text-xs uppercase text-(--text-muted)">
                <span>Points used</span>
                <span
                  className={`font-semibold tabular-nums ${over ? "text-(--accent-error)" : "text-(--text-primary)"}`}
                >
                  {checked ? `${spent} of ${budget}` : `– of ${budget}`}
                </span>
              </div>
              <div className="mt-1 h-2 rounded bg-(--text-primary)/15">
                <div
                  className={`h-2 rounded ${over ? "bg-(--accent-error)" : "bg-(--accent-success)"}`}
                  style={{
                    width: `${Math.min(100, budget > 0 ? (spent / budget) * 100 : 0)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-(--text-muted)">
                Strongest abilities
              </div>
              {strongest.map(({ attribute, result }) => (
                <div key={attribute} className="flex justify-between">
                  <span>{vbLabel(attribute)}</span>
                  <span className="font-semibold tabular-nums">
                    {result.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
            {full && (
              <div>
                <div className="text-xs uppercase text-(--text-muted)">
                  Trait and system
                </div>
                <div>
                  {trait ? vbLabel(trait) : "Normal roll"} ·{" "}
                  {philosophy.OffensiveSystem} offense
                </div>
              </div>
            )}
            {checked && !checked.Ok && <ErrorLines lines={checked.Errors} />}
            <ErrorLines lines={errors} />
            {blocked && (
              <div className="text-xs text-(--text-muted)">{blocked}</div>
            )}
            <div className="flex gap-2">
              <SportButton
                onClick={submit}
                disabled={
                  saving || !!blocked || (checked !== null && !checked.Ok)
                }
              >
                {saving
                  ? mode === "apply"
                    ? "Sending..."
                    : "Saving..."
                  : (submitLabel ??
                    (mode === "reset" ? "Rebuild coach" : "Create coach"))}
              </SportButton>
              {onCancel && (
                <SportButton variant="secondary" onClick={onCancel} disabled={saving}>
                  Cancel
                </SportButton>
              )}
            </div>
          </div>
        </VbPanel>
      </div>
    </div>
  );
};

/** Where a coach sits on each philosophy dial, and the system they run. */
const PhilosophyDials: FC<{
  philosophy: VbPhilosophy;
  options?: VbBuildOptions;
}> = ({ philosophy, options }) => (
  <div className="space-y-2">
    <div className="text-xs uppercase text-(--text-muted)">
      Philosophy · {philosophy.OffensiveSystem} offense
    </div>
    {dialsFor(options).map(([key, low, high]) => (
      <div key={key}>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-(--text-muted)">
          {vbLabel(key)}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-28 text-right">{low}</span>
          <div className="relative h-1.5 flex-1 rounded bg-(--text-primary)/15">
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--accent-primary)"
              style={{ left: `${philosophy[key] * 100}%` }}
            />
          </div>
          <span className="w-28">{high}</span>
        </div>
      </div>
    ))}
  </div>
);

/** A coach sent with an application, as forum lines. */
const vbCoachLines = (coach: VbRequestCoach): string[] => {
  const name = `${coach.FirstName ?? ""} ${coach.LastName ?? ""}`.trim();
  const moved = Object.entries(coach.Adjustments ?? {})
    .filter(([, points]) => points !== 0)
    .map(([attribute, points]) => `${points > 0 ? "+" : ""}${points} ${vbLabel(attribute)}`);
  return [
    `Coach: ${[name, vbLabel(coach.Background), vbLabel(coach.Stage)].filter(Boolean).join(", ")}`,
    `Trait pick: ${coach.PickTrait ? vbLabel(coach.PickTrait) : "none (normal roll)"}`,
    ...(coach.Philosophy ? [`Offense: ${coach.Philosophy.OffensiveSystem}`] : []),
    ...(moved.length ? [`Ability points: ${moved.join(", ")}`] : []),
  ];
};

/**
 * What an application carries: the coach it would create on approval and the
 * answers. Shown to the applicant while it waits and to admins deciding it.
 */
export const VbApplicationSummary: FC<{
  request: VbClaimRequest;
  options?: VbBuildOptions;
}> = ({ request, options }) => {
  const coach = request.Coach;
  const name = coach
    ? `${coach.FirstName ?? ""} ${coach.LastName ?? ""}`.trim()
    : "";
  const moved = Object.entries(coach?.Adjustments ?? {}).filter(
    ([, points]) => points !== 0,
  );
  return (
    <div className="grid gap-4 text-left text-sm lg:grid-cols-2">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-(--text-muted)">
          Coach
        </div>
        {coach ? (
          <>
            <div>
              <div className="font-semibold">{name || request.Username}</div>
              <div className="text-xs text-(--text-muted)">
                {vbLabel(coach.Background)} · {vbLabel(coach.Stage)} · trait
                pick: {coach.PickTrait ? vbLabel(coach.PickTrait) : "none"}
              </div>
            </div>
            {moved.length ? (
              <div className="flex flex-wrap gap-1">
                {moved.map(([attribute, points]) => (
                  <Tag key={attribute} variant={points > 0 ? "green" : "gray"}>
                    {points > 0 ? `+${points}` : points} {vbLabel(attribute)}
                  </Tag>
                ))}
              </div>
            ) : (
              <div className="text-xs text-(--text-muted)">
                No ability points moved.
              </div>
            )}
            {coach.Philosophy && (
              <PhilosophyDials philosophy={coach.Philosophy} options={options} />
            )}
          </>
        ) : (
          <div className="text-(--text-muted)">
            No coach was sent. If the user has no coach when this is approved,
            they are given a default one.
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase text-(--text-muted)">
          Answers
        </div>
        <VbAnswerList answers={request.Answers} />
        {request.Note && (
          <div>
            <div className="text-xs uppercase text-(--text-muted)">Note</div>
            <div className="whitespace-pre-wrap">{request.Note}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const CoachBody: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { vbCoaches, vbLoading, cvbTeam, pvbTeam, refreshVbMe } =
    useSimVBStore();
  // This page is about the user's coach at one level; the other level's
  // coach is a different person with a page of their own.
  const vbCoach = vbCoaches[kind];
  const other: VbLeagueKind = kind === "college" ? "pro" : "college";
  const unit = kind === "college" ? "program" : "club";
  const options = useVbResource("coach-build-options", () =>
    VolleyballCoachService.getBuildOptions(),
  );
  const requestTeam = useVbRequestTeam();
  const [rebuilding, setRebuilding] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { resign, isResigning: leaving } = useProfileResignation();
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  // Only this level's requests: each level has its own queue.
  const {
    requests: vbRequests,
    pending,
    requestKind,
  } = useVbLevelRequests(kind);
  const withdraw = async (request: VbClaimRequest) => {
    const kind = requestKind(request);
    if (!kind) return;
    setWithdrawingId(request.ID);
    try {
      await VolleyballClaimService.withdraw(kind, request.ID);
      await refreshVbMe();
      enqueueSnackbar("Request withdrawn.", { variant: "success" });
    } catch (reason) {
      enqueueSnackbar(vbErrorLines(reason).join(" "), { variant: "error" });
    } finally {
      setWithdrawingId(null);
    }
  };
  const team = kind === "college" ? cvbTeam : pvbTeam;
  const teamKind = kind;

  // The site-wide resignation: the volleyball API releases the coach (the
  // team gets an AI interim), then an admin report is filed. Volleyball keeps
  // no team on the user's profile, so there are no profile fields to clear;
  // the API's /me is reread instead. TechDocs/volleyball/13-resignation.md.
  const leave = () =>
    resign({
      league: vbLeagueConstant(kind),
      teamID: team?.TeamID,
      // The report's phase and week are the other sports' database ids;
      // volleyball's clock has neither, so both are left empty.
      phase: null,
      weekID: null,
      remove: () => VolleyballCoachService.leave(kind),
      onComplete: () => {
        setConfirmLeave(false);
        enqueueSnackbar("You have left your team.", { variant: "success" });
        void refreshVbMe();
      },
    });

  const otherLink = (
    <span
      {...vbLinkProps(() => navigate(vbPaths(other).coach))}
      className={vbLinkClass}
    >
      your {other} coach
    </span>
  );
  const requestsPanel = (
    <>
      {pending && (
        <VbPanel title={`Your application for ${pending.TeamName}`}>
          <div className="space-y-3 p-3">
            <div className="flex flex-wrap items-center gap-2 text-left text-sm">
              <span className="text-(--text-muted)">
                Waiting for an admin since{" "}
                {new Date(pending.CreatedAt).toLocaleDateString()}
                {pending.UpdatedAt && pending.UpdatedAt !== pending.CreatedAt
                  ? `, last sent ${new Date(pending.UpdatedAt).toLocaleDateString()}`
                  : ""}
                .{" "}
                {pending.Coach
                  ? "Your coach is created only if it is approved."
                  : ""}
              </span>
              <div className="ml-auto flex gap-2">
                {/* Resending replaces the application and keeps its place. */}
                {!vbCoach && requestKind(pending) && (
                  <SportButton
                    size="xs"
                    onClick={() =>
                      navigate(vbPaths(requestKind(pending)!).apply(pending.OrgID))
                    }
                  >
                    Edit and resend
                  </SportButton>
                )}
                {requestKind(pending) && (
                  <SportButton
                    size="xs"
                    variant="secondary"
                    disabled={withdrawingId !== null}
                    onClick={() => withdraw(pending)}
                  >
                    {withdrawingId === pending.ID ? "Withdrawing..." : "Withdraw"}
                  </SportButton>
                )}
              </div>
            </div>
            <VbApplicationSummary request={pending} options={options.data} />
          </div>
        </VbPanel>
      )}
      <VbPanel title="Your team requests">
        {vbRequests.length ? (
          <table data-keep-table className={`${vbTableClass} min-w-[560px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Team</th>
                <th className={vbCell}>Status</th>
                <th className={vbCell}>Sent</th>
                <th className={vbCell}>Note</th>
              </tr>
            </thead>
            <tbody>
              {vbRequests.map((request) => (
                <tr key={request.ID} className={vbRowClass}>
                  <td className={`${vbCell} font-semibold`}>
                    {request.TeamName}
                  </td>
                  <td className={vbCell}>{vbLabel(request.Status)}</td>
                  <td className={vbCell}>
                    {new Date(
                      request.UpdatedAt ?? request.CreatedAt,
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-2 py-1.5 text-left text-(--text-muted)">
                    {request.Note ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <VbEmpty>You have not asked for a {kind} team.</VbEmpty>
        )}
      </VbPanel>
    </>
  );

  if (vbLoading) return <VbLoad loading error={null}>{null}</VbLoad>;

  if (!vbCoach) {
    return (
      <div className="space-y-3">
        <VbPanel>
          <div className="space-y-3 p-3 text-left text-sm">
            <p>
              In SimSN Volleyball you play as a head coach: a person in the
              league with their own abilities, traits and philosophy, all of
              which shape their {unit}.
            </p>
            <p>
              You have no {kind} coach yet. To join, choose an open {unit} on
              the Available Teams page. You build your coach as part of the
              application, and nothing is created until an admin approves it.
              Your {kind} coach is a separate person from {otherLink}.
            </p>
            {!pending && (
              <div className="flex flex-wrap gap-2">
                <SportButton size="sm" onClick={() => requestTeam(kind)}>
                  {kind === "college" ? "College programs" : "Pro clubs"}
                </SportButton>
              </div>
            )}
          </div>
        </VbPanel>
        {requestsPanel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <VbInboxPanel kind={kind} />
      <VbJobOffers kind={kind} />
      {/* What every coach page shows, with your true abilities added. */}
      <CoachProfile id={vbCoach.PersonID} own={vbCoach} />

      <VbPanel title="Team">
        <div className="flex flex-wrap items-center gap-3 p-3 text-left text-sm">
          {team ? (
            <>
              <span>
                Head coach of{" "}
                <span
                  {...vbLinkProps(() =>
                    navigate(vbPaths(teamKind).team(team.TeamID)),
                  )}
                  className={vbLinkClass}
                >
                  {team.Name}
                </span>
              </span>
              <SportButton
                size="sm"
                variant="danger"
                onClick={() => setConfirmLeave(true)}
              >
                Leave team
              </SportButton>
            </>
          ) : (
            <span>
              Your {kind} coach is not coaching a team. Ask for an open{" "}
              <span
                {...vbLinkProps(() => requestTeam(kind))}
                className={vbLinkClass}
              >
                {unit}
              </span>{" "}
              on the Available Teams page.
            </span>
          )}
        </div>
        <div className="px-3 pb-3 text-left text-xs text-(--text-muted)">
          You can also coach at the other level, as a separate person: see{" "}
          {otherLink}.
        </div>
      </VbPanel>

      {requestsPanel}

      <VbPanel title="Rebuild">
        <div className="space-y-3 p-3 text-left text-sm">
          <div className="text-(--text-muted)">
            A rebuild changes your coach's background, stage and adjustment
            points. It is free until their first match; after that it is
            allowed once each offseason. What they have learned since, and
            their philosophy, stay.
          </div>
          {rebuilding ? (
            <VbLoad loading={options.loading} error={options.error}>
              {options.data && (
                <CoachForm
                  options={options.data}
                  mode="reset"
                  level={kind}
                  username={vbCoach.Username}
                  onDone={() => {
                    setRebuilding(false);
                    void refreshVbMe();
                  }}
                  onCancel={() => setRebuilding(false)}
                />
              )}
            </VbLoad>
          ) : (
            <SportButton size="sm" variant="secondary" onClick={() => setRebuilding(true)}>
              Rebuild coach
            </SportButton>
          )}
        </div>
      </VbPanel>

      <Modal
        isOpen={confirmLeave}
        onClose={() => !leaving && setConfirmLeave(false)}
        title="Leave team"
        actions={
          <>
            <SportButton
              variant="secondary"
              onClick={() => setConfirmLeave(false)}
              disabled={leaving}
            >
              Cancel
            </SportButton>
            <SportButton variant="danger" onClick={leave} disabled={leaving}>
              {leaving ? "Leaving..." : "Leave team"}
            </SportButton>
          </>
        }
      >
        <p className="text-left">
          Leave {team?.Name}? An AI interim takes over at once, and you may
          have to wait before you can ask for another {unit}. Your {other}{" "}
          team is not affected.
        </p>
      </Modal>
    </div>
  );
};

export const VolleyballCoachPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title={kind === "college" ? "College Coach" : "Pro Coach"}>
    {() => <CoachBody key={kind} kind={kind} />}
  </VbPageShell>
);

/**
 * The one application for a user with no coach: the team, the coach they
 * want to be, and the usual questions, sent as a single request. The coach
 * is created only when an admin approves it.
 */
const ApplyForm: FC<{
  kind: VbLeagueKind;
  team: VbTeam;
  options: VbBuildOptions;
  /** The waiting application for this team, when it is being resent. */
  resending?: VbClaimRequest;
}> = ({ kind, team, options, resending }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { vbLeagues, refreshVbMe } = useSimVBStore();
  const requestTeam = useVbRequestTeam();
  const [answers, setAnswers] = useState<VbAnswerValues>(() =>
    vbAnswersFrom(resending?.Answers),
  );
  const logo = (
    <Logo
      url={vbTeamLogo(team, kind, vbLeagues[kind])}
      variant="small"
      containerClass="shrink-0"
    />
  );

  const apply = async (coach: VbRequestCoach) => {
    const username = currentUser!.username;
    await VolleyballClaimService.create(kind, username, team.TeamID, {
      Coach: coach,
      Answers: vbAnswersToSend(answers),
    });
    await refreshVbMe();
    // A resend updates the same request, so it gets no second thread.
    if (!resending) {
      try {
        await ForumService.CreateSimVolleyballJobApplicationThreadFromTeamRequest(
          kind,
          username,
          team.Name,
          currentUser!.id,
          username,
          answers,
          vbCoachLines(coach),
        );
      } catch {
        enqueueSnackbar(
          "Your application was sent, but its forum thread could not be created.",
          { variant: "warning" },
        );
      }
    }
    enqueueSnackbar(
      resending
        ? "Application updated. It keeps its place in the queue."
        : `Application sent for ${team.Name}.`,
      { variant: "success" },
    );
  };

  return (
    <CoachForm
      options={options}
      mode="apply"
      level={kind}
      username={currentUser!.username}
      initial={resending?.Coach}
      onApply={apply}
      onDone={() => navigate(vbPaths(kind).coach)}
      submitLabel={resending ? "Resend application" : "Send application"}
      blocked={
        vbAnswersComplete(answers)
          ? undefined
          : "Answer the required questions in the last step to send."
      }
      summaryTop={
        <div className="flex items-center gap-2 border-b border-(--sport-divider) pb-2">
          {logo}
          <div>
            <div className="text-xs uppercase text-(--text-muted)">
              Applying to coach
            </div>
            <div className="font-semibold">{team.Name}</div>
          </div>
        </div>
      }
      top={(heading) => (
        <VbPanel>
          {heading(
            "Team",
            "The team you are applying for. An admin approves or rejects each application.",
          )}
          <div className="flex flex-wrap items-center gap-3 p-3 text-left text-sm">
            {logo}
            <div>
              <div className="font-semibold">{team.Name}</div>
              <div className="text-xs text-(--text-muted)">
                {[team.Conference, kind === "college" ? "College" : "Pro"]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            {!resending && (
              <span
                {...vbLinkProps(() => requestTeam(kind))}
                className={`ml-auto text-xs ${vbLinkClass}`}
              >
                Choose another team
              </span>
            )}
          </div>
          <div className="px-3 pb-3 text-left text-xs text-(--text-muted)">
            {resending
              ? "You are changing an application that is already waiting. Sending it again replaces it and keeps its place in the queue."
              : `Your ${kind} coach is created only if this application is approved. Until then you can change it and send it again from the Coach page.`}
          </div>
        </VbPanel>
      )}
      bottom={(heading) => (
        <VbPanel>
          {heading("About you", "The questions every team request asks.")}
          <VbApplicationQuestions values={answers} onChange={setAnswers} />
        </VbPanel>
      )}
    />
  );
};

const ApplyBody: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const id = Number(teamId);
  const { currentUser } = useAuthStore();
  const { vbCoaches, vbLoading } = useSimVBStore();
  const vbCoach = vbCoaches[kind];
  // Each level has its own queue and its own coach.
  const { pending } = useVbLevelRequests(kind);
  const teams = useVbTeams(kind);
  const requestTeam = useVbRequestTeam();
  const options = useVbResource("coach-build-options", () =>
    VolleyballCoachService.getBuildOptions(),
  );

  if (!Number.isInteger(id) || id <= 0) {
    return <VbEmpty tone="error">That is not a team.</VbEmpty>;
  }
  if (!currentUser) return <VbEmpty>Sign in to apply for a team.</VbEmpty>;
  if (vbLoading || !teams) return <VbLoad loading error={null}>{null}</VbLoad>;

  const team = teams.find((item) => item.TeamID === id);
  const resending = pending?.OrgID === id ? pending : undefined;
  const notice = (text: string, action?: [label: string, go: () => void]) => (
    <VbPanel>
      <div className="flex flex-wrap items-center gap-3 p-3 text-left text-sm">
        <span>{text}</span>
        {action && (
          <SportButton size="sm" classes="ml-auto" onClick={action[1]}>
            {action[0]}
          </SportButton>
        )}
      </div>
    </VbPanel>
  );

  if (!team) return <VbEmpty>There is no such team in this league.</VbEmpty>;
  // A user with a coach asks with the usual request window.
  if (vbCoach) {
    return notice(
      `You already have a ${kind} coach, so you ask for a team with the usual request on the Available Teams page.`,
      ["Available Teams", () => requestTeam(kind)],
    );
  }
  if (pending && !resending) {
    return notice(
      `Your application for ${pending.TeamName} is still waiting. Withdraw it on the Coach page to apply for another team.`,
      ["Coach page", () => navigate(vbPaths(kind).coach)],
    );
  }
  if (team.Controller === "human" && !resending) {
    return notice(`${team.Name} already has a head coach.`, [
      "Available Teams",
      () => requestTeam(kind),
    ]);
  }

  return (
    <VbLoad loading={options.loading} error={options.error}>
      {options.data && (
        <ApplyForm
          kind={kind}
          team={team}
          options={options.data}
          resending={resending}
        />
      )}
    </VbLoad>
  );
};

export const VolleyballApplyPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Apply to coach">
    {() => <ApplyBody kind={kind} />}
  </VbPageShell>
);

// The older address named a team. It now leads to that team's head coach.
const CoachOfTeamBody: FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const id = Number(teamId);
  const validId = Number.isInteger(id) && id > 0;
  const staff = useVbResource(validId ? `staff:${id}` : null, () =>
    VolleyballService.getStaff(id),
  );
  if (!validId) return <VbEmpty tone="error">That is not a team.</VbEmpty>;
  const coach = staff.data?.Staff.find((member) => member.Role === "headCoach");
  if (coach) return <Navigate to={vbCoachPath(coach.PersonID)} replace />;
  return (
    <VbLoad loading={staff.loading} error={staff.error}>
      <VbEmpty>That team has no head coach on record.</VbEmpty>
    </VbLoad>
  );
};

export const VolleyballCoachViewPage: FC = () => (
  <VbPageShell kind="college" title="Coach">
    {() => <CoachOfTeamBody />}
  </VbPageShell>
);

const moveLabels: Record<string, string> = {
  hired: "Hired",
  fired: "Fired",
  retired: "Retired",
  not_renewed: "Not renewed",
  hired_away: "Hired away",
  extended: "Extended",
  released: "Released",
};

// A coach or staff member as a person: AI or human, employed or looking for
// work. Everything here is public.
/**
 * A coach as a person, the same on every coach's page. On your own Coach page
 * (`own`) your true abilities show beside the estimate everyone else sees.
 */
const CoachProfile: FC<{ id: number; own?: VbCoach }> = ({ id, own }) => {
  const validId = Number.isInteger(id) && id > 0;
  const { vbCoaches, vbTeamsById } = useSimVBStore();
  const profile = useVbResource(validId ? `coach:${id}` : null, () =>
    VolleyballService.getCoach(id),
  );
  const options = useVbResource("coach-build-options", () =>
    VolleyballCoachService.getBuildOptions(),
  );
  const coach = profile.data;
  useVbTeams(coach?.Current?.LeagueKind ?? "college");
  if (!validId) return <VbEmpty tone="error">That is not a coach.</VbEmpty>;
  if (profile.error?.status === 404) {
    return <VbEmpty>There is no coach with that id.</VbEmpty>;
  }
  // Your own coach has a fuller page, with your settings.
  const mine = (["college", "pro"] as const).find(
    (level) => vbCoaches[level]?.PersonID === id,
  );
  if (!own && mine) {
    return <Navigate to={vbPaths(mine).coach} replace />;
  }
  const current = coach?.Current ?? null;
  const team = current ? vbTeamsById[current.TeamID] : undefined;
  const career = [...(coach?.Career ?? [])].sort((a, b) => b.Season - a.Season);
  const moves = [...(coach?.Moves ?? [])].sort((a, b) => b.Season - a.Season);
  const totals = coach?.HeadCoachTotals;
  const headColor = team?.ColorOne ?? "#4B5563";
  const bright = isBrightColor(headColor);
  const stripColor = bright && team ? team.ColorTwo : headColor;

  return (
    <VbLoad loading={profile.loading} error={profile.error}>
      {coach && (
        <div className="space-y-3">
          <div
            className={`flex flex-wrap items-center gap-3 rounded-t-lg px-4 py-3 ${getTextColorBasedOnBg(stripColor)}`}
            style={{ backgroundColor: stripColor }}
          >
            <div className="text-left">
              <Text variant="h4">{coach.Name}</Text>
              <div className="text-sm">
                {current
                  ? `${vbLabel(current.Role)}${current.Interim ? " (interim)" : ""} · ${current.TeamName} · since ${current.Since}`
                  : coach.InPool
                    ? "Looking for work"
                    : "Not coaching"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:ml-auto">
              <Tag variant={coach.Username ? "green" : "gray"}>
                {coach.Username ? `User: ${coach.Username}` : "AI"}
              </Tag>
              {coach.Traits.map((trait) => (
                <Tag key={trait}>{vbLabel(trait)}</Tag>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <VbPanel title="Now">
              <div className="space-y-3 p-3 text-left text-sm">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <VbFact label="Age" value={coach.Age ?? "—"} />
                  {own && (
                    <VbFact
                      label="Background"
                      value={`${vbLabel(own.Background)} · ${vbLabel(own.Stage)}`}
                    />
                  )}
                  <VbFact label="Seasons coaching" value={coach.SeasonsCoaching} />
                  {totals && totals.Seasons > 0 && (
                    <VbFact
                      label="Record as head coach"
                      value={`${totals.Wins}–${totals.Losses}`}
                      title={`${totals.Seasons} seasons as a head coach`}
                    />
                  )}
                  {current && (
                    <>
                      <VbFact
                        label="Team"
                        value={
                          <VbTeamLink
                            kind={current.LeagueKind}
                            teamId={current.TeamID}
                            name={current.TeamName}
                          />
                        }
                      />
                      <VbFact label="Salary" value={vbMoney(current.Salary)} />
                      <VbFact
                        label="Contract through"
                        value={current.ContractThrough ?? "—"}
                      />
                    </>
                  )}
                </div>
                {coach.Philosophy ? (
                  <PhilosophyDials
                    philosophy={coach.Philosophy}
                    options={options.data}
                  />
                ) : (
                  <div className="text-xs text-(--text-muted)">
                    A philosophy belongs to a head coach; none is on record
                    here.
                  </div>
                )}
              </div>
            </VbPanel>

            <VbPanel title={own ? "Abilities" : "Abilities · public estimate"}>
              <table data-keep-table className={vbTableClass}>
                {own && (
                  <thead className={vbHeadClass}>
                    <tr>
                      <th className={vbCell}>Ability</th>
                      <th className={`${vbCell} text-right`}>
                        Your rating (0–50)
                      </th>
                      <th className={`${vbCell} text-right`}>
                        What others see
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody>
                  {[
                    ...new Set([
                      ...Object.keys(own?.Abilities ?? {}),
                      ...Object.keys(coach.Grades),
                    ]),
                  ].map((attribute) => (
                    <tr key={attribute} className={vbRowClass}>
                      <td className={vbCell}>{vbLabel(attribute)}</td>
                      {own && (
                        <td className={`${vbNum} font-semibold`}>
                          {own.Abilities[attribute]?.toFixed(1) ?? "—"}
                        </td>
                      )}
                      <td className={vbNum}>
                        {coach.Grades[attribute] ? (
                          <VbGrade value={coach.Grades[attribute]} />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
                {own ? "Only you see your ratings. " : ""}
                Estimates come from a coach's track record. A range narrows the
                longer they have coached.
              </div>
            </VbPanel>
          </div>

          <VbPanel title="Career">
            {career.length ? (
              <table data-keep-table className={`${vbTableClass} min-w-[760px]`}>
                <thead className={vbHeadClass}>
                  <tr>
                    <th className={vbCell}>Season</th>
                    <th className={vbCell}>Team</th>
                    <th className={vbCell}>Role</th>
                    <th className={vbCell}>Record</th>
                    <th className={vbCell}>Conf</th>
                    <th className={`${vbCell} text-right`}>Rank</th>
                    <th className={vbCell}>Conf tournament</th>
                    <th className={vbCell}>Postseason</th>
                  </tr>
                </thead>
                <tbody>
                  {career.map((row) => (
                    <tr
                      key={`${row.Season}:${row.TeamID}:${row.Role}`}
                      className={vbRowClass}
                    >
                      <td className={vbCell}>{row.Season}</td>
                      <td className={vbCell}>
                        <VbTeamLink
                          kind={row.LeagueKind}
                          teamId={row.TeamID}
                          name={row.TeamName}
                        />
                      </td>
                      <td className={vbCell}>
                        {vbLabel(row.Role)}
                        {row.Interim ? " (interim)" : ""}
                      </td>
                      <td className={`${vbCell} tabular-nums`}>
                        {row.Record
                          ? `${row.Record.Wins}-${row.Record.Losses}`
                          : "—"}
                      </td>
                      <td className={`${vbCell} tabular-nums`}>
                        {row.Record && row.LeagueKind === "college"
                          ? `${row.Record.ConfWins}-${row.Record.ConfLosses}`
                          : "—"}
                      </td>
                      <td className={vbNum}>{row.Record?.EloRank ?? "—"}</td>
                      <td className={vbCell}>
                        {row.Record?.ConfTourney
                          ? vbLabel(row.Record.ConfTourney)
                          : "—"}
                      </td>
                      <td className={vbCell}>
                        {row.Record?.National
                          ? vbLabel(row.Record.National)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <VbEmpty>No seasons on record.</VbEmpty>
            )}
            <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
              A record is the team's, in seasons this coach was its head coach.
            </div>
          </VbPanel>

          <VbPanel title="Moves">
            {moves.length ? (
              <table data-keep-table className={vbTableClass}>
                <tbody>
                  {moves.map((move, index) => (
                    <tr key={index} className={vbRowClass}>
                      <td className={`${vbCell} w-16`}>{move.Season}</td>
                      <td className={`${vbCell} w-32`}>
                        <Tag>{moveLabels[move.Type] ?? vbLabel(move.Type)}</Tag>
                      </td>
                      <td className={vbCell}>
                        {move.TeamID !== null && move.TeamName ? (
                          <VbTeamLink
                            kind={
                              vbTeamsById[move.TeamID]?.Kind === "pro_club"
                                ? "pro"
                                : "college"
                            }
                            teamId={move.TeamID}
                            name={move.TeamName}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className={vbCell}>
                        {move.Role ? vbLabel(move.Role) : ""}
                      </td>
                      <td className="px-2 py-1.5 text-left text-(--text-muted)">
                        {move.Detail ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <VbEmpty>No moves on record.</VbEmpty>
            )}
          </VbPanel>
        </div>
      )}
    </VbLoad>
  );
};

const CoachPersonBody: FC = () => {
  const { personId } = useParams<{ personId: string }>();
  return <CoachProfile id={Number(personId)} />;
};

export const VolleyballCoachPersonPage: FC = () => (
  <VbPageShell kind="college" title="Coach">
    {() => <CoachPersonBody />}
  </VbPageShell>
);
