import { FC, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { SportButton, SportChip } from "../Common/SportKit";
import { Modal } from "../../_design/Modal";
import { Tag } from "../../_design/Tags";
import routes from "../../_constants/routes";
import { VbCoachLink } from "./VbCoachLink";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeagueKind,
  VbManagedStaff,
  VbOrgChart,
  VbTeam,
  VolleyballService,
  VolleyballStaffService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
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
import { vbErrorLines, vbErrorText } from "./vbErrors";
import { vbLabel, vbMoney, vbRoleLabel } from "./vbFormatting";
import { vbFieldClass, vbFormFieldClass, VbMoneyInput, VbSlider } from "./VbManage";
import { stepPresets } from "../Common/MoneyInput";
import { VbPageShell } from "./VbPageShell";
import { useVbTeamPicker } from "./VbTeamPicker";
import { VbStaffTab, vbStaffGrades } from "./VolleyballTeamTabs";

// A split as text. Shares that add up to one are shown as percentages;
// anything else is shown as the API sent it.
const splitText = (split: Record<string, number>) => {
  const entries = Object.entries(split).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const shares = Math.abs(total - 1) < 0.02;
  return entries
    .sort(([, a], [, b]) => b - a)
    .map(
      ([domain, value]) =>
        `${vbLabel(domain)} ${shares ? `${Math.round(value * 100)}%` : value}`,
    )
    .join(" · ");
};

type OrgMember = VbOrgChart["Staff"][number];

// Who reports to whom and how each assistant spends their time. The head coach
// is the user: they report to no one, and their time is their attention
// allocation, set under Development.
const OrgChart: FC<{ team: VbTeam }> = ({ team }) => {
  const id = team.TeamID;
  const { setVbResource } = useSimVBStore();
  const key = `manage-org-chart:${id}`;
  const chart = useVbResource(key, () => VolleyballStaffService.getOrgChart(id));
  // The coach's unsaved reporting lines: EmploymentID -> manager's EmploymentID.
  const [lines, setLines] = useState<Record<number, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [editing, setEditing] = useState<{
    member: OrgMember;
    split: Record<string, number>;
  } | null>(null);
  const [splitErrors, setSplitErrors] = useState<string[]>([]);

  const staff = chart.data?.Staff ?? [];
  const domains = chart.data?.Domains ?? [];
  const names = Object.fromEntries(
    staff.map((member) => [member.EmploymentID, member.Name]),
  );
  const managerOf = (member: OrgMember) =>
    lines?.[member.EmploymentID] ?? member.ManagerEmploymentID;

  // The save routes answer in their own shapes, so read the chart again.
  const reload = async () =>
    setVbResource(key, await VolleyballStaffService.getOrgChart(id));
  const run = async (
    action: () => Promise<unknown>,
    done: string,
    fail: (lines: string[]) => void,
  ) => {
    setBusy(true);
    try {
      await action();
      await reload();
      enqueueSnackbar(done, { variant: "success" });
      return true;
    } catch (reason) {
      fail(vbErrorLines(reason));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveLines = async () => {
    const reports = staff.filter((member) => member.Role !== "headCoach");
    if (reports.some((member) => managerOf(member) === null)) {
      return setErrors(["Everyone but the head coach must report to someone."]);
    }
    const saved = await run(
      () =>
        VolleyballStaffService.saveOrgChart(
          id,
          reports.map((member) => ({
            EmploymentID: member.EmploymentID,
            ManagerEmploymentID: managerOf(member)!,
          })),
        ),
      "Reporting lines saved.",
      setErrors,
    );
    if (saved) {
      setLines(null);
      setErrors([]);
    }
  };
  const resetLines = async () => {
    const saved = await run(
      () => VolleyballStaffService.saveOrgChart(id, null),
      "Reporting lines are back to the default.",
      setErrors,
    );
    if (saved) {
      setLines(null);
      setErrors([]);
    }
  };

  const openSplit = (member: OrgMember) => {
    // Start from the assistant's own split, else what they actually did last period.
    const start = member.CustomSplit ?? member.LastPeriod?.Split ?? {};
    setSplitErrors([]);
    setEditing({
      member,
      split: Object.fromEntries(
        domains.map((domain) => [domain, start[domain] ?? 0]),
      ),
    });
  };
  const splitTotal = editing
    ? Object.values(editing.split).reduce((sum, value) => sum + value, 0)
    : 0;
  const saveSplit = async (split: Record<string, number> | null) => {
    if (!editing) return;
    if (split && splitTotal <= 0) {
      return setSplitErrors(["Give at least one area some of their time."]);
    }
    const saved = await run(
      () =>
        VolleyballStaffService.saveTimeSplit(
          id,
          editing.member.EmploymentID,
          split,
        ),
      split
        ? `${editing.member.Name}'s time split saved.`
        : `${editing.member.Name} is back on the default split for their role.`,
      setSplitErrors,
    );
    if (saved) setEditing(null);
  };

  return (
    <VbPanel title="Reporting lines and time">
      <VbLoad loading={chart.loading} error={chart.error} rows={4}>
        <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Role</th>
              <th className={vbCell}>Name</th>
              <th className={vbCell}>Reports to</th>
              <th className={vbCell}>Time split</th>
              <th className={vbCell}>Last period</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => {
              const head = member.Role === "headCoach";
              return (
                <tr key={member.EmploymentID} className={vbRowClass}>
                  <td className={vbCell}>
                    {vbLabel(member.Role)}
                    {member.Interim ? " (interim)" : ""}
                  </td>
                  <td className={vbCell}>
                    <VbCoachLink personId={member.PersonID} name={member.Name} />
                  </td>
                  <td className={vbCell}>
                    {head ? (
                      "—"
                    ) : (
                      <select
                        className={vbFieldClass}
                        aria-label={`${member.Name} reports to`}
                        disabled={busy}
                        value={managerOf(member) ?? ""}
                        onChange={(event) => {
                          setErrors([]);
                          setLines({
                            ...lines,
                            [member.EmploymentID]: Number(event.target.value),
                          });
                        }}
                      >
                        {managerOf(member) === null && (
                          <option value="">Choose...</option>
                        )}
                        {staff
                          .filter(
                            (other) =>
                              other.EmploymentID !== member.EmploymentID,
                          )
                          .map((other) => (
                            <option
                              key={other.EmploymentID}
                              value={other.EmploymentID}
                            >
                              {other.Name} · {vbLabel(other.Role)}
                            </option>
                          ))}
                      </select>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-left">
                    {head ? (
                      "Set under Development, as your own attention"
                    ) : (
                      <>
                        {member.CustomSplit
                          ? splitText(member.CustomSplit)
                          : "Default for their role"}
                        <span
                          {...vbLinkProps(() => openSplit(member))}
                          className={`ml-3 ${vbLinkClass}`}
                        >
                          Change
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-left text-(--text-muted)">
                    {member.LastPeriod
                      ? `${member.LastPeriod.Season} ${vbLabel(String(member.LastPeriod.Period)).toLowerCase()}: ${splitText(member.LastPeriod.Split)}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!staff.length && <VbEmpty>No staff on record.</VbEmpty>}
        <div className="space-y-2 px-3 py-2 text-left">
          {errors.length > 0 && (
            <ul className="space-y-1 text-sm text-(--accent-error)">
              {errors.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {lines !== null && (
              <>
                <SportButton size="sm" disabled={busy} onClick={saveLines}>
                  {busy ? "Saving..." : "Save reporting lines"}
                </SportButton>
                <SportButton
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setLines(null);
                    setErrors([]);
                  }}
                >
                  Discard changes
                </SportButton>
              </>
            )}
            {chart.data?.Custom && lines === null && (
              <SportButton
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={resetLines}
              >
                Return to the default structure
              </SportButton>
            )}
          </div>
          <div className="text-xs text-(--text-muted)">
            {chart.data?.Custom
              ? "These reporting lines were set by hand."
              : "These are the default reporting lines."}{" "}
            No one may report in a circle, and no one may manage more people
            than they can handle; the server says so if a change breaks either
            rule. Last period is how each coach's time was actually spent.
          </div>
        </div>
      </VbLoad>

      <Modal
        isOpen={Boolean(editing)}
        onClose={() => !busy && setEditing(null)}
        title={editing ? `${editing.member.Name}'s time` : ""}
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={busy}
              onClick={() => setEditing(null)}
            >
              Cancel
            </SportButton>
            {editing?.member.CustomSplit && (
              <SportButton
                variant="secondary"
                disabled={busy}
                onClick={() => saveSplit(null)}
              >
                Use the default
              </SportButton>
            )}
            <SportButton
              disabled={busy}
              onClick={() => editing && saveSplit(editing.split)}
            >
              {busy ? "Saving..." : "Save"}
            </SportButton>
          </>
        }
      >
        {editing && (
          <div className="space-y-2 text-left text-sm">
            <p className="text-(--text-muted)">
              How {editing.member.Name} divides their time as{" "}
              {vbLabel(editing.member.Role).toLowerCase()}. The sliders are
              weights: the percentages always add up to 100.
            </p>
            {domains.map((domain) => (
              <div key={domain} className="flex items-center gap-3">
                <span className="w-40 shrink-0">{vbLabel(domain)}</span>
                <VbSlider
                  label={`${vbLabel(domain)} share`}
                  value={editing.split[domain] ?? 0}
                  format={(value) =>
                    splitTotal > 0
                      ? `${Math.round((value / splitTotal) * 100)}%`
                      : "0%"
                  }
                  onChange={(value) =>
                    setEditing({
                      ...editing,
                      split: { ...editing.split, [domain]: value },
                    })
                  }
                />
              </div>
            ))}
            {splitErrors.length > 0 && (
              <ul className="space-y-1 text-(--accent-error)">
                {splitErrors.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </VbPanel>
  );
};

type Candidate = VbManagedStaff["Candidates"][number];
type Employee = VbManagedStaff["Staff"][number];

// Hiring and letting go, for the team's own head coach. Grades here are the
// same public track-record ranges everyone sees.
const ManageStaff: FC<{ team: VbTeam }> = ({ team }) => {
  const id = team.TeamID;
  const { setVbResource } = useSimVBStore();
  const [role, setRole] = useState("");
  const key = `manage-staff:${id}:${role}`;
  const view = useVbResource(key, () =>
    VolleyballStaffService.getManaged(id, role || undefined),
  );
  const [busy, setBusy] = useState(false);
  const [hiring, setHiring] = useState<Candidate | null>(null);
  const [offer, setOffer] = useState({ role: "", salary: "", years: "2" });
  const [leaving, setLeaving] = useState<{
    employee: Employee;
    payout: number;
  } | null>(null);

  const reload = async () => {
    setVbResource(
      key,
      await VolleyballStaffService.getManaged(id, role || undefined),
    );
    setVbResource(
      `manage-org-chart:${id}`,
      await VolleyballStaffService.getOrgChart(id),
    );
    // The public staff table on this page shows the same people.
    setVbResource(`staff:${id}`, await VolleyballService.getStaff(id));
  };
  const act = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      await reload();
      enqueueSnackbar(done, { variant: "success" });
      return true;
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  };
  // The first call only previews the payout; nothing changes until the user confirms.
  const previewLeaving = async (employee: Employee) => {
    setBusy(true);
    try {
      const preview = await VolleyballStaffService.terminate(
        id,
        employee.EmploymentID,
        false,
      );
      setLeaving({ employee, payout: preview.Payout });
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusy(false);
    }
  };
  const hire = async () => {
    if (!hiring) return;
    const hired = await act(
      () =>
        VolleyballStaffService.hire(id, {
          PersonID: hiring.PersonID,
          Role: offer.role,
          Salary: Math.round(Number(offer.salary)),
          Years: Math.round(Number(offer.years)),
        }),
      `${hiring.Name} hired as ${vbLabel(offer.role).toLowerCase()}.`,
    );
    if (hired) setHiring(null);
  };

  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const staff = view.data;

  return (
    <div className="space-y-3">
      <VbPanel title="Your staff">
        <div className="px-3 py-2 text-left text-sm">
          Payroll {vbMoney(staff.Payroll)} of a {vbMoney(staff.Budget)} staff
          budget.{" "}
          {staff.OpenRoles.length
            ? `Open roles: ${staff.OpenRoles.map(vbLabel).join(", ")}.`
            : "Every role is filled."}
        </div>
        <table data-keep-table className={`${vbTableClass} min-w-[640px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Role</th>
              <th className={vbCell}>Name</th>
              <th className={`${vbCell} text-right`}>Salary</th>
              <th className={`${vbCell} text-right`}>Thru</th>
              <th className={`${vbCell} text-right`}>Guaranteed</th>
              <th className={vbCell} />
            </tr>
          </thead>
          <tbody>
            {staff.Staff.map((employee) => (
              <tr key={employee.EmploymentID} className={vbRowClass}>
                <td className={vbCell}>
                  {vbRoleLabel(employee.Role)}
                  {employee.Interim ? " (interim)" : ""}
                </td>
                <td className={vbCell}>
                  <VbCoachLink personId={employee.PersonID} name={employee.Name} />
                  {employee.Human && (
                    <span className="ml-2">
                      <SportChip>User</SportChip>
                    </span>
                  )}
                </td>
                <td className={vbNum}>{vbMoney(employee.Salary)}</td>
                <td className={vbNum}>{employee.ContractEnd ?? "—"}</td>
                <td className={vbNum}>
                  {employee.GuaranteedShare === null
                    ? "—"
                    : `${Math.round(employee.GuaranteedShare * 100)}%`}
                </td>
                <td className={`${vbCell} text-right`}>
                  {/* The head coach, and any job a user holds, cannot be let
                      go (the API refuses a user with 409 HUMAN). */}
                  {employee.Role !== "headCoach" && !employee.Human && (
                    <SportButton
                      size="xs"
                      variant="danger"
                      disabled={busy}
                      onClick={() => previewLeaving(employee)}
                    >
                      Let go
                    </SportButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </VbPanel>

      <OrgChart team={team} />

      <VbPanel title="Candidates">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-left text-sm">
          <span>Rank candidates for</span>
          <select
            className={vbFieldClass}
            aria-label="Role to rank candidates for"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">any role</option>
            {staff.OpenRoles.map((open) => (
              <option key={open} value={open}>
                {vbLabel(open)}
              </option>
            ))}
          </select>
        </div>
        <table data-keep-table className={`${vbTableClass} min-w-[1200px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Name</th>
              <th className={`${vbCell} text-right`}>Age</th>
              <th className={vbCell}>Last role</th>
              <th className={`${vbCell} text-right`}>Minimum salary</th>
              {vbStaffGrades.map(([gradeKey, short]) => (
                <th
                  key={gradeKey}
                  className={`${vbCell} text-center`}
                  title={vbLabel(gradeKey)}
                >
                  {short}
                </th>
              ))}
              <th className={vbCell}>Traits</th>
              <th className={vbCell} />
            </tr>
          </thead>
          <tbody>
            {staff.Candidates.map((candidate) => (
              <tr key={candidate.PersonID} className={vbRowClass}>
                <td className={vbCell}>
                  <VbCoachLink personId={candidate.PersonID} name={candidate.Name} />
                </td>
                <td className={vbNum}>{candidate.Age}</td>
                <td className={vbCell}>
                  {candidate.LastRole ? vbLabel(candidate.LastRole) : "—"}
                </td>
                <td className={vbNum}>{vbMoney(candidate.MinimumSalary)}</td>
                {vbStaffGrades.map(([gradeKey]) => (
                  <td key={gradeKey} className={`${vbCell} text-center`}>
                    {candidate.Grades[gradeKey] ?? "—"}
                  </td>
                ))}
                <td className={vbCell}>
                  <div className="flex gap-1">
                    {candidate.Traits.map((trait) => (
                      <Tag key={trait}>{vbLabel(trait)}</Tag>
                    ))}
                  </div>
                </td>
                <td className={`${vbCell} text-right`}>
                  <SportButton
                    size="xs"
                    disabled={busy || !staff.OpenRoles.length}
                    title={
                      staff.OpenRoles.length
                        ? undefined
                        : "You have no open role to hire into."
                    }
                    onClick={() => {
                      setOffer({
                        role: role || staff.OpenRoles[0],
                        salary: String(candidate.MinimumSalary),
                        years: "2",
                      });
                      setHiring(candidate);
                    }}
                  >
                    Hire
                  </SportButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!staff.Candidates.length && (
          <VbEmpty>No coaches are looking for work.</VbEmpty>
        )}
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          Grades are public estimates from each coach's track record; a range
          narrows the longer they have coached. A hire starts at once.
        </div>
      </VbPanel>

      <Modal
        isOpen={Boolean(hiring)}
        onClose={() => !busy && setHiring(null)}
        title={hiring ? `Hire ${hiring.Name}` : ""}
        mobileSheet
        closeOnOutsideClick={false}
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={busy}
              onClick={() => setHiring(null)}
            >
              Cancel
            </SportButton>
            <SportButton disabled={busy} onClick={hire}>
              {busy ? "Hiring..." : "Hire"}
            </SportButton>
          </>
        }
      >
        {hiring && (
          <div className="space-y-3 text-left text-sm">
            <label className="flex items-center gap-2">
              <span className="w-24 font-semibold">Role</span>
              <select
                className={vbFormFieldClass}
                value={offer.role}
                onChange={(event) =>
                  setOffer({ ...offer, role: event.target.value })
                }
              >
                {staff.OpenRoles.map((open) => (
                  <option key={open} value={open}>
                    {vbLabel(open)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-start gap-2">
              <label htmlFor="vb-hire-salary" className="w-24 shrink-0 pt-2 font-semibold">
                Salary
              </label>
              <VbMoneyInput
                id="vb-hire-salary"
                className="flex-1 max-w-56"
                value={offer.salary === "" ? null : Number(offer.salary)}
                onChange={(value) =>
                  setOffer({ ...offer, salary: value == null ? "" : String(value) })
                }
                presets={[
                  {
                    label: "Their minimum",
                    apply: () => hiring.MinimumSalary,
                  },
                  ...stepPresets(1_000, 5_000),
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <span id="vb-hire-years" className="w-24 shrink-0 font-semibold">
                Years
              </span>
              <div
                role="group"
                aria-labelledby="vb-hire-years"
                className="inline-flex items-center gap-1"
              >
                <SportButton
                  variant="secondary"
                  aria-label="One year fewer"
                  disabled={Number(offer.years) <= 1}
                  onClick={() =>
                    setOffer({ ...offer, years: String(Math.max(1, Number(offer.years) - 1)) })
                  }
                >
                  −
                </SportButton>
                <span className="w-10 text-center text-base font-semibold tabular-nums" aria-live="polite">
                  {offer.years}
                </span>
                <SportButton
                  variant="secondary"
                  aria-label="One year more"
                  disabled={Number(offer.years) >= 10}
                  onClick={() =>
                    setOffer({ ...offer, years: String(Math.min(10, Number(offer.years) + 1)) })
                  }
                >
                  +
                </SportButton>
              </div>
            </div>
            <p className="text-(--text-muted)">
              They will not take less than {vbMoney(hiring.MinimumSalary)}. You
              have {vbMoney(staff.Budget - staff.Payroll)} of staff budget
              left.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(leaving)}
        onClose={() => !busy && setLeaving(null)}
        title={leaving ? `Let ${leaving.employee.Name} go` : ""}
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={busy}
              onClick={() => setLeaving(null)}
            >
              Cancel
            </SportButton>
            <SportButton
              variant="danger"
              disabled={busy}
              onClick={async () => {
                const done = await act(
                  () =>
                    VolleyballStaffService.terminate(
                      id,
                      leaving!.employee.EmploymentID,
                      true,
                    ),
                  `${leaving!.employee.Name} has been let go.`,
                );
                if (done) setLeaving(null);
              }}
            >
              {busy ? "Working..." : "Let them go"}
            </SportButton>
          </>
        }
      >
        {leaving && (
          <p className="text-left text-sm">
            Letting {leaving.employee.Name} go as{" "}
            {vbLabel(leaving.employee.Role).toLowerCase()} costs a payout of{" "}
            <strong>{vbMoney(leaving.payout)}</strong>. They return to the pool
            of available coaches and the role opens up.
          </p>
        )}
      </Modal>
    </div>
  );
};

const StaffBody: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const { team, picker, isOwn, nothingSelected, waiting } = useVbTeamPicker(
    kind,
    (teamId) =>
      (kind === "college" ? routes.CVB_STAFF : routes.PVB_STAFF).replace(
        ":teamId?",
        String(teamId),
      ),
  );
  if (waiting) return <VbLoad loading error={null} children={null} />;
  return (
    <div className="space-y-3">
      {picker}
      {nothingSelected ? (
        <VbEmpty>Pick a team to see its staff.</VbEmpty>
      ) : (
        <VbLoad loading={team.loading} error={team.error}>
          {team.data && (
            <>
              <VbStaffTab kind={kind} team={team.data} />
              {isOwn && <ManageStaff key={team.data.TeamID} team={team.data} />}
            </>
          )}
        </VbLoad>
      )}
    </div>
  );
};

export const VolleyballStaffPage: FC<{ kind: VbLeagueKind }> = ({ kind }) => (
  <VbPageShell kind={kind} title="Staff">
    {() => <StaffBody kind={kind} />}
  </VbPageShell>
);
