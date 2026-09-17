import { useEffect, useMemo, useState } from "react";
import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { Scholarship, TrashCan } from "../../_design/Icons";
import { Logo } from "../../_design/Logo";
import { SelectDropdown } from "../../_design/Select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import {
  LaxBoardRecruit,
  LaxRecruit,
  LaxRecruitingAISettings,
  LaxRecruitingRanking,
  getLaxLogoUrl,
} from "../../_services/lacrosseService";
import { useSimLAXStore } from "../../context/SimLAXContext";
import { CollegeLacrosseRecruitingSidebar } from "./CollegeLacrosseRecruitingSidebar";
import { CollegeLacrosseRecruitModal } from "./CollegeLacrosseRecruitModal";

const PAGE_SIZE = 50;
type RecruitingView = "overview" | "board" | "rankings" | "class";
type SortDirection = "asc" | "desc";
type BoardSortKey =
  | "id"
  | "name"
  | "position"
  | "archetype"
  | "stars"
  | "origin"
  | "overall"
  | "potential"
  | "signingExpectation"
  | "status"
  | "leaders"
  | "points"
  | "total"
  | "actions";
const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "The SimLAX recruiting service could not be reached.";
const gradeRank = (grade: string) =>
  ({
    "A+": 12,
    A: 11,
    "A-": 10,
    "B+": 9,
    B: 8,
    "B-": 7,
    "C+": 6,
    C: 5,
    "C-": 4,
    "D+": 3,
    D: 2,
    "D-": 1,
    F: 0,
  })[grade] ?? -1;
const statusFor = (recruit: LaxRecruit) =>
  recruit.recruitStatus === "Committed" ? "Signed" : recruit.status;
const isUnitedStates = (country: string) =>
  ["US", "USA", "United States", "United States of America"].includes(
    country.trim(),
  );
const originFor = (recruit: LaxRecruit) =>
  isUnitedStates(recruit.country)
    ? recruit.state
      ? `${recruit.state}, USA`
      : "USA"
    : recruit.country;

export const CollegeLacrosseRecruitingPage = () => {
  const {
    claxRecruitingOverview,
    claxRecruitingBoard,
    claxRecruitingRankings,
    claxRecruitingTeam: team,
    refreshClaxRecruitingOverview,
    refreshClaxRecruitingBoard,
    refreshClaxRecruitingRankings,
    addClaxRecruitToBoard,
    removeClaxRecruitFromBoard,
    toggleClaxScholarship,
    saveClaxRecruitingPoints,
    saveClaxRecruitingAiSettings,
  } = useSimLAXStore();
  const recruits = claxRecruitingOverview?.recruits ?? [];
  const board = claxRecruitingBoard?.recruits ?? [];
  const rankings = claxRecruitingRankings?.rankings ?? [];
  const [selectedRecruit, setSelectedRecruit] = useState<LaxRecruit | null>(
    null,
  );
  const [revokeCandidate, setRevokeCandidate] =
    useState<LaxBoardRecruit | null>(null);
  const [view, setView] = useState<RecruitingView>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [region, setRegion] = useState("");
  const [position, setPosition] = useState("");
  const [archetype, setArchetype] = useState("");
  const [stars, setStars] = useState("");
  const [status, setStatus] = useState("");
  const [classSchoolId, setClassSchoolId] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<BoardSortKey>("total");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [pointDraft, setPointDraft] = useState<Record<number, number>>({});

  const loadOverview = refreshClaxRecruitingOverview;
  const loadBoard = async () => {
    const response = await refreshClaxRecruitingBoard();
    setPointDraft(
      Object.fromEntries(
        response.recruits.map((recruit) => [
          recruit.id,
          recruit.currentWeekPoints,
        ]),
      ),
    );
  };
  const loadRankings = refreshClaxRecruitingRankings;
  useEffect(() => {
    refreshClaxRecruitingOverview()
      .then(() => setError(""))
      .catch((reason) => setError(errorText(reason)))
      .finally(() => setLoading(false));
  }, [refreshClaxRecruitingOverview]);
  useEffect(() => {
    if (team && !classSchoolId) setClassSchoolId(String(team.teamId));
  }, [team, classSchoolId]);

  const source: LaxRecruit[] =
    view === "board"
      ? board
      : view === "class"
        ? recruits.filter(
            (recruit) =>
              String(recruit.committedTeamId ?? "") === classSchoolId,
          )
        : recruits;
  const positions = useMemo(
    () => [...new Set(recruits.map((item) => item.position))].sort(),
    [recruits],
  );
  const archetypes = useMemo(
    () => [...new Set(recruits.map((item) => item.archetype))].sort(),
    [recruits],
  );
  const states = useMemo(
    () =>
      [
        ...new Set(
          recruits
            .map((item) => item.state)
            .filter((state): state is string => Boolean(state)),
        ),
      ].sort(),
    [recruits],
  );
  const countries = useMemo(
    () =>
      [...new Set(recruits.map((item) => item.country).filter(Boolean))].sort(),
    [recruits],
  );
  const statuses = useMemo(
    () => [...new Set(recruits.map(statusFor))].sort(),
    [recruits],
  );
  const classSchools = useMemo(() => {
    const schools = new Map<number, { name: string; abbreviation: string }>();
    if (team)
      schools.set(team.teamId, {
        name: team.schoolName,
        abbreviation: team.abbreviation,
      });
    recruits.forEach((recruit) => {
      if (
        recruit.committedTeamId &&
        recruit.committedTeamName &&
        recruit.committedTeamAbbreviation
      )
        schools.set(recruit.committedTeamId, {
          name: recruit.committedTeamName,
          abbreviation: recruit.committedTeamAbbreviation,
        });
    });
    return [...schools.entries()].sort(([, left], [, right]) =>
      left.name.localeCompare(right.name),
    );
  }, [recruits, team]);
  const filtered = useMemo(
    () =>
      source.filter((recruit) => {
        const [regionType, regionValue] = region.split(":", 2);
        return (
          (!position || recruit.position === position) &&
          (!archetype || recruit.archetype === archetype) &&
          (view === "class" ||
            !region ||
            (regionType === "state"
              ? recruit.state === regionValue
              : recruit.country === regionValue)) &&
          (view === "class" || !stars || recruit.stars === Number(stars)) &&
          (view === "class" || !status || statusFor(recruit) === status)
        );
      }),
    [source, position, archetype, region, stars, status, view],
  );
  const sorted = useMemo(() => {
    if (view !== "board") return filtered;
    const value = (recruit: LaxBoardRecruit): string | number | boolean =>
      ({
        id: recruit.id,
        name: `${recruit.lastName}, ${recruit.firstName}`,
        position: recruit.position,
        archetype: recruit.archetype,
        stars: recruit.stars,
        origin: originFor(recruit),
        overall: gradeRank(recruit.overall),
        potential: gradeRank(recruit.potential),
        signingExpectation: recruit.signingExpectation,
        status: statusFor(recruit),
        leaders: recruit.leaders[0]?.totalPoints ?? -1,
        points: pointDraft[recruit.id] ?? recruit.currentWeekPoints,
        total: recruit.totalPoints,
        actions: recruit.scholarship,
      })[sortKey];
    return [...filtered].sort((a, b) => {
      const left = value(a as LaxBoardRecruit);
      const right = value(b as LaxBoardRecruit);
      const comparison =
        typeof left === "string"
          ? left.localeCompare(String(right))
          : Number(left) - Number(right);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filtered, view, sortKey, sortDirection, pointDraft]);
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const changedAllocations = board
    .filter(
      (recruit) =>
        (pointDraft[recruit.id] ?? recruit.currentWeekPoints) !==
        recruit.currentWeekPoints,
    )
    .map((recruit) => ({
      recruitId: recruit.id,
      points: pointDraft[recruit.id] ?? recruit.currentWeekPoints,
    }));
  const hasUnsavedChanges = changedAllocations.length > 0;
  const draftSpent = board.reduce(
    (total, recruit) =>
      total + (pointDraft[recruit.id] ?? recruit.currentWeekPoints),
    0,
  );
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges]);
  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };
  const selectView = async (next: RecruitingView) => {
    if (next !== view && hasUnsavedChanges) {
      if (!window.confirm("Discard your unsaved recruiting point changes?"))
        return;
      setPointDraft(
        Object.fromEntries(
          board.map((recruit) => [recruit.id, recruit.currentWeekPoints]),
        ),
      );
    }
    setView(next);
    setPage(1);
    setActionError("");
    try {
      if (next === "board") await loadBoard();
      if (next === "rankings") await loadRankings();
    } catch (reason) {
      setActionError(errorText(reason));
    }
  };
  const runAction = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await loadOverview();
      if (view === "board") await loadBoard();
      setActionError("");
    } catch (reason) {
      setActionError(errorText(reason));
    }
  };
  const runBoardAction = async (action: () => Promise<unknown>) => {
    if (
      hasUnsavedChanges &&
      !window.confirm("Discard your unsaved recruiting point changes?")
    )
      return;
    await runAction(action);
  };
  const savePoints = async () => {
    if (!team || !hasUnsavedChanges) return;
    if (changedAllocations.some(({ points }) => points < 0 || points > 20)) {
      setActionError("Recruiting points must be between 0 and 20 per recruit.");
      return;
    }
    if (draftSpent > team.weeklyPoints) {
      setActionError(
        `Weekly point allocation cannot exceed ${team.weeklyPoints}.`,
      );
      return;
    }
    try {
      await saveClaxRecruitingPoints(changedAllocations);
      await loadOverview();
      await loadBoard();
      setActionError("");
    } catch (reason) {
      setActionError(errorText(reason));
    }
  };
  const sortBy = (key: BoardSortKey) => {
    if (sortKey === key)
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };
  const exportRecruiting = () => {
    const headers = [
      "Player ID",
      "First Name",
      "Last Name",
      "Position",
      "Archetype",
      "Stars",
      "School Committed to",
      "State",
      "Country",
      "Overall",
      "Potential",
      "Signing Expectation",
      "Signing Status",
      "Leading Teams",
    ];
    const rows = recruits.map((recruit) => {
      const committedSchool = recruit.committedTeamId
        ? (recruit.leaders.find(
            (leader) => leader.teamId === recruit.committedTeamId,
          )?.teamName ?? "")
        : "";
      return [
        recruit.id,
        recruit.firstName,
        recruit.lastName,
        recruit.position,
        recruit.archetype,
        recruit.stars,
        committedSchool,
        recruit.state ?? "",
        recruit.country,
        recruit.overall,
        recruit.potential,
        recruit.signingExpectation,
        statusFor(recruit),
        recruit.leaders.map((leader) => leader.teamName).join("; "),
      ];
    });
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "simclax-recruiting.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer direction="col" isLoading={loading} title="Recruiting">
      {error ? (
        <Border classes="p-4 text-center text-red-500">{error}</Border>
      ) : (
        team && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_minmax(0,1fr)]">
            <CollegeLacrosseRecruitingSidebar team={team} />
            <main className="min-w-0 space-y-3">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <Border
                  classes="flex flex-row flex-wrap items-center justify-start gap-2 p-4"
                  direction="row"
                  styles={{ borderColor: team.primaryColor }}
                >
                  <Tab
                    active={view === "overview"}
                    onClick={() => selectView("overview")}
                  >
                    Overview
                  </Tab>
                  <Tab
                    active={view === "board"}
                    onClick={() => selectView("board")}
                  >
                    Board
                  </Tab>
                  <Tab
                    active={view === "rankings"}
                    onClick={() => selectView("rankings")}
                  >
                    Rankings
                  </Tab>
                  <Tab
                    active={view === "class"}
                    onClick={() => selectView("class")}
                  >
                    Class
                  </Tab>
                </Border>
                <Border
                  classes="flex flex-row items-center justify-between gap-3 p-4"
                  direction="row"
                  styles={{ borderColor: team.primaryColor }}
                >
                  <div
                    className={`text-left font-semibold ${team && draftSpent > team.weeklyPoints ? "text-red-400" : ""}`}
                  >
                    Weekly Points{" "}
                    {view === "board" ? draftSpent : team.spentPoints} of{" "}
                    {team.weeklyPoints}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAiSettings(true)}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={exportRecruiting}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white"
                    >
                      Export
                    </button>
                    <button
                      type="button"
                      disabled={!hasUnsavedChanges}
                      onClick={savePoints}
                      className="rounded bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </Border>
              </div>
              {view !== "rankings" && (
                <Border
                  classes={`grid grid-cols-1 gap-3 p-4 ${view === "class" ? "md:grid-cols-3" : "md:grid-cols-5"}`}
                  styles={{ borderColor: team.primaryColor }}
                >
                  {view === "class" ? (
                    <>
                      <SchoolFilter
                        value={classSchoolId}
                        schools={classSchools}
                        onChange={(value) =>
                          changeFilter(setClassSchoolId, value)
                        }
                      />
                      <Filter
                        label="Position"
                        value={position}
                        values={positions}
                        onChange={(value) => changeFilter(setPosition, value)}
                      />
                      <Filter
                        label="Archetype"
                        value={archetype}
                        values={archetypes}
                        onChange={(value) => changeFilter(setArchetype, value)}
                      />
                    </>
                  ) : (
                    <>
                      <Filter
                        label="Position"
                        value={position}
                        values={positions}
                        onChange={(value) => changeFilter(setPosition, value)}
                      />
                      <Filter
                        label="Archetype"
                        value={archetype}
                        values={archetypes}
                        onChange={(value) => changeFilter(setArchetype, value)}
                      />
                      <RegionFilter
                        value={region}
                        states={states}
                        countries={countries}
                        onChange={(value) => changeFilter(setRegion, value)}
                      />
                      <Filter
                        label="Stars"
                        value={stars}
                        values={["5", "4", "3", "2", "1"]}
                        onChange={(value) => changeFilter(setStars, value)}
                      />
                      <Filter
                        label="Status"
                        value={status}
                        values={statuses}
                        onChange={(value) => changeFilter(setStatus, value)}
                      />
                    </>
                  )}
                </Border>
              )}
              {actionError && (
                <div className="rounded border border-red-500 p-3 text-center text-red-500">
                  {actionError}
                </div>
              )}
              <Border
                classes="overflow-hidden"
                styles={{ borderColor: team.primaryColor }}
              >
                <div className="overflow-x-auto">
                  {view === "overview" ? (
                    <OverviewTable
                      recruits={visible}
                      open={setSelectedRecruit}
                      add={(id) => runAction(() => addClaxRecruitToBoard(id))}
                    />
                  ) : view === "board" ? (
                    <BoardTable
                      recruits={visible as LaxBoardRecruit[]}
                      open={setSelectedRecruit}
                      sortKey={sortKey}
                      direction={sortDirection}
                      sortBy={sortBy}
                      pointDraft={pointDraft}
                      changePoints={(id, value) => {
                        setPointDraft((current) => ({
                          ...current,
                          [id]: value,
                        }));
                        setActionError("");
                      }}
                      scholarship={(recruit) =>
                        recruit.scholarship
                          ? setRevokeCandidate(recruit)
                          : runBoardAction(() =>
                              toggleClaxScholarship(recruit.id),
                            )
                      }
                      remove={(id) =>
                        runBoardAction(() => removeClaxRecruitFromBoard(id))
                      }
                    />
                  ) : view === "class" ? (
                    <ClassTable recruits={visible} open={setSelectedRecruit} />
                  ) : (
                    <RankingsTable rankings={rankings} />
                  )}
                </div>
                {view !== "rankings" && (
                  <div className="flex items-center justify-center gap-3 border-t border-slate-600 p-3">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="rounded bg-slate-600 px-4 py-2 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span>
                      Page {page} of {pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={page === pageCount}
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded bg-blue-600 px-4 py-2 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </Border>
            </main>
          </div>
        )
      )}
      <CollegeLacrosseRecruitModal
        recruit={selectedRecruit}
        onClose={() => setSelectedRecruit(null)}
      />
      <ScholarshipRevocationModal
        recruit={revokeCandidate}
        close={() => setRevokeCandidate(null)}
        confirm={async () => {
          if (!revokeCandidate) return;
          const recruitId = revokeCandidate.id;
          setRevokeCandidate(null);
          await runBoardAction(() => toggleClaxScholarship(recruitId));
        }}
      />
      {showAiSettings && team && (
        <AiSettingsModal
          settings={team.aiSettings}
          close={() => setShowAiSettings(false)}
          save={async (settings) => {
            try {
              await saveClaxRecruitingAiSettings(settings);
              await loadBoard();
              setShowAiSettings(false);
              setActionError("");
            } catch (reason) {
              setActionError(errorText(reason));
            }
          }}
        />
      )}
    </PageContainer>
  );
};

const AiSettingsModal = ({
  settings,
  close,
  save,
}: {
  settings: LaxRecruitingAISettings;
  close: () => void;
  save: (settings: LaxRecruitingAISettings) => Promise<void>;
}) => {
  const [draft, setDraft] = useState(settings);
  const [validation, setValidation] = useState("");
  const update = (
    key: keyof LaxRecruitingAISettings,
    value: boolean | number,
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (draft.starMin > draft.starMax)
      return setValidation("Minimum stars cannot exceed maximum stars.");
    if (draft.pointsMin > draft.pointsMax)
      return setValidation("Minimum points cannot exceed maximum points.");
    void save(draft);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-settings-title"
        className="w-full max-w-xl rounded-lg border border-slate-500 bg-slate-800 p-5 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-500 pb-3">
          <h2 id="ai-settings-title" className="text-2xl font-bold">
            AI Settings
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded bg-slate-600 px-3 py-1 text-lg"
          >
            ×
          </button>
        </div>
        <label className="mt-4 flex items-center gap-3 font-semibold">
          AI Toggle
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => update("enabled", event.target.checked)}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 rounded-full bg-slate-400 transition-colors peer-checked:bg-green-600 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
        </label>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AiNumber
            label="AI Star Min"
            value={draft.starMin}
            min={1}
            max={5}
            set={(value) => update("starMin", value)}
          />
          <AiNumber
            label="AI Points Min"
            value={draft.pointsMin}
            min={1}
            max={20}
            set={(value) => update("pointsMin", value)}
          />
          <AiNumber
            label="AI Star Max"
            value={draft.starMax}
            min={1}
            max={5}
            set={(value) => update("starMax", value)}
          />
          <AiNumber
            label="AI Points Max"
            value={draft.pointsMax}
            min={1}
            max={20}
            set={(value) => update("pointsMax", value)}
          />
        </div>
        {validation && (
          <div className="mt-4 rounded border border-red-500 p-2 text-red-300">
            {validation}
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded bg-slate-600 px-4 py-2 font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded bg-blue-600 px-4 py-2 font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
const AiNumber = ({
  label,
  value,
  min,
  max,
  set,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  set: (value: number) => void;
}) => (
  <label className="grid grid-cols-[1fr_84px] items-center gap-3 font-semibold">
    {label}
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(event) =>
        set(Math.max(min, Math.min(max, Number(event.target.value))))
      }
      className="rounded border border-slate-500 bg-slate-950 px-3 py-2 text-center"
    />
  </label>
);

const Tab = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded px-3 py-1.5 text-sm font-semibold text-white ${active ? "bg-green-600" : "bg-slate-600"}`}
  >
    {children}
  </button>
);
const OverviewTable = ({
  recruits,
  open,
  add,
}: {
  recruits: LaxRecruit[];
  open: (recruit: LaxRecruit) => void;
  add: (id: number) => void;
}) => (
  <table className="w-full min-w-[1320px] border-collapse text-sm">
    <thead>
      <tr className="border-b border-slate-500">
        {[
          "ID",
          "Name",
          "Position",
          "Archetype",
          "Stars",
          "Origin",
          "Overall",
          "Potential",
          "Signing Expectation",
          "Status",
          "Leaders",
          "Actions",
        ].map((heading) => (
          <th
            key={heading}
            className={`px-3 py-3 ${["Name", "Position", "Archetype"].includes(heading) ? "text-left" : "text-center"}`}
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {recruits.map((recruit) => (
        <tr
          key={recruit.id}
          className="border-b border-slate-700 odd:bg-slate-900/20 even:bg-slate-800/40"
        >
          <RecruitCells recruit={recruit} open={open} />
          <td className="px-3 py-2 text-center">
            <button
              type="button"
              disabled={recruit.onBoard}
              onClick={() => add(recruit.id)}
              title={
                recruit.onBoard
                  ? "Already on your board"
                  : "Add to recruiting board"
              }
              className={`rounded px-3 py-1 text-lg font-bold text-white ${recruit.onBoard ? "bg-slate-600 opacity-50" : "bg-green-600"}`}
            >
              {recruit.onBoard ? "✓" : "+"}
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const boardHeaders: Array<[string, BoardSortKey, boolean]> = [
  ["ID", "id", false],
  ["Name", "name", true],
  ["Position", "position", true],
  ["Archetype", "archetype", true],
  ["Stars", "stars", false],
  ["Origin", "origin", false],
  ["Ovr", "overall", false],
  ["Pot", "potential", false],
  ["Signing Expectation", "signingExpectation", false],
  ["Status", "status", false],
  ["Leaders", "leaders", false],
  ["Add Points", "points", false],
  ["Total", "total", false],
  ["Actions", "actions", false],
];
const BoardTable = ({
  recruits,
  open,
  sortKey,
  direction,
  sortBy,
  pointDraft,
  changePoints,
  scholarship,
  remove,
}: {
  recruits: LaxBoardRecruit[];
  open: (recruit: LaxRecruit) => void;
  sortKey: BoardSortKey;
  direction: SortDirection;
  sortBy: (key: BoardSortKey) => void;
  pointDraft: Record<number, number>;
  changePoints: (id: number, value: number) => void;
  scholarship: (recruit: LaxBoardRecruit) => void;
  remove: (id: number) => void;
}) => (
  <table className="w-full min-w-[1320px] border-collapse text-sm">
    <thead>
      <tr className="border-b border-slate-500">
        {boardHeaders.map(([label, key, left]) => (
          <th
            key={key}
            tabIndex={0}
            role="button"
            onClick={() => sortBy(key)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") sortBy(key);
            }}
            className={`cursor-pointer select-none px-3 py-3 font-bold ${left ? "text-left" : "text-center"}`}
          >
            {label}
            {sortKey === key ? (direction === "asc" ? " ↑" : " ↓") : ""}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {recruits.map((recruit) => (
        <tr
          key={recruit.id}
          className="border-b border-slate-700 odd:bg-slate-900/20 even:bg-slate-800/40"
        >
          <RecruitCells recruit={recruit} open={open} />
          <td className="px-3 py-2 text-center">
            <input
              type="number"
              min={0}
              max={20}
              value={pointDraft[recruit.id] ?? recruit.currentWeekPoints}
              disabled={recruit.isLocked}
              onChange={(event) =>
                changePoints(
                  recruit.id,
                  Math.max(0, Math.min(20, Number(event.target.value))),
                )
              }
              className="w-28 rounded border border-slate-500 bg-slate-900 px-3 py-2 text-center text-lg font-semibold"
            />
          </td>
          <td className="px-3 py-2 text-center">
            {recruit.totalPoints.toFixed(3)}
          </td>
          <td className="px-3 py-2 text-center">
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={recruit.isLocked || recruit.scholarshipRevoked}
                onClick={() => scholarship(recruit)}
                title={
                  recruit.scholarshipRevoked
                    ? "Scholarship revoked permanently"
                    : recruit.scholarship
                      ? "Revoke scholarship"
                      : "Offer scholarship"
                }
                aria-label={
                  recruit.scholarshipRevoked
                    ? "Scholarship revoked permanently"
                    : recruit.scholarship
                      ? "Revoke scholarship"
                      : "Offer scholarship"
                }
                className={`rounded p-2 text-white disabled:cursor-not-allowed ${recruit.scholarshipRevoked ? "bg-red-600" : recruit.scholarship ? "bg-green-600" : "bg-slate-500"}`}
              >
                <Scholarship textColorClass="text-white" />
              </button>
              <button
                type="button"
                disabled={recruit.isLocked}
                onClick={() => remove(recruit.id)}
                title="Remove from board"
                aria-label="Remove from board"
                className="rounded bg-red-600 p-2 text-white disabled:opacity-50"
              >
                <TrashCan textColorClass="text-white" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const RankingsTable = ({ rankings }: { rankings: LaxRecruitingRanking[] }) => (
  <table className="w-full min-w-[1000px] border-collapse text-sm">
    <thead>
      <tr className="border-b border-slate-500">
        {[
          "Rank",
          "Team",
          "Coach",
          "Conference",
          "Signees",
          "5 Stars",
          "4 Stars",
          "3 Stars",
          "Score",
        ].map((heading) => (
          <th
            key={heading}
            className={`px-3 py-3 ${["Team", "Coach", "Conference"].includes(heading) ? "text-left" : "text-center"}`}
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rankings.map((entry) => (
        <tr
          key={entry.teamId}
          className="border-b border-slate-700 odd:bg-slate-900/20 even:bg-slate-800/40"
        >
          <td className="px-3 py-3 text-center font-bold">{entry.rank}</td>
          <td className="px-3 py-3 text-left font-semibold">
            <div className="flex items-center gap-2">
              <Logo url={getLaxLogoUrl(entry.logoFileName)} variant="small" />
              <span>{entry.team}</span>
            </div>
          </td>
          <td className="px-3 py-3 text-left">{entry.coach}</td>
          <td className="px-3 py-3 text-left">{entry.conference}</td>
          <td className="px-3 py-3 text-center">{entry.signees}</td>
          <td className="px-3 py-3 text-center">{entry.fiveStars}</td>
          <td className="px-3 py-3 text-center">{entry.fourStars}</td>
          <td className="px-3 py-3 text-center">{entry.threeStars}</td>
          <td className="px-3 py-3 text-center font-bold">
            {entry.score.toFixed(1)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ClassTable = ({
  recruits,
  open,
}: {
  recruits: LaxRecruit[];
  open: (recruit: LaxRecruit) => void;
}) => (
  <table className="w-full min-w-[1000px] border-collapse text-sm">
    <thead>
      <tr className="border-b border-slate-500">
        {[
          "Player ID",
          "Team",
          "Full Name",
          "Position",
          "Archetype",
          "Stars",
          "Overall",
          "Potential",
          "Origin",
        ].map((heading) => (
          <th
            key={heading}
            className={`px-3 py-3 ${["Full Name", "Position", "Archetype"].includes(heading) ? "text-left" : "text-center"}`}
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {recruits.length ? (
        recruits.map((recruit) => (
          <tr
            key={recruit.id}
            className="border-b border-slate-700 odd:bg-slate-900/20 even:bg-slate-800/40"
          >
            <td className="px-3 py-3 text-center">{recruit.id}</td>
            <td className="px-3 py-3 text-center font-semibold">
              {recruit.committedTeamAbbreviation}
            </td>
            <td className="px-3 py-3 text-left font-semibold">
              <span
                tabIndex={0}
                role="button"
                onClick={() => open(recruit)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") open(recruit);
                }}
                className="cursor-pointer hover:text-[#fcd53f]"
              >
                {recruit.firstName} {recruit.lastName}
              </span>
            </td>
            <td className="px-3 py-3 text-left">{recruit.position}</td>
            <td className="px-3 py-3 text-left">{recruit.archetype}</td>
            <td className="px-3 py-3 text-center">{recruit.stars}</td>
            <td className="px-3 py-3 text-center">{recruit.overall}</td>
            <td className="px-3 py-3 text-center">{recruit.potential}</td>
            <td className="px-3 py-3 text-center">{originFor(recruit)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
            No recruits have signed with this team.
          </td>
        </tr>
      )}
    </tbody>
  </table>
);

const ScholarshipRevocationModal = ({
  recruit,
  close,
  confirm,
}: {
  recruit: LaxBoardRecruit | null;
  close: () => void;
  confirm: () => Promise<void>;
}) => {
  if (!recruit) return null;
  const player = `${recruit.position} ${recruit.archetype} ${recruit.firstName} ${recruit.lastName}`;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="scholarship-warning-title"
        className="w-full max-w-2xl rounded-lg border border-red-500 bg-slate-800 p-6 text-center text-white shadow-2xl"
      >
        <h2
          id="scholarship-warning-title"
          className="text-2xl font-bold text-red-400"
        >
          Warning!
        </h2>
        <p className="mt-5">You are about to revoke the scholarship for:</p>
        <p className="mt-3 text-lg font-bold">
          PID {recruit.id} {"⭐".repeat(recruit.stars)} {player} (
          {recruit.potential} Pot.)
        </p>
        <p className="mt-5">
          By clicking &quot;Confirm&quot;, you will be revoking the scholarship
          offer on {player}. All points placed on this recruit will no longer be
          considered in the recruiting sync, and they will seek other schools
          elsewhere. You will <strong>NOT</strong> be able to offer them a
          scholarship after confirming this action.
        </p>
        <p className="mt-5 font-bold">This action is considered final.</p>
        <p className="mt-5 font-bold">Are you sure you want to do this?</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded bg-slate-500 px-5 py-2 font-semibold text-white hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            className="rounded bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const RecruitLeaderLogos = ({ recruit }: { recruit: LaxRecruit }) => {
  const signed =
    recruit.recruitStatus === "Committed" && Boolean(recruit.committedTeamId);
  const leaders = signed
    ? recruit.leaders
        .filter((leader) => leader.teamId === recruit.committedTeamId)
        .slice(0, 1)
    : recruit.leaders.slice(0, 3);
  return (
    <div className="flex items-center justify-center gap-2">
      {leaders.length ? (
        leaders.map((leader) => (
          <span
            key={leader.teamId}
            title={`${leader.teamName}: ${leader.totalPoints} points`}
          >
            <Logo
              url={getLaxLogoUrl(leader.logoFileName)}
              variant={signed ? "small" : "tiny"}
            />
          </span>
        ))
      ) : (
        <span className="opacity-50">None</span>
      )}
    </div>
  );
};

const RecruitCells = ({
  recruit,
  open,
}: {
  recruit: LaxRecruit;
  open: (recruit: LaxRecruit) => void;
}) => (
  <>
    <td className="px-3 py-2 text-center">{recruit.id}</td>
    <td className="px-3 py-2 text-left font-semibold">
      <span
        tabIndex={0}
        role="button"
        onClick={() => open(recruit)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") open(recruit);
        }}
        className="cursor-pointer hover:text-[#fcd53f]"
      >
        {recruit.firstName} {recruit.lastName}
      </span>
    </td>
    <td className="px-3 py-2 text-left">{recruit.position}</td>
    <td className="px-3 py-2 text-left">{recruit.archetype}</td>
    <td className="px-3 py-2 text-center">{recruit.stars}</td>
    <td className="px-3 py-2 text-center">{originFor(recruit)}</td>
    <td className="px-3 py-2 text-center font-bold">{recruit.overall}</td>
    <td className="px-3 py-2 text-center font-bold">{recruit.potential}</td>
    <td className="px-3 py-2 text-center">{recruit.signingExpectation}</td>
    <td className="px-3 py-2 text-center">{statusFor(recruit)}</td>
    <td className="px-3 py-2">
      <RecruitLeaderLogos recruit={recruit} />
    </td>
  </>
);
const SearchableFilter = ({
  label,
  value,
  options,
  onChange,
  allowAll = true,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  allowAll?: boolean;
}) => {
  const displayedOptions = allowAll
    ? [{ value: "", label: "All" }, ...options]
    : options;
  return (
    <label className="text-sm font-semibold">
      {label}
      <div className="mt-1 font-normal">
        <SelectDropdown
          isSearchable
          options={displayedOptions}
          value={
            displayedOptions.find((option) => option.value === value) ?? null
          }
          placeholder={`Search ${label.toLowerCase()}...`}
          noOptionsMessage={() => `No ${label.toLowerCase()} found`}
          onChange={(option) => onChange(option?.value ?? "")}
        />
      </div>
    </label>
  );
};
const Filter = ({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  onChange: (value: string) => void;
}) => (
  <SearchableFilter
    label={label}
    value={value}
    options={values.map((item) => ({ value: item, label: item }))}
    onChange={onChange}
  />
);
const SchoolFilter = ({
  value,
  schools,
  onChange,
}: {
  value: string;
  schools: Array<[number, { name: string; abbreviation: string }]>;
  onChange: (value: string) => void;
}) => (
  <SearchableFilter
    label="School"
    value={value}
    options={schools.map(([id, school]) => ({
      value: String(id),
      label: `${school.name} | ${school.abbreviation}`,
    }))}
    onChange={onChange}
    allowAll={false}
  />
);
const RegionFilter = ({
  value,
  states,
  countries,
  onChange,
}: {
  value: string;
  states: string[];
  countries: string[];
  onChange: (value: string) => void;
}) => (
  <SearchableFilter
    label="Region"
    value={value}
    options={[
      ...states.map((state) => ({
        value: `state:${state}`,
        label: `${state} (State)`,
      })),
      ...countries.map((country) => ({
        value: `country:${country}`,
        label: `${country} (Country)`,
      })),
    ]}
    onChange={onChange}
  />
);
