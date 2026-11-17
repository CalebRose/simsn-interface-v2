import { FC } from "react";
import { SportButton } from "../Common/SportKit";
import {
  VbTactics,
  VbTacticsPatch,
  VbTacticsPresets,
  VbTacticsRule,
} from "../../_services/volleyballService";
import { VbPanel } from "./VbCommon";
import { vbLabel } from "./vbFormatting";
import { VbChoice, VbField, vbFieldClass, VbSlider } from "./VbManage";

type Options = VbTacticsPresets["Options"];
type Tree = Record<string, unknown>;

// A patch is a sparse copy of the tactics tree. These read and write one
// leaf by its dotted path ("Offense.Distribution.Middle") without mutating.
const readPath = (tree: unknown, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (node, key) =>
        node && typeof node === "object" ? (node as Tree)[key] : undefined,
      tree,
    );

const writePath = (tree: Tree, keys: string[], value: unknown): Tree => {
  const [key, ...rest] = keys;
  return {
    ...tree,
    [key]: rest.length
      ? writePath((tree[key] as Tree | undefined) ?? {}, rest, value)
      : value,
  };
};

/** Removes a leaf, and any branch left empty by removing it. */
const dropPath = (tree: Tree, keys: string[]): Tree => {
  const [key, ...rest] = keys;
  if (!(key in tree)) return tree;
  const next = { ...tree };
  if (rest.length) {
    const child = dropPath(tree[key] as Tree, rest);
    if (Object.keys(child).length) next[key] = child;
    else delete next[key];
  } else {
    delete next[key];
  }
  return next;
};

/** A preset or standing system with a patch laid over it. */
export const vbApplyPatch = (
  base: VbTactics,
  patch: VbTacticsPatch | null | undefined,
): VbTactics => {
  const merge = (under: Tree, over: Tree): Tree =>
    Object.fromEntries(
      Object.entries(under).map(([key, value]) => {
        const change = over[key];
        if (change === undefined) return [key, value];
        return value && typeof value === "object"
          ? [key, merge(value as Tree, change as Tree)]
          : [key, change];
      }),
    );
  return merge(
    base as unknown as Tree,
    (patch ?? {}) as Tree,
  ) as unknown as VbTactics;
};

export const vbPatchIsEmpty = (patch: VbTacticsPatch | null | undefined) =>
  !patch || Object.keys(patch).length === 0;

interface Setting {
  path: string;
  label: string;
  /** One line on what it does. Kept modest: tactics shift a match a little. */
  help: string;
  control:
    | { type: "choice"; options: (options: Options) => Array<string | number> }
    | { type: "slider" }
    | { type: "toggle" };
}

const layers: Array<[layer: string, settings: Setting[]]> = [
  [
    "Offense",
    [
      {
        path: "Offense.System",
        label: "System",
        help: "A 6-2 uses two setters so three hitters are always in the front row, at some cost in set accuracy.",
        control: { type: "choice", options: (o) => o.OffenseSystem },
      },
      {
        path: "Offense.Tempo",
        label: "Tempo",
        help: "Fast sets beat the block to the ball, but need good passes and a setter with tempo.",
        control: { type: "choice", options: (o) => o.Tempo },
      },
      {
        path: "Offense.Distribution.Outside",
        label: "Sets to the outside",
        help: "Who gets the ball. 50% is neutral; a lopsided offense is easier to read.",
        control: { type: "slider" },
      },
      {
        path: "Offense.Distribution.Middle",
        label: "Sets to the middle",
        help: "",
        control: { type: "slider" },
      },
      {
        path: "Offense.Distribution.Opposite",
        label: "Sets to the opposite",
        help: "",
        control: { type: "slider" },
      },
      {
        path: "Offense.Distribution.BackRow",
        label: "Sets to the back row",
        help: "",
        control: { type: "slider" },
      },
      {
        path: "Offense.Slide",
        label: "Slide",
        help: "A middle runs behind the setter to hit at the right pin.",
        control: { type: "toggle" },
      },
      {
        path: "Offense.Style",
        label: "Attack style",
        help: "Power suits hard hitters, finesse suits placers. Fit to your hitters matters most.",
        control: { type: "choice", options: (o) => o.Style },
      },
      {
        path: "Offense.Switching",
        label: "Switching",
        help: "Hitters move to their own spots after the serve.",
        control: { type: "toggle" },
      },
    ],
  ],
  [
    "Serve receive",
    [
      {
        path: "Receive.Passers",
        label: "Passers",
        help: "More passers give up fewer aces but slow the offense.",
        control: { type: "choice", options: (o) => o.Passers },
      },
    ],
  ],
  [
    "Floor defense",
    [
      {
        path: "Defense.System",
        label: "System",
        help: "Perimeter is for hard swings; rotational and middle-up pick up tips and rolls.",
        control: { type: "choice", options: (o) => o.DefenseSystem },
      },
    ],
  ],
  [
    "Blocking",
    [
      {
        path: "Block.Scheme",
        label: "Scheme",
        help: "Commit jumps with the quick hitter and is late to everything else.",
        control: { type: "choice", options: (o) => o.BlockScheme },
      },
      {
        path: "Block.Spacing",
        label: "Spacing",
        help: "Bunch helps in the middle and is late to the pins.",
        control: { type: "choice", options: (o) => o.BlockSpacing },
      },
      {
        path: "Block.Take",
        label: "Take away",
        help: "Which shot the pin blocker takes away.",
        control: { type: "choice", options: (o) => o.BlockTake },
      },
    ],
  ],
  [
    "Serving",
    [
      {
        path: "Serve.Target",
        label: "Target",
        help: "Where the serve is aimed.",
        control: { type: "choice", options: (o) => o.ServeTarget },
      },
      {
        path: "Serve.Style",
        label: "Style",
        help: "Jump serves need the serve power for it.",
        control: { type: "choice", options: (o) => o.ServeStyle },
      },
    ],
  ],
];

interface VbTacticsFieldsProps {
  /** What applies underneath: a preset, or the standing system. */
  base: VbTactics;
  /** The changes laid over it. Only what differs from `base` is kept. */
  patch: VbTacticsPatch;
  onChange: (patch: VbTacticsPatch) => void;
  options: Options;
  /** False when the roster cannot run a 6-2. */
  secondSetterOk?: boolean;
  /** Opposing hitters the block can shade toward; omit to hide the setting. */
  keyHitters?: Array<{ PlayerID: number; Name: string }>;
  /** What a changed setting is marked as differing from. */
  changedFrom: string;
}

/**
 * The settings of a team system in their five layers. It edits a patch over
 * a base, which is how the API stores a system (preset plus edits), a rule
 * and a game plan alike.
 */
export const VbTacticsFields: FC<VbTacticsFieldsProps> = ({
  base,
  patch,
  onChange,
  options,
  secondSetterOk = true,
  keyHitters,
  changedFrom,
}) => {
  const set = (path: string, value: unknown) => {
    const keys = path.split(".");
    onChange(
      (value === readPath(base, path)
        ? dropPath(patch as Tree, keys)
        : writePath(patch as Tree, keys, value)) as VbTacticsPatch,
    );
  };
  const field = (setting: Setting) => {
    const changed = readPath(patch, setting.path) !== undefined;
    const value = changed
      ? readPath(patch, setting.path)
      : readPath(base, setting.path);
    const label = changed ? `${setting.label} •` : setting.label;
    return (
      <VbField key={setting.path} label={label} help={setting.help}>
        {setting.control.type === "choice" && (
          <VbChoice
            label={setting.label}
            value={value as string | number}
            options={setting.control.options(options)}
            format={(option) => vbLabel(String(option))}
            disabledOptions={
              setting.path === "Offense.System" && !secondSetterOk
                ? { "6-2": "Your roster has no second setter for a 6-2." }
                : {}
            }
            onChange={(option) => set(setting.path, option)}
          />
        )}
        {setting.control.type === "slider" && (
          <VbSlider
            label={setting.label}
            value={value as number}
            onChange={(next) => set(setting.path, next)}
          />
        )}
        {setting.control.type === "toggle" && (
          <VbChoice
            label={setting.label}
            value={value ? "On" : "Off"}
            options={["On", "Off"]}
            onChange={(option) => set(setting.path, option === "On")}
          />
        )}
      </VbField>
    );
  };
  const keyHitter =
    readPath(patch, "Block.KeyHitter") !== undefined
      ? (readPath(patch, "Block.KeyHitter") as number | null)
      : base.Block.KeyHitter;

  return (
    <div className="grid gap-x-8 lg:grid-cols-2">
      {layers.map(([layer, settings]) => (
        <div key={layer} className="mb-3">
          <div className="border-b border-(--sport-divider) pb-1 text-left text-xs uppercase text-(--text-muted)">
            {layer}
          </div>
          {settings.map(field)}
          {layer === "Blocking" && keyHitters && (
            <VbField
              label="Key hitter"
              help="Your blockers anticipate her."
            >
              <select
                className={`${vbFieldClass} w-full max-w-64`}
                aria-label="Key hitter"
                value={keyHitter ?? ""}
                onChange={(event) =>
                  set(
                    "Block.KeyHitter",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
              >
                <option value="">None</option>
                {keyHitters.map((player) => (
                  <option key={player.PlayerID} value={player.PlayerID}>
                    {player.Name}
                  </option>
                ))}
              </select>
            </VbField>
          )}
        </div>
      ))}
      <div className="text-left text-xs text-(--text-muted) lg:col-span-2">
        • marks a setting that differs from {changedFrom}.
      </div>
    </div>
  );
};

interface VbRulesEditorProps {
  rules: VbTacticsRule[];
  onChange: (rules: VbTacticsRule[]) => void;
  /** The system the rules change. */
  base: VbTactics;
  options: Options;
  secondSetterOk?: boolean;
}

/** Up to three "when X, change Y" rules. Nobody is at the keyboard mid-match. */
export const VbRulesEditor: FC<VbRulesEditorProps> = ({
  rules,
  onChange,
  base,
  options,
  secondSetterOk,
}) => {
  const update = (index: number, rule: VbTacticsRule) =>
    onChange(rules.map((item, at) => (at === index ? rule : item)));
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => (
        <VbPanel key={index}>
          <div className="p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">When</span>
              <select
                className={vbFieldClass}
                aria-label={`Rule ${index + 1} condition`}
                value={rule.When}
                onChange={(event) =>
                  update(index, { ...rule, When: event.target.value })
                }
              >
                {options.RuleWhen.map((when) => (
                  <option key={when} value={when}>
                    {vbLabel(when)}
                  </option>
                ))}
              </select>
              <span className="font-semibold">change these settings:</span>
              <SportButton
                size="xs"
                variant="danger"
                classes="ml-auto"
                onClick={() => onChange(rules.filter((_, at) => at !== index))}
              >
                Remove rule
              </SportButton>
            </div>
            <VbTacticsFields
              base={base}
              patch={rule.Apply}
              onChange={(Apply) => update(index, { ...rule, Apply })}
              options={options}
              secondSetterOk={secondSetterOk}
              changedFrom="the system this rule changes"
            />
          </div>
        </VbPanel>
      ))}
      <div className="flex items-center gap-2">
        <SportButton
          size="sm"
          variant="secondary"
          disabled={rules.length >= options.MaxRules}
          onClick={() =>
            onChange([...rules, { When: options.RuleWhen[0], Apply: {} }])
          }
        >
          Add a rule
        </SportButton>
        <span className="text-left text-xs text-(--text-muted)">
          Up to {options.MaxRules}. Rules are checked at the start of each set
          after the first. A rule that changes nothing is not saved.
        </span>
      </div>
    </div>
  );
};
