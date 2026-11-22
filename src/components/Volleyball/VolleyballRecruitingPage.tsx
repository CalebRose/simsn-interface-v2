import { FC, Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import routes from "../../_constants/routes";
import { Modal } from "../../_design/Modal";
import { SportSelect, SportSurface } from "../Common/SportKit";
import { Tag } from "../../_design/Tags";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbLeague,
  VbMarket,
  VbRecruit,
  VbRecruitingMode,
  VbRecruitingView,
  VbResignPlan,
  VbResignView,
  VbTeam,
  VolleyballRecruitingService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons, useVbTeams } from "./useVbData";
import {
  vbCell,
  VbEmpty,
  vbGroupHead,
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
import { vbErrorLines, vbErrorText } from "./vbErrors";
import { vbHeight, vbLabel, vbMoney } from "./vbFormatting";
import {
  VbChoice,
  VbField,
  vbFieldClass,
  vbFormFieldClass,
  VbMoneyInput,
  VbSaveBar,
  useVbManaged,
} from "./VbManage";
import { VbPlayerLink } from "./VbPlayerCard";
import { VbPageShell } from "./VbPageShell";
import { VbClassRankings } from "./VbClassRankings";
import { vbFamilies, VbGrade, vbGradesFor } from "./VbGrades";

const PAGE = 100;
const positions = ["S", "OH", "OPP", "MB", "L"];
const stars = (count: number) => "★".repeat(count);

interface MarketProps {
  league: VbLeague;
  market: VbMarket;
  /** The viewer's own program, when they coach one. */
  team: VbTeam | null;
}

// Everyone sees this list. It carries rank and stars, which are public and
// deliberately imprecise, and never a rating, an ask or an offer.
const PublicList: FC<
  MarketProps & { onContacted: () => void; boardIds?: Set<number> }
> = ({ league, market, team, onContacted, boardIds }) => {
  const [search, setSearch] = useState("");
  const { seasons, currentSeason } = useVbSeasons("college");
  const [pickedSeason, setPickedSeason] = useState<number | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);
  const season = pickedSeason ?? currentSeason;
  const list = useVbResource(
    season
      ? `${market}-list:${league.LeagueID}:${season}:${starFilter}:${position}:${offset}`
      : null,
    async () => {
      if (market === "portal") {
        const portal = await VolleyballRecruitingService.getPortal(
          league.LeagueID,
          { Season: season!, Limit: PAGE, Offset: offset },
        );
        return { Total: portal.Total, Recruits: portal.Entrants };
      }
      return VolleyballRecruitingService.getRecruits(league.LeagueID, {
        Season: season!,
        Stars: starFilter ?? undefined,
        Position: position ?? undefined,
        Limit: PAGE,
        Offset: offset,
      });
    },
  );
  // A coach sees their own staff's estimate of each player on the page;
  // everyone else sees the public grades.
  const pageIds = (list.data?.Recruits ?? []).map((recruit) => recruit.PersonID);
  const estimates = useVbResource(
    team && pageIds.length
      ? `estimates:${team.TeamID}:people:${pageIds.join(",")}`
      : null,
    () => VolleyballRecruitingService.getEstimates(team!.TeamID, pageIds),
  );
  const athletes = Object.fromEntries(
    (estimates.data?.Athletes ?? []).map((athlete) => [
      athlete.PlayerID,
      athlete,
    ]),
  );
  const gradesOf = (recruit: VbRecruit) =>
    vbGradesFor(recruit.AbilityGrades, athletes[recruit.PersonID]);
  const filter = (apply: () => void) => {
    apply();
    setOffset(0);
  };
  const seasonOptions = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  const needle = search.trim().toLowerCase();
  const rows = (list.data?.Recruits ?? []).filter(
    (recruit) => !needle || recruit.Name.toLowerCase().includes(needle),
  );
  const total = list.data?.Total ?? 0;
  const canContact = Boolean(team) && season === currentSeason;

  const contact = async (recruit: VbRecruit) => {
    setBusyId(recruit.PersonID);
    try {
      const result = await VolleyballRecruitingService.contact(
        team!.TeamID,
        recruit.PersonID,
        market,
      );
      enqueueSnackbar(
        `${recruit.Name} is on your board. She is asking ${vbMoney(result.Ask)}.`,
        { variant: "success" },
      );
      onContacted();
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full shrink-0 sm:w-44">
          <SportSelect
            options={seasonOptions}
            value={
              seasonOptions.find((option) => option.value === String(season)) ??
              null
            }
            onChange={(option) =>
              option && filter(() => setPickedSeason(Number(option.value)))
            }
          />
        </div>
        {market === "hs" && (
          <>
            <VbChoice
              label="Stars"
              value={starFilter ?? 0}
              options={[0, 5, 4, 3, 2, 1]}
              format={(count) => (count ? stars(count) : "All stars")}
              onChange={(count) => filter(() => setStarFilter(count || null))}
            />
            <VbChoice
              label="Position"
              value={position ?? "All"}
              options={["All", ...positions]}
              onChange={(next) =>
                filter(() => setPosition(next === "All" ? null : next))
              }
            />
          </>
        )}
      </div>
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Find a name on this page"
        aria-label="Find a name on this page"
        className={`${vbFieldClass} w-full sm:w-72`}
      />
      <VbPanel>
        <VbLoad loading={list.loading} error={list.error} rows={12}>
          <table data-keep-table className={`${vbTableClass} min-w-[1240px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbGroupHead} border-l-0`} colSpan={6}>
                  {market === "hs" ? "RECRUIT" : "PLAYER"}
                </th>
                <th className={vbGroupHead} colSpan={1 + vbFamilies.length}>
                  {team ? "ABILITY · YOUR STAFF" : "ABILITY"}
                </th>
                <th
                  className={vbGroupHead}
                  colSpan={2 + (market === "portal" ? 1 : 0) + (canContact ? 1 : 0)}
                >
                  STATUS
                </th>
              </tr>
              <tr>
                <th className={`${vbCell} text-right`}>Rank</th>
                <th className={vbCell}>Name</th>
                <th className={vbCell}>Pos</th>
                <th className={vbCell}>Stars</th>
                <th className={`${vbCell} text-right`}>Ht</th>
                <th className={`${vbCell} text-right`}>Reach</th>
                <th className={`${vbCell} text-right`} title="Overall at her position">
                  Ovr
                </th>
                {vbFamilies.map(([key, short, label]) => (
                  <th key={key} className={`${vbCell} text-right`} title={label}>
                    {short}
                  </th>
                ))}
                <th className={vbCell}>Tags</th>
                {market === "portal" && <th className={vbCell}>From</th>}
                <th className={vbCell}>Status</th>
                {canContact && <th className={vbCell} />}
              </tr>
            </thead>
            <tbody>
              {rows.map((recruit) => (
                <tr key={recruit.PersonID} className={vbRowClass}>
                  <td className={vbNum}>{recruit.Rank}</td>
                  <td className={vbCell}>
                    <VbPlayerLink playerId={recruit.PersonID} name={recruit.Name} />
                  </td>
                  <td className={vbCell}>{recruit.Position}</td>
                  <td className={`${vbCell} text-(--accent-warning)`}>
                    {stars(recruit.Stars)}
                  </td>
                  <td className={vbNum}>{vbHeight(recruit.HeightCm)}</td>
                  <td className={vbNum}>{vbHeight(recruit.StandingReachCm)}</td>
                  <td className={`${vbNum} font-semibold`}>
                    <VbGrade value={gradesOf(recruit)?.Overall} />
                  </td>
                  {vbFamilies.map(([key]) => (
                    <td key={key} className={vbNum}>
                      <VbGrade value={gradesOf(recruit)?.Families?.[key]} />
                    </td>
                  ))}
                  <td className={vbCell}>
                    <div className="flex gap-1">
                      {recruit.Tags.map((tag) => (
                        <Tag key={tag}>{vbLabel(tag)}</Tag>
                      ))}
                    </div>
                  </td>
                  {market === "portal" && (
                    <td className={vbCell}>
                      <FromTeam teamId={recruit.FromTeamID} />
                      {recruit.Cut ? " (cut)" : ""}
                    </td>
                  )}
                  <td className={vbCell}>
                    <div className="flex items-center gap-2">
                      {vbLabel(recruit.Status)}
                      <FromTeam teamId={recruit.TeamID} />
                    </div>
                  </td>
                  {canContact && (
                    <td className={`${vbCell} text-right`}>
                      {boardIds?.has(recruit.PersonID) ? (
                        <Tag variant="blue">On your board</Tag>
                      ) : (
                        recruit.Status === "available" && (
                          <SportButton
                            size="xs"
                            disabled={busyId !== null}
                            onClick={() => contact(recruit)}
                          >
                            Add to board
                          </SportButton>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <VbEmpty>
              {market === "hs"
                ? `No recruits match for ${season}. A class is revealed each preseason.`
                : `Nobody is in the ${season} portal. It opens in the offseason.`}
            </VbEmpty>
          )}
          <div className="flex flex-wrap items-center gap-3 px-3 py-2 text-xs text-(--text-muted)">
            {total > PAGE && (
              <>
                <SportButton
                  size="xs"
                  variant="secondary"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE))}
                >
                  Previous
                </SportButton>
                <span>
                  {offset + 1}–{Math.min(offset + PAGE, total)} of {total}
                </span>
                <SportButton
                  size="xs"
                  variant="secondary"
                  disabled={offset + PAGE >= total}
                  onClick={() => setOffset(offset + PAGE)}
                >
                  Next
                </SportButton>
              </>
            )}
            <span className="text-left">
              Rank and stars are public scouting, and deliberately imprecise.
              {canContact
                ? " Contacting a player adds her to your board and reveals her asking price."
                : ""}
            </span>
          </div>
        </VbLoad>
      </VbPanel>
    </div>
  );
};

const FromTeam: FC<{ teamId: number | null | undefined }> = ({ teamId }) => {
  const { vbTeamsById } = useSimVBStore();
  if (!teamId) return null;
  return (
    <VbTeamLink
      kind="college"
      teamId={teamId}
      name={vbTeamsById[teamId]?.Name ?? `Team ${teamId}`}
    />
  );
};

const modeHelp: Record<VbRecruitingMode, string> = {
  auto: "Your staff recruits for you. You cannot contact or make offers yourself.",
  assist:
    "Your staff keeps recruiting, but never changes or withdraws an offer you made.",
  manual:
    "Only you act. If you do nothing, your program stops recruiting altogether.",
};

type BoardRow = VbRecruitingView["Board"][number];

interface BoardProps {
  team: VbTeam;
  market: VbMarket;
  view: VbRecruitingView;
  store: (view: VbRecruitingView) => void;
}

const Board: FC<BoardProps> = ({ team, market, view, store }) => {
  const id = team.TeamID;
  const [busy, setBusy] = useState(false);
  const [offering, setOffering] = useState<BoardRow | null>(null);
  const [amount, setAmount] = useState("");
  const boardIds = view.Board.map((row) => row.PlayerID);
  // The staff's view of the players on the board; it sharpens once a player
  // has been contacted. The route reads the first 100 ids.
  const estimates = useVbResource(
    boardIds.length ? `estimates:${id}:people:${boardIds.join(",")}` : null,
    () => VolleyballRecruitingService.getEstimates(id, boardIds.slice(0, 100)),
  );
  const athletes = Object.fromEntries(
    (estimates.data?.Athletes ?? []).map((athlete) => [
      athlete.PlayerID,
      athlete,
    ]),
  );
  const position = view.Position;
  // What each row is waiting on, so the ones needing a decision come first.
  const stageOf = (row: BoardRow) =>
    row.DeclinedUs || row.Status !== "available"
      ? 2
      : !row.Offer ||
          row.Response?.Response === "counter" ||
          row.Response?.Response === "decline"
        ? 0
        : 1;
  const stages = [
    "Your move",
    "Offer out: waiting for her answer",
    "Closed",
  ];
  const ordered = [...view.Board].sort(
    (a, b) => stageOf(a) - stageOf(b) || a.Rank - b.Rank,
  );

  // Every action answers with a small result, so the board is read again.
  const act = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await action();
      store(await VolleyballRecruitingService.getView(id, market));
      enqueueSnackbar(done, { variant: "success" });
      return true;
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  };
  const sendOffer = async () => {
    if (!offering) return;
    const dollars = Math.round(Number(amount));
    if (!Number.isFinite(dollars) || dollars < 0 || amount.trim() === "") {
      enqueueSnackbar("Enter an amount in whole dollars; $0 is allowed.", {
        variant: "error",
      });
      return;
    }
    const sent = await act(
      () => VolleyballRecruitingService.offer(id, offering.PlayerID, dollars, market),
      `Offer of ${vbMoney(dollars)} made to ${offering.Name}.`,
    );
    if (sent) setOffering(null);
  };
  const hands = view.Mode !== "auto";

  return (
    <div className="space-y-3">
      <VbPanel title="Your board">
        {!view.Window ? (
          <VbEmpty>
            {market === "hs"
              ? "No recruiting window is open. Recruiting runs in weekly rounds during the season."
              : "The portal is closed. It runs in daily rounds during the offseason."}
          </VbEmpty>
        ) : (
          <>
            <table data-keep-table className={`${vbTableClass} min-w-[980px]`}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>Player</th>
                  <th className={vbCell}>Pos</th>
                  <th className={vbCell}>Stars</th>
                  <th className={`${vbCell} text-right`}>Rank</th>
                  <th
                    className={`${vbCell} text-right`}
                    title="Your staff's estimate of her overall at her position"
                  >
                    Ovr
                  </th>
                  <th className={vbCell}>Status</th>
                  <th className={`${vbCell} text-right`}>Her ask</th>
                  <th className={`${vbCell} text-right`}>Your offer</th>
                  <th className={vbCell}>Her answer</th>
                  <th className={vbCell} />
                </tr>
              </thead>
              <tbody>
                {ordered.map((row, index) => (
                  <Fragment key={row.PlayerID}>
                  {(index === 0 ||
                    stageOf(ordered[index - 1]) !== stageOf(row)) && (
                    <tr>
                      <td
                        colSpan={10}
                        className="bg-(--text-primary)/5 px-2 py-1 text-left text-xs font-bold uppercase tracking-wide text-(--text-muted)"
                      >
                        {stages[stageOf(row)]}
                      </td>
                    </tr>
                  )}
                  <tr className={vbRowClass}>
                    <td className={vbCell}>
                      <VbPlayerLink playerId={row.PlayerID} name={row.Name} />
                    </td>
                    <td className={vbCell}>{row.Position}</td>
                    <td className={`${vbCell} text-(--accent-warning)`}>
                      {stars(row.Stars)}
                    </td>
                    <td className={vbNum}>{row.Rank}</td>
                    <td className={`${vbNum} font-semibold`}>
                      <VbGrade value={athletes[row.PlayerID]?.Overall} />
                    </td>
                    <td className={vbCell}>
                      <div className="flex items-center gap-2">
                        {vbLabel(row.Status)}
                        <FromTeam teamId={row.CommittedTeamID} />
                      </div>
                    </td>
                    <td className={vbNum}>{vbMoney(row.Ask)}</td>
                    <td className={vbNum}>
                      {row.Offer ? vbMoney(row.Offer.Amount) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-left">
                      {row.DeclinedUs ? (
                        <Tag variant="red">Turned you down</Tag>
                      ) : row.Response ? (
                        <>
                          <Tag
                            variant={
                              row.Response.Response === "commit"
                                ? "green"
                                : row.Response.Response === "counter"
                                  ? "yellow"
                                  : row.Response.Response === "decline"
                                    ? "red"
                                    : "blue"
                            }
                          >
                            {vbLabel(row.Response.Response)}
                          </Tag>
                          {row.Response.Counter !== null
                            ? ` at ${vbMoney(row.Response.Counter)}`
                            : ""}
                          {row.Response.Reason
                            ? `: ${row.Response.Reason}`
                            : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${vbCell} text-right`}>
                      {hands && (
                        <div className="inline-flex gap-1">
                          <SportButton
                            size="xs"
                            disabled={busy || row.DeclinedUs}
                            onClick={() => {
                              setAmount(
                                String(
                                  row.Response?.Counter ??
                                    row.Offer?.Amount ??
                                    row.Ask,
                                ),
                              );
                              setOffering(row);
                            }}
                          >
                            {row.Offer ? "Change offer" : "Offer"}
                          </SportButton>
                          {row.Offer ? (
                            <SportButton
                              size="xs"
                              variant="danger"
                              disabled={busy}
                              onClick={() =>
                                act(
                                  () =>
                                    VolleyballRecruitingService.withdrawOffer(
                                      id,
                                      row.Offer!.OfferID,
                                      market,
                                    ),
                                  `Offer to ${row.Name} withdrawn.`,
                                )
                              }
                            >
                              Withdraw
                            </SportButton>
                          ) : (
                            <SportButton
                              size="xs"
                              variant="secondary"
                              disabled={busy}
                              onClick={() =>
                                act(
                                  () =>
                                    VolleyballRecruitingService.removeContact(
                                      id,
                                      row.PlayerID,
                                      market,
                                    ),
                                  `${row.Name} removed from your board.`,
                                )
                              }
                            >
                              Remove
                            </SportButton>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
            {!view.Board.length && (
              <VbEmpty>
                Your board is empty. Add players from the full list; adding
                one reveals her asking price.
              </VbEmpty>
            )}
            <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
              {view.Window.RoundsDone} rounds played in this window
              {view.Window.Status === "signing" ? "; signing is under way" : ""}.
              Offers are sealed: nobody sees what other programs offered, and
              players answer once a round. Select a player for your staff's
              full estimate of her.
            </div>
          </>
        )}
      </VbPanel>

      <Modal
        isOpen={Boolean(offering)}
        mobileSheet
        closeOnOutsideClick={false}
        onClose={() => !busy && setOffering(null)}
        title={offering ? `Offer to ${offering.Name}` : ""}
        actions={
          <>
            <SportButton
              variant="secondary"
              disabled={busy}
              onClick={() => setOffering(null)}
            >
              Cancel
            </SportButton>
            <SportButton disabled={busy} onClick={sendOffer}>
              {busy ? "Sending..." : "Send offer"}
            </SportButton>
          </>
        }
      >
        {offering && (
          <div className="space-y-3 text-left text-sm">
            <p>
              A sealed one-year offer. She is asking {vbMoney(offering.Ask)}
              {offering.Response?.Counter != null
                ? `, and countered at ${vbMoney(offering.Response.Counter)}`
                : ""}
              . The most you may offer one player is{" "}
              {vbMoney(position.OfferCap)}; you have{" "}
              {vbMoney(position.Available)} available.
            </p>
            <VbMoneyInput
              label="Amount"
              className="max-w-64"
              value={amount === "" ? null : Number(amount)}
              onChange={(value) => setAmount(value == null ? "" : String(value))}
              presets={[
                { label: `Her ask (${vbMoney(offering.Ask)})`, apply: () => offering.Ask },
                ...(offering.Response?.Counter != null
                  ? [
                      {
                        label: `Her counter (${vbMoney(offering.Response.Counter)})`,
                        apply: () => offering.Response!.Counter!,
                      },
                    ]
                  : []),
                {
                  label: `The cap (${vbMoney(position.OfferCap)})`,
                  apply: () => position.OfferCap,
                },
              ]}
            />
            {offering.Offer && (
              <p className="text-(--text-muted)">
                This replaces your offer of {vbMoney(offering.Offer.Amount)}.
              </p>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};

const planLabels: Record<VbResignPlan, string> = {
  auto: "Leave it to my staff",
  offer: "Offer",
  cut: "Do not bid (cut)",
};

type ResignDraft = Record<number, { Plan: VbResignPlan; Amount: number | null }>;

const Resign: FC<{ team: VbTeam }> = ({ team }) => {
  const id = team.TeamID;
  const view = useVbManaged(`manage-resign:${id}`, () =>
    VolleyballRecruitingService.getResign(id),
  );
  const [draft, setDraft] = useState<ResignDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved: VbResignView = view.data;
  const current: ResignDraft =
    draft ??
    Object.fromEntries(
      saved.Players.map((player) => [
        player.PlayerID,
        { Plan: player.Plan, Amount: player.Amount },
      ]),
    );
  const change = (playerId: number, next: Partial<ResignDraft[number]>) => {
    setDraft({ ...current, [playerId]: { ...current[playerId], ...next } });
    setErrors([]);
  };
  const planned = saved.Players.reduce(
    (sum, player) =>
      sum +
      (current[player.PlayerID].Plan === "offer"
        ? (current[player.PlayerID].Amount ?? 0)
        : 0),
    0,
  );
  const cuts = saved.Players.filter(
    (player) => current[player.PlayerID].Plan === "cut",
  ).length;

  const save = async () => {
    setSaving(true);
    try {
      view.store(
        await VolleyballRecruitingService.saveResign(
          id,
          saved.Players.map((player) => {
            const { Plan, Amount } = current[player.PlayerID];
            return Plan === "offer"
              ? { PlayerID: player.PlayerID, Plan, Amount: Amount ?? 0 }
              : { PlayerID: player.PlayerID, Plan };
          }),
        ),
      );
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Re-signing plans saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbPanel title={`Re-signing for ${saved.Season}`}>
        <div className="px-3 py-2 text-left text-sm">
          Every deal lasts one year, so each returning player needs a new one
          every offseason. Your program bids first and alone; a player you do
          not bid for is cut, and each cut makes future recruits and transfers
          ask more of you.
          {saved.Open
            ? ""
            : " This offseason's re-signing has already been decided, so these plans can no longer change."}
        </div>
        <table data-keep-table className={`${vbTableClass} min-w-[760px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Player</th>
              <th className={`${vbCell} text-right`}>Seasons played</th>
              <th className={`${vbCell} text-right`}>Last year</th>
              <th className={`${vbCell} text-right`}>Her ask</th>
              <th className={vbCell}>Plan</th>
              <th className={vbCell}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {saved.Players.map((player) => {
              const row = current[player.PlayerID];
              return (
                <tr key={player.PlayerID} className={vbRowClass}>
                  <td className={vbCell}>
                    <VbPlayerLink playerId={player.PlayerID} name={player.Name} />
                  </td>
                  <td className={vbNum}>{player.SeasonsUsed}</td>
                  <td className={vbNum}>{vbMoney(player.PreviousNIL)}</td>
                  <td className={vbNum}>{vbMoney(player.Ask)}</td>
                  <td className={vbCell}>
                    <select
                      className={vbFormFieldClass}
                      aria-label={`Plan for ${player.Name}`}
                      disabled={!saved.Open}
                      value={row.Plan}
                      onChange={(event) => {
                        const Plan = event.target.value as VbResignPlan;
                        change(player.PlayerID, {
                          Plan,
                          Amount:
                            Plan === "offer" ? (row.Amount ?? player.Ask) : null,
                        });
                      }}
                    >
                      {(Object.keys(planLabels) as VbResignPlan[]).map(
                        (plan) => (
                          <option key={plan} value={plan}>
                            {planLabels[plan]}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                  <td className={vbCell}>
                    {row.Plan === "offer" ? (
                      <VbMoneyInput
                        className="w-36"
                        ariaLabel={`Amount for ${player.Name}`}
                        disabled={!saved.Open}
                        value={row.Amount ?? 0}
                        onChange={(value) =>
                          change(player.PlayerID, { Amount: value ?? 0 })
                        }
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!saved.Players.length && <VbEmpty>No returning players.</VbEmpty>}
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          {vbMoney(planned)} planned in your own offers, against a budget of{" "}
          {vbMoney(saved.Budget)}.
          {cuts
            ? ` ${cuts} ${cuts === 1 ? "player is" : "players are"} set to be cut.`
            : ""}
        </div>
      </VbPanel>
      {saved.Open && (
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
      )}
    </div>
  );
};

// The coach's standing in a market, above the tabs so it stays in view on
// the board and on the full list alike.
const RecruitingStatus: FC<{
  team: VbTeam;
  market: VbMarket;
  view: VbRecruitingView;
  store: (view: VbRecruitingView) => void;
}> = ({ team, market, view, store }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const position = view.Position;
  const liveOffers = view.Board.filter((row) => row.Offer).length;
  const setMode = async (mode: VbRecruitingMode) => {
    if (mode === view.Mode) return;
    setBusy(true);
    try {
      await VolleyballRecruitingService.setMode(team.TeamID, mode);
      store(await VolleyballRecruitingService.getView(team.TeamID, market));
      enqueueSnackbar(`Recruiting set to ${mode}.`, { variant: "success" });
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusy(false);
    }
  };
  const tile = (label: string, value: string, detail?: string) => (
    <div className="rounded-lg bg-(--sport-surface-2) p-2 text-left">
      <div className="text-xs uppercase text-(--text-muted)">{label}</div>
      <div className="text-lg font-bold tabular-nums">{value}</div>
      {detail && <div className="text-xs text-(--text-muted)">{detail}</div>}
    </div>
  );

  return (
    <SportSurface
      classes="mb-2 p-3"
      styles={{ borderTop: `3px solid ${team.ColorOne}` }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag variant={view.Window?.Status === "open" ? "green" : "gray"}>
          {view.Window
            ? `${vbLabel(view.Window.Status)} · round ${view.Window.RoundsDone + 1}`
            : market === "hs"
              ? "No recruiting window open"
              : "Portal closed"}
        </Tag>
        <span className="text-xs uppercase text-(--text-muted)">
          Who recruits
        </span>
        {(["auto", "assist", "manual"] as const).map((mode) => (
          <SportButton
            key={mode}
            size="xs"
            variant="secondary"
            isSelected={view.Mode === mode}
            disabled={busy}
            onClick={() => setMode(mode)}
          >
            {vbLabel(mode)}
          </SportButton>
        ))}
        <span
          {...vbLinkProps(() =>
            navigate(market === "hs" ? routes.CVB_TRANSFER : routes.CVB_RECRUITING),
          )}
          className={`ml-auto text-sm ${vbLinkClass}`}
        >
          {market === "hs" ? "Transfer portal →" : "High-school recruiting →"}
        </span>
      </div>
      <div
        className={`mt-1 text-left text-xs ${view.Mode === "manual" ? "text-(--accent-warning)" : "text-(--text-muted)"}`}
      >
        {modeHelp[view.Mode]}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tile(
          "Open roster spots",
          String(position.OpenSpots),
          `${position.Returning} returning · ${position.Committed} committed`,
        )}
        {tile("Board", `${view.Board.length} of ${position.BoardSize}`)}
        {tile("Live offers", `${liveOffers} of ${position.MaxOffers}`)}
        {tile(
          "Most for one offer",
          vbMoney(position.OfferCap),
        )}
      </div>
      <div className="mt-2 text-left">
        <div className="flex justify-between text-xs uppercase text-(--text-muted)">
          <span>Budget</span>
          <span className="font-semibold tabular-nums text-(--text-primary)">
            {vbMoney(position.Available)} available of {vbMoney(position.Budget)}
          </span>
        </div>
        <div className="mt-1 flex h-2 overflow-hidden rounded bg-(--text-primary)/15">
          <div
            className="h-2 bg-(--accent-success)"
            title={`Already committed: ${vbMoney(position.Firm)}`}
            style={{
              width: `${position.Budget > 0 ? Math.min(100, (position.Firm / position.Budget) * 100) : 0}%`,
            }}
          />
          <div
            className="h-2 bg-(--accent-warning)"
            title={`In live offers: ${vbMoney(position.Offers)}`}
            style={{
              width: `${position.Budget > 0 ? Math.min(100, (position.Offers / position.Budget) * 100) : 0}%`,
            }}
          />
        </div>
        <div className="mt-1 text-xs text-(--text-muted)">
          <span className="text-(--accent-success)">■</span> committed{" "}
          {vbMoney(position.Firm)} ·{" "}
          <span className="text-(--accent-warning)">■</span> in live offers{" "}
          {vbMoney(position.Offers)}
          {position.Available < 0 ? " · over budget" : ""}
        </div>
      </div>
    </SportSurface>
  );
};

type RecruitingTab = "board" | "list" | "resign" | "classes";

const RecruitingBody: FC<{ league: VbLeague; market: VbMarket }> = ({
  league,
  market,
}) => {
  const { cvbTeam, setVbResource } = useSimVBStore();
  useVbTeams("college");
  const boardKey = cvbTeam ? `manage-recruiting:${cvbTeam.TeamID}:${market}` : null;
  const view = useVbResource(boardKey, () =>
    VolleyballRecruitingService.getView(cvbTeam!.TeamID, market),
  );
  const tabs: Array<readonly [RecruitingTab, string]> = [
    ["board", "My board"],
    ["list", market === "hs" ? "All recruits" : "Everyone in the portal"],
    ...(market === "hs"
      ? [
          ["resign", "Re-signing"] as const,
          ["classes", "Class rankings"] as const,
        ]
      : []),
  ];
  const [shown, setTab] = useSportSectionTab(tabs, cvbTeam ? "board" : "list");
  // After a contact the board has a new row, so it is read again.
  const reloadBoard = async () => {
    if (!cvbTeam || !boardKey) return;
    try {
      setVbResource(
        boardKey,
        await VolleyballRecruitingService.getView(cvbTeam.TeamID, market),
      );
    } catch {
      // The board tab shows its own error when it is opened.
    }
  };

  // Someone who does not coach a college program only has the public list.
  if (!cvbTeam) {
    return (
      <PublicList
        league={league}
        market={market}
        team={null}
        onContacted={reloadBoard}
      />
    );
  }

  return (
    <div className="space-y-2">
      {view.data && (
        <RecruitingStatus
          team={cvbTeam}
          market={market}
          view={view.data}
          store={(next) => boardKey && setVbResource(boardKey, next)}
        />
      )}
      <SportBannerSections tabs={tabs} value={shown} onChange={setTab} />
      {shown === "board" && (
        <VbLoad loading={view.loading} error={view.error}>
          {view.data && (
            <Board
              team={cvbTeam}
              market={market}
              view={view.data}
              store={(next) => boardKey && setVbResource(boardKey, next)}
            />
          )}
        </VbLoad>
      )}
      {shown === "list" && (
        <PublicList
          league={league}
          market={market}
          team={view.data && view.data.Mode !== "auto" ? cvbTeam : null}
          boardIds={new Set(view.data?.Board.map((row) => row.PlayerID) ?? [])}
          onContacted={reloadBoard}
        />
      )}
      {shown === "resign" && <Resign team={cvbTeam} />}
      {shown === "classes" && <VbClassRankings league={league} />}
    </div>
  );
};

// One page serves both markets: high-school recruiting in season and the
// transfer portal in the offseason run on the same routes.
export const VolleyballRecruitingPage: FC<{ market: VbMarket }> = ({
  market,
}) => (
  <VbPageShell
    kind="college"
    title={market === "hs" ? "Recruiting" : "Transfer Portal"}
  >
    {(league) => <RecruitingBody league={league} market={market} />}
  </VbPageShell>
);
