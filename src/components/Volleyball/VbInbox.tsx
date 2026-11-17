import { FC, useState } from "react";
import { SportChip } from "../Common/SportKit";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import { Modal } from "../../_design/Modal";
import routes from "../../_constants/routes";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbInbox,
  VbJobOffer,
  VbLeagueKind,
  VolleyballCoachService,
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
  VbTeamLink,
} from "./VbCommon";
import { vbErrorText } from "./vbErrors";
import { vbLabel, vbMoney, vbPaths } from "./vbFormatting";

type InboxItem = VbInbox["Items"][number];

const typeLabels: Record<string, string> = {
  claim: "Team request",
  job_offer: "Job offer",
  trade_offer: "Trade offer",
  trade_answer: "Trade answer",
  draft_board: "Draft board",
  recruit_answer: "Recruiting",
  resign_due: "Re-signing",
  staff_vacancy: "Staff vacancy",
  injury: "Injury",
  lineup_injury: "Lineup",
};

/** The page an inbox item leads to, or null when there is nowhere to send them. */
const inboxPath = (item: InboxItem, kind: VbLeagueKind, teamId: number | null) => {
  const paths = vbPaths(kind);
  const { Kind, ID } = item.Link;
  switch (Kind) {
    case "team":
      return ID ?? teamId ? paths.team((ID ?? teamId)!) : null;
    case "player":
      return ID ? paths.player(ID) : null;
    case "trade_offer":
      return routes.PVB_TRADES;
    case "draft_board":
      return routes.PVB_DRAFT;
    case "recruiting":
    case "resign":
      return routes.CVB_RECRUITING;
    case "staff":
      return (kind === "college" ? routes.CVB_STAFF : routes.PVB_STAFF).replace(
        "/:teamId?",
        "",
      );
    case "lineup":
      return paths.lineup;
    case "job_offer":
    case "request":
      return paths.coach;
    default:
      return null;
  }
};

/**
 * What needs the coach's answer, then what happened lately. The API builds
 * it on request and keeps no read state: an item that needs action stays
 * until it stops being true, and the rest drop off after a week.
 */
// How many items show before the rest are folded away. Everything that
// needs an answer always shows.
const INBOX_ROWS = 4;

/** The inbox of the user's coach at one level. */
export const VbInboxPanel: FC<{ kind: VbLeagueKind; color?: string }> = ({
  kind,
  color,
}) => {
  const navigate = useNavigate();
  const { cvbTeam, pvbTeam, vbCoaches, setVbResource } = useSimVBStore();
  const vbCoach = vbCoaches[kind];
  const team = kind === "college" ? cvbTeam : pvbTeam;
  const inbox = useVbResource(vbCoach ? `inbox:${kind}` : null, () =>
    VolleyballCoachService.getInbox(kind),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  if (!vbCoach) return null;
  const refresh = async () => {
    setRefreshing(true);
    try {
      setVbResource(`inbox:${kind}`, await VolleyballCoachService.getInbox(kind));
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setRefreshing(false);
    }
  };
  const all = inbox.data?.Items ?? [];
  const waiting = inbox.data?.NeedsAction ?? 0;
  // Notices pile up (a week of injuries, say), so only the newest few show
  // until asked for.
  const urgent = all.filter((item) => item.NeedsAction);
  const notices = all.filter((item) => !item.NeedsAction);
  const room = Math.max(0, INBOX_ROWS - urgent.length);
  const items = expanded ? all : [...urgent, ...notices.slice(0, room)];
  const hidden = all.length - items.length;

  return (
    <VbPanel
      color={color}
      title={waiting ? `Inbox · ${waiting} need your answer` : "Inbox"}
    >
      <VbLoad loading={inbox.loading} error={inbox.error} rows={3}>
        {items.length ? (
          <table data-keep-table className={vbTableClass}>
            <tbody>
              {items.map((item) => {
                const path = inboxPath(item, kind, team?.TeamID ?? null);
                return (
                  <tr key={item.ID} className={vbRowClass}>
                    <td className={`${vbCell} w-32`}>
                      <SportChip tone={item.NeedsAction ? "attention" : "neutral"}>
                        {typeLabels[item.Type] ?? vbLabel(item.Type)}
                      </SportChip>
                    </td>
                    <td
                      className={`px-2 py-1.5 text-left ${item.NeedsAction ? "font-semibold" : ""}`}
                    >
                      {item.Message}
                    </td>
                    <td
                      className={`${vbCell} hidden text-(--text-muted) sm:table-cell`}
                    >
                      {item.At
                        ? new Date(item.At).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </td>
                    <td className={`${vbCell} text-right`}>
                      {path && (
                        <span
                          {...vbLinkProps(() => navigate(path))}
                          className={vbLinkClass}
                        >
                          {item.NeedsAction ? "Answer" : "Open"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <VbEmpty>Nothing needs your answer, and nothing new this week.</VbEmpty>
        )}
        <div className="flex items-center justify-between px-3 py-2 text-xs">
          {hidden > 0 || expanded ? (
            <span
              {...vbLinkProps(() => setExpanded(!expanded))}
              className={vbLinkClass}
            >
              {expanded
                ? "Show fewer"
                : `Show ${hidden} more ${hidden === 1 ? "notice" : "notices"}`}
            </span>
          ) : (
            <span />
          )}
          <span
            {...vbLinkProps(() => !refreshing && void refresh())}
            className={vbLinkClass}
          >
            {refreshing ? "Checking..." : "Check again"}
          </span>
        </div>
      </VbLoad>
    </VbPanel>
  );
};

/**
 * Head-coach jobs offered to the coach during the college offseason. A
 * program holds its job for them until the next market day, then the offer expires.
 */
export const VbJobOffers: FC<{ kind: VbLeagueKind }> = ({ kind }) => {
  const { vbCoaches, refreshVbMe, setVbResource } = useSimVBStore();
  const vbCoach = vbCoaches[kind];
  const offers = useVbResource(vbCoach ? `job-offers:${kind}` : null, () =>
    VolleyballCoachService.getJobOffers(kind),
  );
  const [accepting, setAccepting] = useState<VbJobOffer | null>(null);
  const [busy, setBusy] = useState(false);
  const list = offers.data?.Offers ?? [];
  // A coach who has never had an offer does not need an empty panel.
  if (!vbCoach || !list.length) return null;

  const answer = async (offer: VbJobOffer, reply: "accept" | "decline") => {
    setBusy(true);
    try {
      await VolleyballCoachService.answerJobOffer(offer.OfferID, reply);
      enqueueSnackbar(
        reply === "accept"
          ? `You are now head coach of ${offer.TeamName}.`
          : `You declined ${offer.TeamName}.`,
        { variant: "success" },
      );
      setAccepting(null);
      // Accepting moves the coach at once, and their other offers lapse.
      const [fresh] = await Promise.all([
        VolleyballCoachService.getJobOffers(kind),
        refreshVbMe(),
      ]);
      setVbResource(`job-offers:${kind}`, fresh);
      setVbResource(`inbox:${kind}`, await VolleyballCoachService.getInbox(kind));
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <VbPanel title="Job offers">
      <table data-keep-table className={`${vbTableClass} min-w-[720px]`}>
        <thead className={vbHeadClass}>
          <tr>
            <th className={vbCell}>Program</th>
            <th className={`${vbCell} text-right`}>Salary</th>
            <th className={`${vbCell} text-right`}>Years</th>
            <th className={`${vbCell} text-right`}>Guaranteed</th>
            <th className={`${vbCell} text-right`}>Starts</th>
            <th className={vbCell}>Status</th>
            <th className={vbCell} />
          </tr>
        </thead>
        <tbody>
          {list.map((offer) => (
            <tr key={offer.OfferID} className={vbRowClass}>
              <td className={vbCell}>
                <VbTeamLink
                  kind="college"
                  teamId={offer.TeamID}
                  name={offer.TeamName}
                />
              </td>
              <td className={vbNum}>{vbMoney(offer.Salary)}</td>
              <td className={vbNum}>{offer.Years}</td>
              <td className={vbNum}>
                {Math.round(offer.GuaranteedShare * 100)}%
              </td>
              <td className={vbNum}>{offer.StartsSeason}</td>
              <td className={vbCell}>{vbLabel(offer.Status)}</td>
              <td className={`${vbCell} text-right`}>
                {offer.Status === "pending" && (
                  <div className="inline-flex gap-1">
                    <SportButton
                      size="xs"
                      variant="success"
                      disabled={busy}
                      onClick={() => setAccepting(offer)}
                    >
                      Accept
                    </SportButton>
                    <SportButton
                      size="xs"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => answer(offer, "decline")}
                    >
                      Decline
                    </SportButton>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
        A program holds its job for you until the next market day; after that
        the offer expires.
      </div>

      <Modal
        isOpen={Boolean(accepting)}
        onClose={() => !busy && setAccepting(null)}
        title={accepting ? `Take the ${accepting.TeamName} job` : ""}
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={busy}
              onClick={() => setAccepting(null)}
            >
              Cancel
            </SportButton>
            <SportButton
              variant="success"
              disabled={busy}
              onClick={() => accepting && answer(accepting, "accept")}
            >
              {busy ? "Moving..." : "Accept the job"}
            </SportButton>
          </>
        }
      >
        {accepting && (
          <div className="space-y-3 text-left text-sm">
            <p>
              You will leave {accepting.FromTeamName} and become head coach of{" "}
              {accepting.TeamName} at once, for {vbMoney(accepting.Salary)} a
              year over {accepting.Years}{" "}
              {accepting.Years === 1 ? "year" : "years"}.
            </p>
            <p>
              {accepting.FromTeamName} will open its job to the market, and
              any other offers you hold will lapse. This cannot be undone.
            </p>
          </div>
        )}
      </Modal>
    </VbPanel>
  );
};
