import { FC, ReactNode, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SportButton } from "../Common/SportKit";
import { SportSegmented } from "../Common/SportKit";
import { MoneyInput, MoneyInputProps } from "../Common/MoneyInput";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbTeam,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
import { VbEmpty, VbLoad } from "./VbCommon";
import { VbPageShell } from "./VbPageShell";

interface VbManagePageProps {
  kind: VbLeagueKind;
  title: string;
  /** Rendered with the team being managed. */
  children: (team: VbTeam) => ReactNode;
}

/**
 * The frame of every coach-only page: it works out which team is being run
 * (the one in the address, else their own) and says so plainly when they have
 * none. The API is what enforces ownership; a page for someone else's team
 * simply shows the API's refusal.
 */
export const VbManagePage: FC<VbManagePageProps> = ({ kind, title, children }) => {
  const { teamId } = useParams<{ teamId?: string }>();
  const { cvbTeam, pvbTeam, vbLoading } = useSimVBStore();
  const ownTeam = kind === "college" ? cvbTeam : pvbTeam;
  const requestedId = Number(teamId);
  const selectedId =
    Number.isInteger(requestedId) && requestedId > 0
      ? requestedId
      : ownTeam?.TeamID;
  const team = useVbResource(selectedId ? `team:${selectedId}` : null, () =>
    VolleyballService.getTeam(selectedId!),
  );

  return (
    <VbPageShell kind={kind} title={title}>
      {() =>
        selectedId ? (
          <VbLoad loading={team.loading} error={team.error}>
            {team.data && (
              <div className="space-y-3">
                <div className="text-left text-sm text-(--text-muted)">
                  {team.data.Name} · changes apply from the team's next match.
                </div>
                {children(team.data)}
              </div>
            )}
          </VbLoad>
        ) : vbLoading ? (
          <VbLoad loading error={null}>
            {null}
          </VbLoad>
        ) : (
          <VbEmpty>
            You do not coach a team in this league, so there is nothing to
            manage here.
          </VbEmpty>
        )
      }
    </VbPageShell>
  );
};

/**
 * One of a team's settings views. `store` puts the view a save returned into
 * the cache, so the page shows the saved state without loading again.
 */
export const useVbManaged = <T,>(key: string, fetcher: () => Promise<T>) => {
  const { setVbResource } = useSimVBStore();
  const resource = useVbResource(key, fetcher);
  return { ...resource, store: (view: T) => setVbResource(key, view) };
};

/** Asks the browser to confirm before a tab with unsaved changes closes. */
export const useVbUnsavedWarning = (dirty: boolean) => {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
};

interface VbSaveBarProps {
  dirty: boolean;
  saving: boolean;
  /** What the API said was wrong with the last save. */
  errors: string[];
  onSave: () => void;
  onReset: () => void;
}

export const VbSaveBar: FC<VbSaveBarProps> = ({
  dirty,
  saving,
  errors,
  onSave,
  onReset,
}) => {
  useVbUnsavedWarning(dirty);
  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <ul className="space-y-1 text-left text-sm text-(--accent-error)">
          {errors.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <SportButton size="sm" onClick={onSave} disabled={!dirty || saving}>
          {saving ? "Saving..." : "Save"}
        </SportButton>
        <SportButton
          size="sm"
          variant="secondary"
          onClick={onReset}
          disabled={!dirty || saving}
        >
          Discard changes
        </SportButton>
        {dirty && (
          <span className="text-sm text-(--accent-warning)">
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  );
};

export const vbFieldClass =
  "rounded-lg border-0 bg-(--sport-surface-2) px-2 py-1.5 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-primary)";

/** vbFieldClass at 16px on phones, so iOS doesn't zoom in when it's tapped. */
export const vbFormFieldClass = vbFieldClass.replace("text-sm", "text-base sm:text-sm");

/**
 * Dollar entry in the volleyball look: commas kept while typing, a number
 * keypad, and 16px text so phones don't zoom in on tap.
 */
export const VbMoneyInput: FC<MoneyInputProps> = (props) => (
  <MoneyInput
    fieldClassName="rounded-lg bg-(--sport-surface-2) text-(--text-primary) focus-within:ring-2 focus-within:ring-(--accent-primary)"
    labelClassName="block mb-1 font-semibold"
    {...props}
  />
);

/** A labelled setting with a one-line note on what it does. */
export const VbField: FC<{
  label: string;
  help?: string;
  children: ReactNode;
}> = ({ label, help, children }) => (
  <div className="grid gap-1 py-1.5 text-left text-sm sm:grid-cols-[11rem_1fr] sm:items-center">
    <div className="font-semibold">{label}</div>
    <div>
      {children}
      {help && <div className="mt-0.5 text-xs text-(--text-muted)">{help}</div>}
    </div>
  </div>
);

interface VbSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** How to print the value beside the slider. */
  format?: (value: number) => string;
}

export const VbSlider: FC<VbSliderProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 1,
  step = 0.05,
  disabled = false,
  format = (shown) => `${Math.round(shown * 100)}%`,
}) => (
  <div className="flex items-center gap-2">
    <input
      type="range"
      className="w-full max-w-64"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <span className="w-12 text-right text-sm tabular-nums">{format(value)}</span>
  </div>
);

interface VbChoiceProps<Value extends string | number> {
  value: Value;
  options: readonly Value[];
  onChange: (value: Value) => void;
  label: string;
  format?: (value: Value) => string;
  /** Options that cannot be picked, with the reason shown on hover. */
  disabledOptions?: Partial<Record<string, string>>;
}

/** Picks one of a few values: the sports' segmented control. */
export const VbChoice = <Value extends string | number>({
  value,
  options,
  onChange,
  label,
  format = (option) => String(option),
  disabledOptions = {},
}: VbChoiceProps<Value>) => (
  <SportSegmented
    label={label}
    value={value}
    onChange={onChange}
    options={options.map(
      (option) =>
        [option, format(option), disabledOptions[String(option)]] as const,
    )}
  />
);
