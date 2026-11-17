import { FC, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import { SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbGamePlan,
  VbLeagueKind,
  VbTacticsPatch,
  VbTacticsPresets,
  VbTacticsRule,
  VbTacticsView,
  VbTeam,
  VolleyballManageService,
  VolleyballService,
  VolleyballTacticsService,
} from "../../_services/volleyballService";
import { useVbResource, useVbTeams } from "./useVbData";
import {
  VbEmpty,
  vbLinkClass,
  vbLinkProps,
  VbLoad,
  VbPanel,
} from "./VbCommon";
import { vbErrorLines } from "./vbErrors";
import { VbOpponentScout } from "./VbOpponentScout";
import { vbLabel, vbPaths, vbShare } from "./vbFormatting";
import {
  VbField,
  vbFieldClass,
  VbManagePage,
  VbSaveBar,
  VbSlider,
  useVbManaged,
} from "./VbManage";
import {
  vbApplyPatch,
  vbPatchIsEmpty,
  VbRulesEditor,
  VbTacticsFields,
} from "./VbTacticsFields";

const realRules = (rules: VbTacticsRule[]) =>
  rules.filter((rule) => !vbPatchIsEmpty(rule.Apply));

interface SystemDraft {
  preset: string;
  patch: VbTacticsPatch;
  rules: VbTacticsRule[];
  serveAggression: number | null;
}

const systemFrom = (view: VbTacticsView): SystemDraft => ({
  preset: view.Preset,
  patch: view.Patch ?? {},
  rules: view.Rules ?? [],
  serveAggression: view.ServeAggression,
});

const sourceLabels: Record<VbTacticsView["Source"], string> = {
  human: "set by you",
  ai: "chosen by your staff",
  default: "the default, as nothing has been set",
};

interface AggressionProps {
  value: number | null;
  onChange: (value: number | null) => void;
  /** What a null value falls back to, in words. */
  fallback: string;
}

const Aggression: FC<AggressionProps> = ({ value, onChange, fallback }) => (
  <VbField
    label="Serve aggression"
    help="Higher means more aces and more service errors."
  >
    <div className="flex flex-wrap items-center gap-3">
      <VbSlider
        label="Serve aggression"
        value={value ?? 0.5}
        disabled={value === null}
        onChange={onChange}
      />
      <label className="flex items-center gap-1 text-xs text-(--text-muted)">
        <input
          type="checkbox"
          checked={value === null}
          onChange={(event) => onChange(event.target.checked ? null : 0.5)}
        />
        {fallback}
      </label>
    </div>
  </VbField>
);

interface SystemProps {
  team: VbTeam;
  view: VbTacticsView;
  presets: VbTacticsPresets;
  store: (view: VbTacticsView) => void;
}

const TeamSystem: FC<SystemProps> = ({ team, view, presets, store }) => {
  const [draft, setDraft] = useState<SystemDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const current = draft ?? systemFrom(view);
  const change = (next: Partial<SystemDraft>) => {
    setDraft({ ...current, ...next });
    setErrors([]);
  };
  const preset =
    presets.Presets.find((item) => item.Key === current.preset) ??
    presets.Presets[0];
  const resolved = vbApplyPatch(preset.Tactics, current.patch);
  // Best fit first; presets without a fit number keep the API's order.
  const cards = [...presets.Presets].sort(
    (a, b) => (view.Fit[b.Key] ?? -Infinity) - (view.Fit[a.Key] ?? -Infinity),
  );

  const save = async () => {
    setSaving(true);
    try {
      store(
        await VolleyballManageService.saveTactics(team.TeamID, {
          Preset: current.preset,
          Patch: current.patch,
          Rules: realRules(current.rules),
          ServeAggression: current.serveAggression,
        }),
      );
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Team system saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbPanel title="Start from a system">
        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => {
            const fit = view.Fit[item.Key];
            const selected = item.Key === current.preset;
            return (
              <div
                key={item.Key}
                {...vbLinkProps(() =>
                  change({
                    preset: item.Key,
                    patch: {},
                    serveAggression: item.ServeAggression,
                  }),
                )}
                role="button"
                aria-pressed={selected}
                className={`cursor-pointer rounded border p-3 text-left text-sm ${
                  selected
                    ? "border-(--accent-primary) bg-(--accent-primary)/10"
                    : "border-(--border-primary)"
                }`}
              >
                <div className="flex justify-between gap-2 font-semibold">
                  <span>{item.Label}</span>
                  {fit !== undefined && (
                    <span
                      className="tabular-nums"
                      title="Fit: rating points against a typical roster, from your staff's estimates. Higher is better."
                    >
                      {fit > 0 ? "+" : ""}
                      {fit.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-(--text-muted)">{item.Summary}</div>
                {item.Key === view.Preset && (
                  <div className="mt-1 text-xs text-(--accent-success)">
                    Your saved system
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-3 pb-2 text-left text-xs text-(--text-muted)">
          The number on each card is how well your roster suits it, by your
          staff's estimate. Picking a system clears your edits to the one
          before. Your saved system was {sourceLabels[view.Source]}.
          {view.StyleFit
            ? ` Your staff think your hitters suit a ${view.StyleFit} attack.`
            : ""}{" "}
          Talent matters more than tactics: a good fit moves a match a little,
          not a lot.
        </div>
      </VbPanel>

      <VbPanel title={`${preset.Label}, with your changes`}>
        <div className="p-3">
          <VbTacticsFields
            base={preset.Tactics}
            patch={current.patch}
            onChange={(patch) => change({ patch })}
            options={presets.Options}
            secondSetterOk={view.SecondSetterOk}
            changedFrom={preset.Label}
          />
          <Aggression
            value={current.serveAggression}
            onChange={(serveAggression) => change({ serveAggression })}
            fallback="Not set for this system"
          />
        </div>
      </VbPanel>

      <VbPanel title="Rules">
        <div className="p-3">
          <VbRulesEditor
            rules={current.rules}
            onChange={(rules) => change({ rules })}
            base={resolved}
            options={presets.Options}
            secondSetterOk={view.SecondSetterOk}
          />
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

type PlanDraft = Omit<VbGamePlan, "OpponentID">;

const emptyPlan: PlanDraft = {
  ServeAggression: null,
  ServeTargetZone: null,
  TimeoutOnOpponentRun: null,
  Tactics: null,
  Rules: null,
};

// Zones as they sit on the opponent's half, net at the top.
const zoneLayout = [4, 3, 2, 5, 6, 1];

interface PlanEditorProps {
  kind: VbLeagueKind;
  team: VbTeam;
  opponent: VbTeam;
  saved: VbGamePlan | undefined;
  view: VbTacticsView;
  presets: VbTacticsPresets;
  onSaved: (plans: VbGamePlan[]) => void;
}

const PlanEditor: FC<PlanEditorProps> = ({
  kind,
  team,
  opponent,
  saved,
  view,
  presets,
  onSaved,
}) => {
  const navigate = useNavigate();
  // The opponent's hitters, for the block's key hitter.
  const roster = useVbResource(`roster:${opponent.TeamID}`, () =>
    VolleyballService.getRoster(opponent.TeamID),
  );
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const current: PlanDraft = draft ?? saved ?? emptyPlan;
  const change = (next: Partial<PlanDraft>) => {
    setDraft({ ...current, ...next });
    setErrors([]);
  };

  const send = async (plan: PlanDraft | null) => {
    setSaving(true);
    try {
      const rules = realRules(plan?.Rules ?? []);
      const result = await VolleyballManageService.saveGamePlan(
        team.TeamID,
        opponent.TeamID,
        plan && {
          // Only what the coach overrides is sent; the rest follows their system.
          ...(plan.ServeAggression !== null && {
            ServeAggression: plan.ServeAggression,
          }),
          ServeTargetZone: plan.ServeTargetZone,
          ...(plan.TimeoutOnOpponentRun !== null && {
            TimeoutOnOpponentRun: plan.TimeoutOnOpponentRun,
          }),
          ...(!vbPatchIsEmpty(plan.Tactics) && { Tactics: plan.Tactics! }),
          ...(rules.length > 0 && { Rules: rules }),
        },
      );
      onSaved(result.Plans);
      setDraft(null);
      setErrors([]);
      enqueueSnackbar(
        plan ? `Plan for ${opponent.Name} saved.` : `Plan for ${opponent.Name} cleared.`,
        { variant: "success" },
      );
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbOpponentScout kind={kind} opponent={opponent} />
      <VbPanel title={`Against ${opponent.Name}`}>
        <div className="p-3">
          <div className="mb-2 text-left text-xs text-(--text-muted)">
            These settings replace your system only in matches against{" "}
            {opponent.Name}.{" "}
            <span
              {...vbLinkProps(() =>
                navigate(vbPaths(kind).team(opponent.TeamID)),
              )}
              className={vbLinkClass}
            >
              Scout their roster
            </span>
            {saved ? "" : " No plan is saved for them yet."}
          </div>
          <Aggression
            value={current.ServeAggression}
            onChange={(ServeAggression) => change({ ServeAggression })}
            fallback="Same as usual"
          />
          <VbField
            label="Serve target zone"
            help="Aim every serve at one zone of their court, or leave it to your system's target."
          >
            <div className="flex items-start gap-3">
              <div className="grid w-36 grid-cols-3 border-t-4 border-(--text-primary)">
                {zoneLayout.map((zone) => (
                  <div
                    key={zone}
                    {...vbLinkProps(() =>
                      change({
                        ServeTargetZone:
                          current.ServeTargetZone === zone ? null : zone,
                      }),
                    )}
                    role="button"
                    aria-pressed={current.ServeTargetZone === zone}
                    aria-label={`Zone ${zone}`}
                    className={`flex h-10 cursor-pointer items-center justify-center border border-(--border-primary) text-sm font-semibold ${
                      current.ServeTargetZone === zone
                        ? "bg-(--accent-primary) text-white"
                        : ""
                    }`}
                  >
                    {zone}
                  </div>
                ))}
              </div>
              <span className="text-xs text-(--text-muted)">
                Net at the top.{" "}
                {current.ServeTargetZone
                  ? `Zone ${current.ServeTargetZone} picked; click it again to clear.`
                  : "No zone picked."}
              </span>
            </div>
          </VbField>
          <VbField
            label="Timeout after a run of"
            help="Points in a row by the opponent before you call a timeout."
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                className={`${vbFieldClass} w-20`}
                aria-label="Timeout after a run of"
                min={2}
                max={10}
                disabled={current.TimeoutOnOpponentRun === null}
                value={current.TimeoutOnOpponentRun ?? ""}
                onChange={(event) =>
                  change({
                    TimeoutOnOpponentRun: Math.min(
                      10,
                      Math.max(2, Number(event.target.value)),
                    ),
                  })
                }
              />
              <label className="flex items-center gap-1 text-xs text-(--text-muted)">
                <input
                  type="checkbox"
                  checked={current.TimeoutOnOpponentRun === null}
                  onChange={(event) =>
                    change({
                      TimeoutOnOpponentRun: event.target.checked ? null : 4,
                    })
                  }
                />
                Same as usual
              </label>
            </div>
          </VbField>
        </div>
      </VbPanel>

      <VbPanel title="Changes to your system for this match">
        <div className="p-3">
          <VbTacticsFields
            base={view.Tactics}
            patch={current.Tactics ?? {}}
            onChange={(Tactics) => change({ Tactics })}
            options={presets.Options}
            secondSetterOk={view.SecondSetterOk}
            keyHitters={roster.data?.Players}
            changedFrom="your saved system"
          />
        </div>
      </VbPanel>

      <VbPanel title="Rules for this match">
        <div className="p-3">
          <VbRulesEditor
            rules={current.Rules ?? []}
            onChange={(Rules) => change({ Rules })}
            base={vbApplyPatch(view.Tactics, current.Tactics)}
            options={presets.Options}
            secondSetterOk={view.SecondSetterOk}
          />
        </div>
      </VbPanel>

      <div className="flex flex-wrap items-start gap-3">
        <VbSaveBar
          dirty={draft !== null}
          saving={saving}
          errors={errors}
          onSave={() => send(current)}
          onReset={() => {
            setDraft(null);
            setErrors([]);
          }}
        />
        {saved && (
          <SportButton
            size="sm"
            variant="danger"
            disabled={saving}
            onClick={() => send(null)}
          >
            Clear this plan
          </SportButton>
        )}
      </div>
    </div>
  );
};

interface PlansProps {
  kind: VbLeagueKind;
  team: VbTeam;
  view: VbTacticsView;
  presets: VbTacticsPresets;
}

const GamePlans: FC<PlansProps> = ({ kind, team, view, presets }) => {
  const [params, setParams] = useSearchParams();
  const { vbTeamsById } = useSimVBStore();
  const teams = useVbTeams(kind);
  const plans = useVbManaged(`manage-game-plans:${team.TeamID}`, () =>
    VolleyballManageService.getGamePlans(team.TeamID),
  );
  const opponentId = Number(params.get("opponent")) || null;
  const opponent = opponentId ? vbTeamsById[opponentId] : undefined;
  const options = useMemo(
    () =>
      [...(teams ?? [])]
        .filter((item) => item.TeamID !== team.TeamID)
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map((item) => ({ value: String(item.TeamID), label: item.Name })),
    [teams, team.TeamID],
  );
  const pick = (id: number | null) =>
    setParams(id ? { tab: "plans", opponent: String(id) } : { tab: "plans" });
  const saved = plans.data?.Plans ?? [];

  return (
    <VbLoad loading={plans.loading} error={plans.error}>
      <div className="space-y-3">
        <VbPanel title="Opponent">
          <div className="space-y-2 p-3 text-left text-sm">
            <div className="w-full sm:w-80">
              <SportSelect
                options={options}
                value={
                  options.find(
                    (option) => option.value === String(opponentId),
                  ) ?? null
                }
                placeholder="Pick an opponent to plan for..."
                onChange={(option) => option && pick(Number(option.value))}
              />
            </div>
            {saved.length ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-(--text-muted)">Saved plans:</span>
                {saved.map((plan) => (
                  <SportButton
                    key={plan.OpponentID}
                    size="xs"
                    variant="secondary"
                    isSelected={plan.OpponentID === opponentId}
                    onClick={() => pick(plan.OpponentID)}
                  >
                    {vbTeamsById[plan.OpponentID]?.Name ??
                      `Team ${plan.OpponentID}`}
                  </SportButton>
                ))}
              </div>
            ) : (
              <div className="text-xs text-(--text-muted)">
                You have no game plans saved. Without one, a match uses your
                team system as it is.
              </div>
            )}
          </div>
        </VbPanel>
        {opponent ? (
          <PlanEditor
            key={opponent.TeamID}
            kind={kind}
            team={team}
            opponent={opponent}
            saved={saved.find((plan) => plan.OpponentID === opponent.TeamID)}
            view={view}
            presets={presets}
            onSaved={(Plans) => plans.store({ TeamID: team.TeamID, Plans })}
          />
        ) : (
          opponentId !== null &&
          teams && <VbEmpty tone="error">That team is not in this league.</VbEmpty>
        )}
      </div>
    </VbLoad>
  );
};

type TacticsTab = "system" | "plans";

const tabs: Array<readonly [TacticsTab, string]> = [
  ["system", "Team system"],
  ["plans", "Game plans"],
];

const TacticsBody: FC<{ kind: VbLeagueKind; team: VbTeam }> = ({
  kind,
  team,
}) => {
  const [tab, setTab] = useSportSectionTab(tabs, "system");
  const view = useVbManaged(`manage-tactics:${team.TeamID}`, () =>
    VolleyballManageService.getTactics(team.TeamID),
  );
  const presets = useVbResource("tactics-presets", () =>
    VolleyballTacticsService.getPresets(),
  );

  return (
    <VbLoad
      loading={view.loading || presets.loading}
      error={view.error ?? presets.error}
    >
      {view.data && presets.data && (
        <>
          <SportBannerSections tabs={tabs} value={tab} onChange={setTab} />
          {/* Both stay mounted so switching tabs does not drop unsaved edits. */}
          <div className={tab === "system" ? "" : "hidden"}>
            <TeamSystem
              team={team}
              view={view.data}
              presets={presets.data}
              store={view.store}
            />
          </div>
          <div className={tab === "plans" ? "" : "hidden"}>
            <GamePlans
              kind={kind}
              team={team}
              view={view.data}
              presets={presets.data}
            />
          </div>
        </>
      )}
    </VbLoad>
  );
};

export const VolleyballTacticsPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbManagePage kind={kind} title="Tactics">
    {(team) => <TacticsBody key={team.TeamID} kind={kind} team={team} />}
  </VbManagePage>
);
