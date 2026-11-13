import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { PageContainer } from "../../../_design/Container";
import { Button } from "../../../_design/Buttons";
import { SelectDropdown } from "../../../_design/Select";
import { TabGrid, Tab } from "../../../_design/Tabs";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimMLB, SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import {
  getPrimaryBaseballTeam,
  displayLevelFromId,
} from "../../../_utility/baseballHelpers";
import { BaseballTeam } from "../../../models/baseball/baseballModels";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { isBrightColor } from "../../../_utility/isBrightColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { getLogo } from "../../../_utility/getLogo";
import { BaseballService } from "../../../_services/baseballService";
import {
  TrainingCampFocusResponse,
  TrainingCampIntensity,
  TrainingCampIntensityOption,
  TrainingCampOptionsResponse,
  TrainingCampPlayer,
  TrainingCampResultsResponse,
} from "../../../models/baseball/baseballTrainingCampModels";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { useModal } from "../../../_hooks/useModal";
import { PlayerModal } from "./PlayerModal";
import "./baseballMobile.css";

type CampTab = "Focus" | "Results";
type ResultsSeason = "current" | "previous";

interface Draft {
  attr: string | null;
  intensity: TrainingCampIntensity;
}

interface Props {
  league: string;
}

const INTENSITY_ORDER: TrainingCampIntensity[] = ["regular", "intense", "max"];

const INTENSITY_LABEL: Record<TrainingCampIntensity, string> = {
  regular: "Regular",
  intense: "Intense",
  max: "Max",
};

// Selected / unselected pill styles per intensity (low → high risk)
const INTENSITY_STYLE: Record<
  TrainingCampIntensity,
  { on: string; off: string }
> = {
  regular: {
    on: "bg-green-600 text-white border-green-600",
    off: "border-green-600 text-green-700 dark:text-green-400",
  },
  intense: {
    on: "bg-amber-500 text-white border-amber-500",
    off: "border-amber-500 text-amber-700 dark:text-amber-400",
  },
  max: {
    on: "bg-red-600 text-white border-red-600",
    off: "border-red-600 text-red-700 dark:text-red-400",
  },
};

const riskText = (opt: TrainingCampIntensityOption | undefined): string => {
  if (!opt) return "";
  if (!opt.backfire_pct) return "No risk";
  return `${opt.backfire_pct}% chance of −${opt.steps_down} instead`;
};

const serverDraft = (p: TrainingCampPlayer): Draft => ({
  attr: p.focus_attr,
  intensity: p.intensity ?? "regular",
});

const sameDraft = (a: Draft, b: Draft): boolean =>
  a.attr === b.attr && (a.attr === null || a.intensity === b.intensity);

const loadErrorText = (err: any, fallback: string): string => {
  if (err?.status >= 500) {
    return "Training camp is unavailable right now (server error). Please try again later.";
  }
  return err?.message || fallback;
};

const selectClass =
  "w-full min-w-44 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed";

export const BaseballTrainingCampPage = ({ league }: Props) => {
  const { currentUser } = useAuthStore();
  const {
    seasonContext,
    mlbOrganization,
    collegeOrganization,
    bootstrappedOrgId,
    loadBootstrapForOrg,
  } = useSimBaseballStore();

  const isCollege = league === SimCollegeBaseball;
  const leagueType = isCollege ? SimCollegeBaseball : SimMLB;
  const organization = isCollege ? collegeOrganization : mlbOrganization;
  const primaryTeam = organization
    ? getPrimaryBaseballTeam(organization)
    : undefined;
  const orgId = organization?.id ?? 0;
  const currentLeagueYearId = seasonContext?.current_league_year_id ?? 0;

  useEffect(() => {
    if (organization && organization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(organization.id);
    }
  }, [organization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  // ── Team color theming ──
  const teamColors = useTeamColors(
    primaryTeam?.color_one ?? undefined,
    primaryTeam?.color_two ?? undefined,
    primaryTeam?.color_three ?? undefined,
  );
  let headerColor = teamColors.One;
  let borderColor = teamColors.Two;
  if (isBrightColor(headerColor)) {
    [headerColor, borderColor] = [borderColor, headerColor];
  }
  const headerTextClass = getTextColorBasedOnBg(headerColor);

  const logo = useMemo(() => {
    if (!primaryTeam) return "";
    return getLogo(leagueType, primaryTeam.team_id, currentUser?.IsRetro);
  }, [primaryTeam, leagueType, currentUser?.IsRetro]);

  // ── Player modal ──
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayerId, setModalPlayerId] = useState<number | null>(null);
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(
    null,
  );
  const refreshBudget = useCallback(() => {
    if (orgId && currentLeagueYearId) {
      BaseballService.GetScoutingBudget(orgId, currentLeagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [orgId, currentLeagueYearId]);
  useEffect(() => {
    refreshBudget();
  }, [refreshBudget]);
  const openPlayerModal = useCallback(
    (playerId: number) => {
      setModalPlayerId(playerId);
      handleOpenModal();
    },
    [handleOpenModal],
  );

  // ── State ──
  const [activeTab, setActiveTab] = useState<CampTab>("Focus");
  const [options, setOptions] = useState<TrainingCampOptionsResponse | null>(
    null,
  );
  const [focus, setFocus] = useState<TrainingCampFocusResponse | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  const [resultsSeason, setResultsSeason] = useState<ResultsSeason>("current");
  const [results, setResults] = useState<TrainingCampResultsResponse | null>(
    null,
  );
  const [resultsLoading, setResultsLoading] = useState(false);

  // ── Data loading ──
  useEffect(() => {
    BaseballService.GetTrainingCampOptions()
      .then(setOptions)
      .catch((err: any) =>
        setLoadError(
          loadErrorText(err, "Failed to load training camp options"),
        ),
      );
  }, []);

  const fetchFocus = useCallback(async () => {
    if (!orgId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      // League year omitted → API uses the season currently being played
      const res = await BaseballService.GetTrainingCampFocus(orgId);
      setFocus(res);
      setDrafts({});
    } catch (err: any) {
      setLoadError(loadErrorText(err, "Failed to load training camp roster"));
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchFocus();
  }, [fetchFocus]);

  const resultsYearId =
    resultsSeason === "current" ? currentLeagueYearId : currentLeagueYearId - 1;

  useEffect(() => {
    if (activeTab !== "Results" || !orgId || resultsYearId <= 0) return;
    let cancelled = false;
    setResultsLoading(true);
    BaseballService.GetTrainingCampResults(orgId, resultsYearId)
      .then((res) => {
        if (!cancelled) setResults(res);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setResults(null);
        enqueueSnackbar(loadErrorText(err, "Failed to load camp results"), {
          variant: "error",
        });
      })
      .finally(() => {
        if (!cancelled) setResultsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab, orgId, resultsYearId]);

  // ── Derived ──
  const players = focus?.players ?? [];

  const intensityMeta = useMemo(() => {
    const m = new Map<TrainingCampIntensity, TrainingCampIntensityOption>();
    options?.intensities.forEach((i) => m.set(i.intensity, i));
    return m;
  }, [options]);

  const abilitySkills = useMemo(
    () => (options?.skills ?? []).filter((s) => s.kind === "ability"),
    [options],
  );
  const pitchSkills = useMemo(
    () => (options?.skills ?? []).filter((s) => s.kind === "pitch"),
    [options],
  );

  const levels = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.level))).sort((a, b) => b - a),
    [players],
  );

  const levelOptions: SelectOption[] = useMemo(
    () => [
      { label: "All Levels", value: "__all__" },
      ...levels.map((l) => ({
        label: displayLevelFromId(l),
        value: String(l),
      })),
    ],
    [levels],
  );

  const visiblePlayers = useMemo(() => {
    const list =
      levelFilter == null
        ? players
        : players.filter((p) => p.level === levelFilter);
    return [...list].sort(
      (a, b) =>
        b.level - a.level ||
        a.ptype.localeCompare(b.ptype) ||
        a.name.localeCompare(b.name),
    );
  }, [players, levelFilter]);

  // Affiliate team at each level of the org (MLB, AAA, AA, ...)
  const teamByLevel = useMemo(() => {
    const m = new Map<number, BaseballTeam>();
    Object.values(organization?.teams ?? {}).forEach((t) =>
      m.set(t.team_level, t),
    );
    return m;
  }, [organization]);

  // Per-level focus counts for the group headers
  const levelSummary = useMemo(() => {
    const m = new Map<number, { total: number; withFocus: number }>();
    players.forEach((p) => {
      const s = m.get(p.level) ?? { total: 0, withFocus: 0 };
      s.total += 1;
      const d = drafts[p.player_id] ?? serverDraft(p);
      if (d.attr) s.withFocus += 1;
      m.set(p.level, s);
    });
    return m;
  }, [players, drafts]);

  const getDraft = (p: TrainingCampPlayer): Draft =>
    drafts[p.player_id] ?? serverDraft(p);

  const dirtyPlayers = useMemo(
    () => players.filter((p) => p.player_id in drafts),
    [players, drafts],
  );

  const updateDraft = (p: TrainingCampPlayer, patch: Partial<Draft>) => {
    setDrafts((prev) => {
      const next = { ...(prev[p.player_id] ?? serverDraft(p)), ...patch };
      const copy = { ...prev };
      if (sameDraft(next, serverDraft(p))) {
        delete copy[p.player_id];
      } else {
        copy[p.player_id] = next;
      }
      return copy;
    });
  };

  // Skills a given player can train: all abilities, plus pitch slots they throw
  const skillOptionsFor = (p: TrainingCampPlayer) => {
    const pitchOpts = pitchSkills
      .map((s) => {
        const slot = Number(s.attr.replace("pitch", ""));
        const pitchName = p.pitches?.[slot - 1];
        return pitchName
          ? { attr: s.attr, label: `${pitchName} (Pitch ${slot})` }
          : null;
      })
      .filter((o): o is { attr: string; label: string } => o !== null);
    return { abilities: abilitySkills, pitches: pitchOpts };
  };

  // ── Save / discard ──
  const handleSave = async () => {
    if (!focus || dirtyPlayers.length === 0) return;
    const toSet = dirtyPlayers
      .map((p) => ({ p, d: drafts[p.player_id] }))
      .filter(({ d }) => d.attr !== null);
    const toClear = dirtyPlayers.filter(
      (p) => drafts[p.player_id].attr === null && p.focus_attr !== null,
    );

    setIsSaving(true);
    let wroteSomething = false;
    try {
      if (toSet.length > 0) {
        await BaseballService.SetTrainingCampFocus({
          org_id: orgId,
          league_year_id: focus.league_year_id,
          items: toSet.map(({ p, d }) => ({
            player_id: p.player_id,
            attr: d.attr as string,
            intensity: d.intensity,
          })),
          set_by: currentUser?.username,
        });
        wroteSomething = true;
      }
      if (toClear.length > 0) {
        await Promise.all(
          toClear.map((p) =>
            BaseballService.ClearTrainingCampFocus({
              org_id: orgId,
              league_year_id: focus.league_year_id,
              player_id: p.player_id,
            }),
          ),
        );
        wroteSomething = true;
      }
      enqueueSnackbar("Training camp saved", { variant: "success" });
      await fetchFocus();
    } catch (err: any) {
      enqueueSnackbar(err?.message || "Failed to save training camp", {
        variant: "error",
      });
      // If part of the save went through, resync so the table shows the truth
      if (wroteSomething) await fetchFocus();
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = isCollege
    ? (primaryTeam?.team_full_name ?? organization?.org_abbrev ?? "College")
    : `${organization?.org_abbrev ?? "MLB"} Organization`;

  if (!seasonContext) {
    return (
      <PageContainer>
        <Text variant="h4">Loading...</Text>
      </PageContainer>
    );
  }

  if (!organization) {
    return (
      <PageContainer>
        <Text variant="h4">
          You need a {isCollege ? "college program" : "MLB organization"} to use
          Training Camp.
        </Text>
      </PageContainer>
    );
  }

  const totalWithFocus = players.filter((p) => p.focus_attr).length;
  const lockedCount = players.filter((p) => p.locked).length;

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Header */}
        <div
          className={`flex items-center gap-3 mb-2 flex-wrap rounded-t-lg px-4 py-2 ${headerTextClass}`}
          style={{
            backgroundColor: headerColor,
            borderBottom: `3px solid ${borderColor}`,
          }}
        >
          {logo && (
            <img src={logo} className="w-10 h-10 object-contain" alt="" />
          )}
          <div>
            <Text variant="h4" classes={headerTextClass}>
              {pageTitle} Training Camp
            </Text>
            <Text variant="small" classes={`${headerTextClass} opacity-75`}>
              Season {seasonContext.league_year}
              {!isCollege &&
                focus &&
                ` · Organization-wide · ${players.length} players across ${levels.length} level${levels.length === 1 ? "" : "s"}`}
            </Text>
          </div>
        </div>

        <TabGrid columns={2}>
          <Tab
            label="Focus"
            selected={activeTab === "Focus"}
            setSelected={(val) => setActiveTab(val as CampTab)}
          />
          <Tab
            label="Results"
            selected={activeTab === "Results"}
            setSelected={(val) => setActiveTab(val as CampTab)}
          />
        </TabGrid>

        {activeTab === "Focus" && (
          <>
            {/* How it works + intensity legend */}
            <Border
              classes="p-4 mb-2"
              styles={{ borderTop: `3px solid ${headerColor}` }}
            >
              <Text variant="small" classes="mb-3 text-left">
                {!isCollege &&
                  "Training camp covers every player your organization controls, from the big-league club down through the minors. "}
                Pick one focus skill and an intensity per player. During this
                offseason's progression the skill develops as if its potential
                were a few grades better — or worse, if a risky camp backfires.
                The outcome is final once end-season runs.
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INTENSITY_ORDER.map((key) => {
                  const opt = intensityMeta.get(key);
                  return (
                    <div
                      key={key}
                      className={`rounded-md border px-3 py-2 text-left ${INTENSITY_STYLE[key].off}`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold">
                          {INTENSITY_LABEL[key]}
                        </span>
                        {opt && (
                          <span className="text-sm font-semibold">
                            +{opt.steps_up} grade{opt.steps_up === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-90">{riskText(opt)}</div>
                      {opt?.description && (
                        <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Border>

            {/* Controls */}
            <Border classes="p-4 mb-2">
              <div className="flex flex-wrap items-end gap-4">
                {!isCollege && levels.length > 1 && (
                  <div className="min-w-40">
                    <Text variant="small" classes="font-semibold mb-1">
                      Level
                    </Text>
                    <SelectDropdown
                      options={levelOptions}
                      value={
                        levelOptions.find(
                          (o) =>
                            o.value ===
                            (levelFilter == null
                              ? "__all__"
                              : String(levelFilter)),
                        ) ?? levelOptions[0]
                      }
                      onChange={(opt) => {
                        if (!opt) return;
                        const v = (opt as SelectOption).value;
                        setLevelFilter(v === "__all__" ? null : Number(v));
                      }}
                    />
                  </div>
                )}
                <div className="text-left">
                  <Text variant="small" classes="font-semibold">
                    {totalWithFocus} of {players.length} players have a focus
                  </Text>
                  {lockedCount > 0 && (
                    <Text
                      variant="xs"
                      classes="text-gray-500 dark:text-gray-400"
                    >
                      {lockedCount} already applied this season (locked)
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {dirtyPlayers.length > 0 && (
                    <Text
                      variant="small"
                      classes="text-amber-600 dark:text-amber-400 font-semibold"
                    >
                      {dirtyPlayers.length} unsaved change
                      {dirtyPlayers.length === 1 ? "" : "s"}
                    </Text>
                  )}
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    disabled={dirtyPlayers.length === 0 || isSaving}
                    onClick={() => setDrafts({})}
                  >
                    Discard
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={dirtyPlayers.length === 0 || isSaving}
                    onClick={handleSave}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Border>

            {/* Roster table */}
            <Border classes="p-2 sm:p-4">
              {loadError ? (
                <Text variant="small" classes="text-red-500 py-4">
                  {loadError}
                </Text>
              ) : isLoading && !focus ? (
                <Text variant="small" classes="py-4">
                  Loading roster...
                </Text>
              ) : visiblePlayers.length === 0 ? (
                <Text variant="small" classes="py-4 text-gray-500">
                  No players eligible for training camp.
                </Text>
              ) : (
                <div className="baseball-table-wrapper overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                        <th className="px-3 py-2 min-w-40">Player</th>
                        <th className="px-3 py-2 text-center">Age</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Focus Skill</th>
                        <th className="px-3 py-2">Intensity</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePlayers.map((p, idx) => {
                        const d = getDraft(p);
                        const dirty = p.player_id in drafts;
                        const { abilities, pitches } = skillOptionsFor(p);
                        const knownAttr =
                          d.attr === null ||
                          abilities.some((s) => s.attr === d.attr) ||
                          pitches.some((s) => s.attr === d.attr);
                        const disabled = p.locked || isSaving;
                        const newLevel =
                          !isCollege &&
                          (idx === 0 ||
                            visiblePlayers[idx - 1].level !== p.level);
                        const levelTeam = teamByLevel.get(p.level);
                        const summary = levelSummary.get(p.level);
                        return (
                          <Fragment key={p.player_id}>
                            {newLevel && (
                              <tr className="bg-gray-100 dark:bg-gray-700/60 border-b border-gray-200 dark:border-gray-600">
                                <td
                                  colSpan={6}
                                  className="px-3 py-1.5 text-left"
                                >
                                  <span className="font-semibold">
                                    {displayLevelFromId(p.level)}
                                  </span>
                                  {levelTeam && (
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                      {levelTeam.team_full_name}
                                    </span>
                                  )}
                                  {summary && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                      ({summary.withFocus} of {summary.total}{" "}
                                      with a focus)
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )}
                            <tr
                              className={`border-b border-gray-100 dark:border-gray-700 ${
                                dirty
                                  ? "bg-amber-50 dark:bg-amber-900/20"
                                  : idx % 2 === 0
                                    ? "bg-gray-50/50 dark:bg-gray-800/30"
                                    : ""
                              }`}
                            >
                              <td className="px-3 py-2 font-medium text-left">
                                <span
                                  className="cursor-pointer hover:underline hover:text-blue-500"
                                  onClick={() => openPlayerModal(p.player_id)}
                                >
                                  {p.name}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">{p.age}</td>
                              <td className="px-3 py-2">
                                {p.ptype === "Pitcher" ? "P" : "Pos"}
                              </td>
                              <td className="px-3 py-2">
                                <select
                                  className={selectClass}
                                  value={d.attr ?? ""}
                                  disabled={disabled}
                                  onChange={(e) =>
                                    updateDraft(p, {
                                      attr: e.target.value || null,
                                    })
                                  }
                                >
                                  <option value="">— No focus —</option>
                                  {!knownAttr && d.attr && (
                                    <option value={d.attr}>
                                      {p.focus_label ?? d.attr}
                                    </option>
                                  )}
                                  <optgroup label="Abilities">
                                    {abilities.map((s) => (
                                      <option key={s.attr} value={s.attr}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </optgroup>
                                  {pitches.length > 0 && (
                                    <optgroup label="Pitches (all four components)">
                                      {pitches.map((s) => (
                                        <option key={s.attr} value={s.attr}>
                                          {s.label}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </select>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1">
                                  {INTENSITY_ORDER.map((key) => {
                                    const selected =
                                      d.attr !== null && d.intensity === key;
                                    const opt = intensityMeta.get(key);
                                    return (
                                      <button
                                        key={key}
                                        type="button"
                                        title={
                                          opt
                                            ? `+${opt.steps_up} · ${riskText(opt)}`
                                            : undefined
                                        }
                                        disabled={disabled || d.attr === null}
                                        onClick={() =>
                                          updateDraft(p, { intensity: key })
                                        }
                                        className={`px-2 py-0.5 rounded-full border text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
                                          selected
                                            ? INTENSITY_STYLE[key].on
                                            : INTENSITY_STYLE[key].off
                                        }`}
                                      >
                                        {INTENSITY_LABEL[key]}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {p.locked ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 font-semibold">
                                    Applied
                                  </span>
                                ) : dirty ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                                    Unsaved
                                  </span>
                                ) : p.focus_attr ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-semibold">
                                    Set
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Border>
          </>
        )}

        {activeTab === "Results" && (
          <Border
            classes="p-2 sm:p-4"
            styles={{ borderTop: `3px solid ${headerColor}` }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Button
                size="sm"
                variant={
                  resultsSeason === "current" ? "primary" : "primaryOutline"
                }
                onClick={() => setResultsSeason("current")}
              >
                Season {seasonContext.league_year}
              </Button>
              <Button
                size="sm"
                variant={
                  resultsSeason === "previous" ? "primary" : "primaryOutline"
                }
                onClick={() => setResultsSeason("previous")}
              >
                Season {seasonContext.league_year - 1}
              </Button>
            </div>
            <Text
              variant="xs"
              classes="mb-3 text-left text-gray-500 dark:text-gray-400"
            >
              Shows what each player trained and whether it backfired. The
              grades involved stay hidden — the visible effect is the rating
              change on the player card.
            </Text>
            {resultsLoading ? (
              <Text variant="small" classes="py-4">
                Loading results...
              </Text>
            ) : !results || results.results.length === 0 ? (
              <Text variant="small" classes="py-4 text-gray-500">
                No training camp results for this season yet. Results appear
                once end-season applies camp.
              </Text>
            ) : (
              <div className="baseball-table-wrapper overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="px-3 py-2 min-w-40">Player</th>
                      <th className="px-3 py-2">Skill</th>
                      <th className="px-3 py-2">Intensity</th>
                      <th className="px-3 py-2">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...results.results]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((r, idx) => (
                        <tr
                          key={r.player_id}
                          className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}`}
                        >
                          <td className="px-3 py-2 font-medium text-left">
                            <span
                              className="cursor-pointer hover:underline hover:text-blue-500"
                              onClick={() => openPlayerModal(r.player_id)}
                            >
                              {r.name}
                            </span>
                          </td>
                          <td className="px-3 py-2">{r.label}</td>
                          <td className="px-3 py-2">
                            {INTENSITY_LABEL[r.intensity] ?? r.intensity}
                          </td>
                          <td className="px-3 py-2">
                            {r.backfired ? (
                              <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 font-semibold">
                                Backfired · {r.steps} grade
                                {Math.abs(r.steps) === 1 ? "" : "s"}
                              </span>
                            ) : (
                              <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-semibold">
                                Success · +{r.steps} grade
                                {Math.abs(r.steps) === 1 ? "" : "s"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </Border>
        )}
      </div>

      {modalPlayerId != null && (
        <PlayerModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalPlayerId(null);
            handleCloseModal();
          }}
          playerId={modalPlayerId}
          orgId={orgId}
          leagueYearId={currentLeagueYearId}
          scoutingBudget={scoutingBudget}
          onBudgetChanged={refreshBudget}
          league={leagueType}
          context="scouting"
        />
      )}
    </PageContainer>
  );
};
