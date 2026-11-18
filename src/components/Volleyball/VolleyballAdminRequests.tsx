import { FC, Fragment, useCallback, useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import {
  isVolleyballConfigured,
  VbApiError,
  VbClaimRequest,
  VbLeagueKind,
  VolleyballClaimService,
  VolleyballCoachService,
} from "../../_services/volleyballService";
import { useVbResource } from "./useVbData";
import { VbApplicationSummary } from "./VolleyballCoachPage";
import {
  vbCell,
  VbEmpty,
  vbHeadClass,
  VbPanel,
  vbRowClass,
  vbTableClass,
} from "./VbCommon";
import { vbErrorText } from "./vbErrors";
import { vbLeagueConstant, vbRoleLabel } from "./vbFormatting";

// The pending team requests of one volleyball league, for the admin page.
// The API takes approve and reject from any signed-in user by design, so this
// component must only ever be rendered for admins and commissioners: the
// admin page is the gate.
export const VolleyballAdminRequests: FC<{ kind: VbLeagueKind }> = ({
  kind,
}) => {
  const [requests, setRequests] = useState<VbClaimRequest[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  // For the philosophy dials' wording.
  const options = useVbResource("coach-build-options", () =>
    VolleyballCoachService.getBuildOptions(),
  );

  const load = useCallback(async () => {
    setError("");
    try {
      setRequests(await VolleyballClaimService.getAll(kind));
    } catch (reason) {
      setRequests(null);
      // Deciding requests needs the admin role on the volleyball backend.
      setError(
        reason instanceof VbApiError && reason.status === 403
          ? "Your account does not have the admin role on the volleyball backend. Ask for it to be granted on the backend's Roles page."
          : vbErrorText(reason),
      );
    }
  }, [kind]);

  useEffect(() => {
    setRequests(null);
    void load();
  }, [load]);

  const decide = async (request: VbClaimRequest, approve: boolean) => {
    setBusyId(request.ID);
    try {
      if (approve) {
        const result = await VolleyballClaimService.approve(kind, request.ID);
        enqueueSnackbar(
          `${request.Username} is now ${vbRoleLabel(request.Role).toLowerCase()} of ${request.TeamName}.${
            result.CoachCreated
              ? request.Coach
                ? " Their coach was created from the application."
                : " A default coach was created for them."
              : ""
          }`,
          { variant: "success" },
        );
      } else {
        await VolleyballClaimService.reject(kind, request.ID);
        enqueueSnackbar(`Request from ${request.Username} rejected.`, {
          variant: "info",
        });
      }
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusyId(null);
      void load();
    }
  };

  if (!isVolleyballConfigured) {
    return <VbEmpty>SimSN Volleyball is not available in this build.</VbEmpty>;
  }

  return (
    <VbPanel classes="w-full" title={`${vbLeagueConstant(kind)} team requests`}>
      {error ? (
        <VbEmpty tone="error">{error}</VbEmpty>
      ) : !requests ? (
        <VbEmpty>Loading...</VbEmpty>
      ) : requests.length ? (
        <table data-keep-table className={`${vbTableClass} min-w-[680px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>User</th>
              <th className={vbCell}>Team</th>
              {kind === "pro" && <th className={vbCell}>Job</th>}
              <th className={vbCell}>Coach</th>
              <th className={vbCell}>Sent</th>
              <th className={vbCell} />
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <Fragment key={request.ID}>
                <tr className={vbRowClass}>
                  <td className={`${vbCell} font-semibold`}>
                    {request.Username}
                  </td>
                  <td className={vbCell}>{request.TeamName}</td>
                  {kind === "pro" && (
                    <td className={vbCell}>{vbRoleLabel(request.Role)}</td>
                  )}
                  <td className={vbCell}>
                    {request.Coach ? "Built in the application" : "None sent"}
                  </td>
                  <td className={vbCell}>
                    {new Date(
                      request.UpdatedAt ?? request.CreatedAt,
                    ).toLocaleString()}
                  </td>
                  <td className={`${vbCell} text-right`}>
                    <div className="inline-flex gap-2">
                      <SportButton
                        size="xs"
                        variant="secondary"
                        isSelected={openId === request.ID}
                        onClick={() =>
                          setOpenId(openId === request.ID ? null : request.ID)
                        }
                      >
                        Application
                      </SportButton>
                      {/* A pro club's assistant jobs are its staff's to
                          decide, on their Coach page; admins only read them. */}
                      {request.Approver === "staff" ? (
                        <span
                          className="self-center text-xs text-(--text-muted)"
                          title="The club's staff approve or reject requests for its assistant jobs."
                        >
                          Club staff decide
                        </span>
                      ) : (
                        <>
                          <SportButton
                            size="xs"
                            variant="success"
                            disabled={busyId !== null}
                            onClick={() => decide(request, true)}
                          >
                            Approve
                          </SportButton>
                          <SportButton
                            size="xs"
                            variant="danger"
                            disabled={busyId !== null}
                            onClick={() => decide(request, false)}
                          >
                            Reject
                          </SportButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {openId === request.ID && (
                  <tr>
                    <td colSpan={kind === "pro" ? 6 : 5} className="px-3 py-3">
                      <VbApplicationSummary
                        request={request}
                        options={options.data}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <VbEmpty>No team requests are waiting.</VbEmpty>
      )}
      <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
        Requests for one team are decided oldest first. A coach built in an
        application is created on approval; if the build no longer fits the
        rules, approval is refused and the applicant must edit and resend.
        Running the leagues
        (advancing the clock, editing teams, awards) is done in the volleyball
        backend's own admin tool.
      </div>
    </VbPanel>
  );
};
