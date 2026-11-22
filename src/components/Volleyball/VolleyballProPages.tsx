import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { SportButton } from "../Common/SportKit";
import { SportSelect } from "../Common/SportKit";
import {
  SportBannerSections,
  useSportSectionTab,
} from "../Common/SportBanner";
import { useSimVBStore } from "../../context/SimVBContext";
import {
  VbDraftBoard,
  VbDraftPick,
  VbFreeAgencyView,
  VbOfferPick,
  VbProRoster,
  VbTeam,
  VbTradeOffer,
  VbTradeSide,
  VolleyballProService,
  VolleyballService,
} from "../../_services/volleyballService";
import { useVbResource, useVbSeasons, useVbTeams } from "./useVbData";
import {
  useVbSort,
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
  VbSortHeader,
  vbTableClass,
  VbTeamLink,
} from "./VbCommon";
import { vbErrorLines, vbErrorText } from "./vbErrors";
import {
  vbHeight,
  vbLabel,
  vbMoney,
  vbPaths,
  vbPhaseLabel,
} from "./vbFormatting";
import { VbChoice, vbFieldClass, VbMoneyInput, VbSaveBar, useVbManaged } from "./VbManage";
import { VbPlayerLink } from "./VbPlayerCard";
import { VbPageShell } from "./VbPageShell";
import { vbFamilies, VbGrade, vbGradeRank } from "./VbGrades";

/** A season dropdown; `season` is undefined until the user picks one. */
const useSeasonPicker = () => {
  const { seasons, currentSeason } = useVbSeasons("pro");
  const [picked, setPicked] = useState<number | null>(null);
  const season = picked ?? currentSeason;
  const options = seasons.map((year) => ({
    value: String(year),
    label: String(year),
  }));
  const picker = (
    <div className="w-32">
      <SportSelect
        options={options}
        value={options.find((option) => option.value === String(season)) ?? null}
        onChange={(option) => option && setPicked(Number(option.value))}
      />
    </div>
  );
  return { season, picker };
};

// The three public lists hang off the college league's id.
const useCollegeLeagueId = () => useSimVBStore().vbLeagues.college?.LeagueID;

const transactionLabels: Record<string, string> = {
  drafted: "Drafted",
  pro_signed: "Signed",
  pro_released: "Released",
  pro_retired: "Retired",
  overseas: "Went overseas",
  traded: "Traded to",
};

const Transactions: FC = () => {
  const leagueId = useCollegeLeagueId();
  const { season, picker } = useSeasonPicker();
  const [type, setType] = useState("all");
  const list = useVbResource(
    leagueId && season ? `pro-transactions:${season}` : null,
    () => VolleyballProService.getTransactions(leagueId!, season!),
  );
  const all = list.data?.Transactions ?? [];
  const types = ["all", ...new Set(all.map((item) => item.Type))];
  const shown = all.filter((item) => type === "all" || item.Type === type);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {picker}
        <VbChoice
          label="Kind of transaction"
          value={type}
          options={types}
          format={(item) =>
            item === "all" ? "All" : (transactionLabels[item] ?? vbLabel(item))
          }
          onChange={setType}
        />
      </div>
      <VbPanel>
        <VbLoad loading={list.loading} error={list.error} rows={12}>
          <table data-keep-table className={`${vbTableClass} min-w-[640px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>Player</th>
                <th className={vbCell}>Move</th>
                <th className={vbCell}>Club</th>
                <th className={`${vbCell} text-right`}>Salary</th>
                <th className={`${vbCell} text-right`}>Seasons</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((item, index) => (
                <tr key={index} className={vbRowClass}>
                  <td className={vbCell}>
                    <VbPlayerLink playerId={item.PlayerID} name={item.Name} teamId={item.ClubID} />
                  </td>
                  <td className={vbCell}>
                    {transactionLabels[item.Type] ?? vbLabel(item.Type)}
                    {item.Pick ? ` (pick ${item.Pick})` : ""}
                    {item.Resigned ? " (re-signed)" : ""}
                  </td>
                  <td className={vbCell}>
                    {item.ClubID && item.Club ? (
                      <VbTeamLink kind="pro" teamId={item.ClubID} name={item.Club} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={vbNum}>
                    {item.Salary === null ? "—" : vbMoney(item.Salary)}
                  </td>
                  <td className={vbNum}>{item.Seasons ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shown.length && (
            <VbEmpty>No transactions on record for {season}.</VbEmpty>
          )}
        </VbLoad>
      </VbPanel>
    </div>
  );
};

interface ShortlistRow {
  PlayerID: number;
  Name: string;
  MaxSalary: number;
}

const Shortlist: FC<{ club: VbTeam }> = ({ club }) => {
  const id = club.TeamID;
  const view = useVbManaged(`manage-free-agency:${id}`, () =>
    VolleyballProService.getFreeAgency(id),
  );
  const [draft, setDraft] = useState<ShortlistRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved: VbFreeAgencyView = view.data;
  const current: ShortlistRow[] =
    draft ?? [...saved.Shortlist].sort((a, b) => a.Rank - b.Rank);
  const change = (next: ShortlistRow[]) => {
    setDraft(next);
    setErrors([]);
  };
  const listed = new Set(current.map((row) => row.PlayerID));
  const move = (index: number, by: number) => {
    const next = [...current];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    change(next);
  };
  const save = async () => {
    setSaving(true);
    try {
      view.store(
        await VolleyballProService.saveShortlist(
          id,
          current.map(({ PlayerID, MaxSalary }) => ({ PlayerID, MaxSalary })),
        ),
      );
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Shortlist saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbPanel title={`Your shortlist · ${saved.Season}`}>
        <div className="px-3 py-2 text-left text-sm">
          This is not live bidding. When free agency runs, your club bids for
          these players in this order, up to the salary you set for each. With
          an empty list your club's own policy decides.
          {saved.Open
            ? ""
            : " Free agency has already run this season, so the list can no longer change."}
        </div>
        {current.length ? (
          <table data-keep-table className={`${vbTableClass} min-w-[560px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbCell} text-right`}>Priority</th>
                <th className={vbCell}>Player</th>
                <th className={vbCell}>Most you will pay</th>
                <th className={vbCell} />
              </tr>
            </thead>
            <tbody>
              {current.map((row, index) => (
                <tr key={row.PlayerID} className={vbRowClass}>
                  <td className={vbNum}>{index + 1}</td>
                  <td className={vbCell}>
                    <VbPlayerLink playerId={row.PlayerID} name={row.Name} />
                  </td>
                  <td className={vbCell}>
                    <VbMoneyInput
                      className="w-36"
                      ariaLabel={`Most you will pay ${row.Name}`}
                      disabled={!saved.Open}
                      value={row.MaxSalary}
                      onChange={(value) =>
                        change(
                          current.map((item) =>
                            item.PlayerID === row.PlayerID
                              ? { ...item, MaxSalary: value ?? 0 }
                              : item,
                          ),
                        )
                      }
                    />
                  </td>
                  <td className={`${vbCell} text-right`}>
                    {saved.Open && (
                      <div className="inline-flex gap-1">
                        <SportButton
                          size="xs"
                          variant="secondary"
                          aria-label={`Move ${row.Name} up`}
                          disabled={index === 0}
                          onClick={() => move(index, -1)}
                        >
                          ↑
                        </SportButton>
                        <SportButton
                          size="xs"
                          variant="secondary"
                          aria-label={`Move ${row.Name} down`}
                          disabled={index === current.length - 1}
                          onClick={() => move(index, 1)}
                        >
                          ↓
                        </SportButton>
                        <SportButton
                          size="xs"
                          variant="danger"
                          onClick={() =>
                            change(
                              current.filter(
                                (item) => item.PlayerID !== row.PlayerID,
                              ),
                            )
                          }
                        >
                          Remove
                        </SportButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <VbEmpty>
            Your shortlist is empty. Add players from the list below.
          </VbEmpty>
        )}
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

      <VbPanel title="Contracts ending this season">
        <table data-keep-table className={`${vbTableClass} min-w-[560px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Player</th>
              <th className={vbCell}>Club</th>
              <th className={`${vbCell} text-right`}>Age</th>
              <th className={`${vbCell} text-right`}>Salary now</th>
              <th className={vbCell} />
            </tr>
          </thead>
          <tbody>
            {saved.Expiring.map((player) => (
              <tr key={player.PlayerID} className={vbRowClass}>
                <td className={vbCell}>
                  <VbPlayerLink
                    playerId={player.PlayerID}
                    name={player.Name}
                    teamId={player.ClubID}
                  />
                </td>
                <td className={vbCell}>
                  <ClubName clubId={player.ClubID} />
                </td>
                <td className={vbNum}>{player.Age ?? "—"}</td>
                <td className={vbNum}>{vbMoney(player.Salary)}</td>
                <td className={`${vbCell} text-right`}>
                  {saved.Open && !listed.has(player.PlayerID) && (
                    <SportButton
                      size="xs"
                      disabled={current.length >= 40}
                      onClick={() =>
                        change([
                          ...current,
                          {
                            PlayerID: player.PlayerID,
                            Name: player.Name,
                            MaxSalary: player.Salary,
                          },
                        ])
                      }
                    >
                      Add
                    </SportButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!saved.Expiring.length && (
          <VbEmpty>No contracts are ending this season.</VbEmpty>
        )}
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          Her ratings are on her club's roster page. A shortlist holds up to 40
          players.
        </div>
      </VbPanel>
    </div>
  );
};

const ClubName: FC<{ clubId: number }> = ({ clubId }) => {
  const { vbTeamsById } = useSimVBStore();
  return (
    <VbTeamLink
      kind="pro"
      teamId={clubId}
      name={vbTeamsById[clubId]?.Name ?? `Club ${clubId}`}
    />
  );
};

/** A pro player's name, found on the roster of the club she plays for. */
const ProPlayerName: FC<{ clubId: number; playerId: number }> = ({
  clubId,
  playerId,
}) => {
  const roster = useVbResource(`pro-roster:${clubId}`, () =>
    VolleyballService.getProRoster(clubId),
  );
  const player = roster.data?.Players.find((item) => item.PlayerID === playerId);
  return <>{player?.Name ?? `Player ${playerId}`}</>;
};

const Releases: FC<{ club: VbTeam }> = ({ club }) => {
  const id = club.TeamID;
  const view = useVbManaged(`manage-releases:${id}`, () =>
    VolleyballProService.getReleases(id),
  );
  const [draft, setDraft] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved = view.data;
  const current = draft ?? saved.Releases;
  const toggle = (playerId: number) => {
    setDraft(
      current.includes(playerId)
        ? current.filter((item) => item !== playerId)
        : [...current, playerId],
    );
    setErrors([]);
  };
  const save = async () => {
    setSaving(true);
    try {
      view.store(await VolleyballProService.saveReleases(id, current));
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Release plan saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbPanel title={`Players under contract · ${saved.Season}`}>
        <div className="px-3 py-2 text-left text-sm">
          Tick the players you plan to release. The plan is carried out when
          free agency runs; until then you can change it. Up to 14 players.
        </div>
        <table data-keep-table className={`${vbTableClass} min-w-[480px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={vbCell}>Release</th>
              <th className={vbCell}>Player</th>
              <th className={`${vbCell} text-right`}>Salary</th>
              <th className={`${vbCell} text-right`}>Contract thru</th>
            </tr>
          </thead>
          <tbody>
            {saved.UnderContract.map((contract) => {
              const releasing = current.includes(contract.PlayerID);
              return (
                <tr key={contract.PlayerID} className={vbRowClass}>
                  <td className={vbCell}>
                    <input
                      type="checkbox"
                      aria-label={`Release player ${contract.PlayerID}`}
                      checked={releasing}
                      disabled={!releasing && current.length >= 14}
                      onChange={() => toggle(contract.PlayerID)}
                    />
                  </td>
                  <td className={`${vbCell} font-semibold`}>
                    <ProPlayerName clubId={id} playerId={contract.PlayerID} />
                  </td>
                  <td className={vbNum}>{vbMoney(contract.Salary)}</td>
                  <td className={vbNum}>{contract.Through}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!saved.UnderContract.length && (
          <VbEmpty>Nobody is under contract.</VbEmpty>
        )}
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

type FreeAgencyTab = "shortlist" | "releases" | "transactions";

const FreeAgencyBody: FC = () => {
  const { pvbTeam } = useSimVBStore();
  useVbTeams("pro");
  const tabs: Array<readonly [FreeAgencyTab, string]> = [
    ["shortlist", "Shortlist"],
    ["releases", "Releases"],
    ["transactions", "Transactions"],
  ];
  const [shown, setTab] = useSportSectionTab(tabs, "shortlist");
  // Without a pro club there is only the public transaction list to show.
  if (!pvbTeam) return <Transactions />;
  return (
    <div className="space-y-2">
      <SportBannerSections tabs={tabs} value={shown} onChange={setTab} />
      {/* The two editors stay mounted so switching tabs keeps unsaved edits. */}
      <div className={shown === "shortlist" ? "" : "hidden"}>
        <Shortlist club={pvbTeam} />
      </div>
      <div className={shown === "releases" ? "" : "hidden"}>
        <Releases club={pvbTeam} />
      </div>
      {shown === "transactions" && <Transactions />}
    </div>
  );
};

export const VolleyballFreeAgencyPage: FC = () => (
  <VbPageShell kind="pro" title="Free Agency">
    {() => <FreeAgencyBody />}
  </VbPageShell>
);

const pickLabel = (pick: { Season: number; Round: number }) =>
  `${pick.Season} round ${pick.Round}`;

/** "2027 round 1 (from Milwaukee Wildfire)" for a pick its holder acquired. */
const heldPickLabel = (pick: VbDraftPick, holderId: number) =>
  `${pickLabel(pick)}${
    pick.OriginalClubID !== holderId
      ? ` (from ${pick.OriginalClubName ?? "another club"})`
      : ""
  }`;

/** One side of an offer in words, from the names the offer itself carries. */
const OfferSide: FC<{
  clubId: number;
  players: Array<{ PlayerID: number; Name: string | null }>;
  picks?: VbOfferPick[];
  pickIds: number[];
}> = ({ clubId, players, picks, pickIds }) => {
  const pickTexts = picks
    ? picks.map((pick) =>
        pick.Season === null || pick.Round === null
          ? `pick #${pick.PickID}`
          : `${pick.Season} round ${pick.Round} pick${
              pick.OriginalClubName ? ` (${pick.OriginalClubName}'s)` : ""
            }`,
      )
    : pickIds.map((pickId) => `pick #${pickId}`);
  if (!players.length && !pickTexts.length) return <>Nothing</>;
  return (
    <>
      {players.map((player, index) => (
        <span key={player.PlayerID}>
          {index > 0 ? ", " : ""}
          {player.Name ?? (
            <ProPlayerName clubId={clubId} playerId={player.PlayerID} />
          )}
        </span>
      ))}
      {pickTexts.map((text, index) => (
        <span key={index}>
          {players.length || index > 0 ? ", " : ""}
          {text}
        </span>
      ))}
    </>
  );
};

const TradeLog: FC = () => {
  const leagueId = useCollegeLeagueId();
  const { season, picker } = useSeasonPicker();
  const trades = useVbResource(
    leagueId && season ? `pro-trades:${season}` : null,
    () => VolleyballProService.getTrades(leagueId!, season!),
  );
  // A trade names players by id only; the season's transactions have names.
  const transactions = useVbResource(
    leagueId && season ? `pro-transactions:${season}` : null,
    () => VolleyballProService.getTransactions(leagueId!, season!),
  );
  const names = useMemo(
    () =>
      Object.fromEntries(
        (transactions.data?.Transactions ?? []).map((item) => [
          item.PlayerID,
          item.Name,
        ]),
      ),
    [transactions.data],
  );
  const sends = (side: VbTradeSide) =>
    [
      ...(
        side.Sends.PlayerIDs ??
        (side.Sends.PlayerID === null ? [] : [side.Sends.PlayerID])
      ).map((playerId) => names[playerId] ?? `Player ${playerId}`),
      ...side.Sends.Picks.map((pick) => `${pickLabel(pick)} pick`),
    ].join(", ");
  const list = trades.data?.Trades ?? [];

  return (
    <div className="space-y-2">
      {picker}
      <VbPanel>
        <VbLoad loading={trades.loading} error={trades.error} rows={8}>
          <table data-keep-table className={`${vbTableClass} min-w-[820px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={vbCell}>When</th>
                <th className={vbCell}>Club</th>
                <th className={vbCell}>Sent</th>
                <th className={vbCell}>Club</th>
                <th className={vbCell}>Sent</th>
              </tr>
            </thead>
            <tbody>
              {list.map((trade) => (
                <tr key={trade.TradeID} className={vbRowClass}>
                  <td className={vbCell}>
                    {vbPhaseLabel(trade.Phase)}
                    {trade.Week ? `, week ${trade.Week}` : ""}
                  </td>
                  <td className={vbCell}>
                    <VbTeamLink
                      kind="pro"
                      teamId={trade.ClubA.ClubID}
                      name={trade.ClubA.Name}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-left">{sends(trade.ClubA)}</td>
                  <td className={vbCell}>
                    <VbTeamLink
                      kind="pro"
                      teamId={trade.ClubB.ClubID}
                      name={trade.ClubB.Name}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-left">{sends(trade.ClubB)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && <VbEmpty>No trades on record for {season}.</VbEmpty>}
        </VbLoad>
      </VbPanel>
    </div>
  );
};

const MAX_TRADE_PLAYERS = 3;

/** Up to three players of one roster, ticked from a list. */
const TradePlayers: FC<{
  heading: string;
  players: VbProRoster["Players"] | undefined;
  empty: string;
  picked: number[];
  onChange: (picked: number[]) => void;
}> = ({ heading, players, empty, picked, onChange }) => (
  <div>
    <div className="mb-1 font-semibold">
      {heading}
      <span className="ml-2 font-normal text-(--text-muted)">
        {picked.length} of {MAX_TRADE_PLAYERS}
      </span>
    </div>
    <div className="max-h-64 overflow-y-auto rounded-lg bg-(--sport-surface-2)">
      {players?.length ? (
        players.map((player) => {
          const included = picked.includes(player.PlayerID);
          return (
            <label
              key={player.PlayerID}
              className="flex items-center gap-2 border-b border-(--sport-divider) px-2 py-1"
            >
              <input
                type="checkbox"
                checked={included}
                disabled={!included && picked.length >= MAX_TRADE_PLAYERS}
                onChange={() =>
                  onChange(
                    included
                      ? picked.filter((item) => item !== player.PlayerID)
                      : [...picked, player.PlayerID],
                  )
                }
              />
              <span className="w-9 text-(--text-muted)">
                {player.Position ?? ""}
              </span>
              <span className="flex-1 truncate">{player.Name}</span>
              <VbGrade value={player.AbilityGrades?.Overall} />
              <span className="tabular-nums text-(--text-muted)">
                {vbMoney(player.Salary)} thru {player.ContractThrough || "—"}
              </span>
            </label>
          );
        })
      ) : (
        <div className="p-3 text-(--text-muted)">{empty}</div>
      )}
    </div>
  </div>
);

interface DeskProps {
  club: VbTeam;
}

const TradeDesk: FC<DeskProps> = ({ club }) => {
  const id = club.TeamID;
  const teams = useVbTeams("pro");
  const offers = useVbManaged(`manage-trade-offers:${id}`, () =>
    VolleyballProService.getTradeOffers(id),
  );
  const picks = useVbResource(`manage-picks:${id}`, () =>
    VolleyballProService.getPicks(id),
  );
  const ownRoster = useVbResource(`pro-roster:${id}`, () =>
    VolleyballService.getProRoster(id),
  );
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const partnerRoster = useVbResource(
    partnerId ? `pro-roster:${partnerId}` : null,
    () => VolleyballService.getProRoster(partnerId!),
  );
  const [giveIds, setGiveIds] = useState<number[]>([]);
  const [getIds, setGetIds] = useState<number[]>([]);
  const [givePicks, setGivePicks] = useState<number[]>([]);
  const [getPicks, setGetPicks] = useState<number[]>([]);
  const partnerPicks = useVbResource(
    partnerId ? `club-picks:${partnerId}` : null,
    () => VolleyballProService.getClubPicks(partnerId!),
  );
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<{ good: boolean; text: string } | null>(
    null,
  );
  const partners = useMemo(
    () =>
      [...(teams ?? [])]
        .filter((team) => team.TeamID !== id)
        .sort((a, b) => a.Name.localeCompare(b.Name))
        .map((team) => ({ value: String(team.TeamID), label: team.Name })),
    [teams, id],
  );

  const reloadOffers = async () =>
    offers.store(await VolleyballProService.getTradeOffers(id));
  const propose = async () => {
    if (!partnerId || giveIds.length + getIds.length === 0) return;
    setBusy(true);
    setAnswer(null);
    try {
      const result = await VolleyballProService.proposeTrade(id, {
        PartnerID: partnerId,
        GivePlayerIDs: giveIds,
        GetPlayerIDs: getIds,
        GivePickIDs: givePicks,
        GetPickIDs: getPicks,
      });
      setAnswer(
        result.Accepted
          ? { good: true, text: "They accepted. The trade is done." }
          : result.PendingOfferID
            ? {
                good: true,
                text: "Offer sent. Their coach has to answer it.",
              }
            : {
                good: false,
                text: `They turned it down${result.Reason ? `: ${result.Reason}` : "."}`,
              },
      );
      setGiveIds([]);
      setGetIds([]);
      setGivePicks([]);
      setGetPicks([]);
      await reloadOffers();
    } catch (reason) {
      setAnswer({ good: false, text: vbErrorText(reason) });
    } finally {
      setBusy(false);
    }
  };
  const respond = async (
    offer: VbTradeOffer,
    action: "accept" | "reject" | "withdraw",
  ) => {
    setBusy(true);
    try {
      const result = await VolleyballProService.answerTradeOffer(
        id,
        offer.OfferID,
        action,
      );
      enqueueSnackbar(
        `Offer ${vbLabel(result.Status).toLowerCase()}${result.Reason ? `: ${result.Reason}` : "."}`,
        { variant: result.Status === "void" ? "warning" : "success" },
      );
      await reloadOffers();
    } catch (reason) {
      enqueueSnackbar(vbErrorText(reason), { variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <VbPanel title="Propose a trade">
        <div className="space-y-3 p-3 text-left text-sm">
          <div className="text-(--text-muted)">
            Up to three players and four draft picks each way, with at least
            one player in the deal. Both clubs must still fill every role and
            stay within payroll, and an uneven swap must leave both rosters
            between 12 and 16.
            An AI club answers at once; a club with a human coach gets an offer
            to answer.
          </div>
          <div className="w-full sm:w-72">
            <SportSelect
              options={partners}
              value={
                partners.find((option) => option.value === String(partnerId)) ??
                null
              }
              placeholder="Trade with..."
              onChange={(option) => {
                if (!option) return;
                setPartnerId(Number(option.value));
                setGetIds([]);
                setGetPicks([]);
              }}
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <TradePlayers
              heading="You give"
              players={ownRoster.data?.Players}
              empty="Your roster is loading."
              picked={giveIds}
              onChange={setGiveIds}
            />
            <TradePlayers
              heading="You get"
              players={partnerId ? partnerRoster.data?.Players : undefined}
              empty={partnerId ? "Their roster is loading." : "Pick a club first."}
              picked={getIds}
              onChange={setGetIds}
            />
          </div>
          {(picks.data?.Picks.length ?? 0) > 0 && (
            <div>
              <div className="mb-1 font-semibold">Add your picks</div>
              <div className="flex flex-wrap gap-3">
                {picks.data!.Picks.map((pick) => {
                  const included = givePicks.includes(pick.PickID);
                  return (
                    <label key={pick.PickID} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={included}
                        disabled={!included && givePicks.length >= 4}
                        onChange={() =>
                          setGivePicks(
                            included
                              ? givePicks.filter((item) => item !== pick.PickID)
                              : [...givePicks, pick.PickID],
                          )
                        }
                      />
                      {heldPickLabel(pick, id)}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          {partnerId !== null && (partnerPicks.data?.Picks.length ?? 0) > 0 && (
            <div>
              <div className="mb-1 font-semibold">Ask for their picks</div>
              <div className="flex flex-wrap gap-3">
                {partnerPicks.data!.Picks.map((pick) => {
                  const included = getPicks.includes(pick.PickID);
                  return (
                    <label key={pick.PickID} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={included}
                        disabled={!included && getPicks.length >= 4}
                        onChange={() =>
                          setGetPicks(
                            included
                              ? getPicks.filter((item) => item !== pick.PickID)
                              : [...getPicks, pick.PickID],
                          )
                        }
                      />
                      {heldPickLabel(pick, partnerId)}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <SportButton
              size="sm"
              disabled={busy || !partnerId || giveIds.length + getIds.length === 0}
              onClick={propose}
            >
              {busy ? "Sending..." : "Propose trade"}
            </SportButton>
            {answer && (
              <span
                className={
                  answer.good ? "text-(--accent-success)" : "text-(--accent-error)"
                }
              >
                {answer.text}
              </span>
            )}
          </div>
        </div>
      </VbPanel>

      <VbPanel title="Your offers">
        <VbLoad loading={offers.loading} error={offers.error} rows={3}>
          {offers.data?.Offers.length ? (
            <table data-keep-table className={`${vbTableClass} min-w-[900px]`}>
              <thead className={vbHeadClass}>
                <tr>
                  <th className={vbCell}>With</th>
                  <th className={vbCell}>You give</th>
                  <th className={vbCell}>You get</th>
                  <th className={vbCell}>Status</th>
                  <th className={vbCell}>Sent</th>
                  <th className={vbCell} />
                </tr>
              </thead>
              <tbody>
                {offers.data.Offers.map((offer) => {
                  // Give and Get are stored from the sender's side; turn them
                  // round for an offer the coach received.
                  const sent = offer.Direction === "sent";
                  const other = sent ? offer.ToClubID : offer.FromClubID;
                  const otherName = sent ? offer.ToClubName : offer.FromClubName;
                  const give = {
                    players:
                      offer.GivePlayers ??
                      (offer.GivePlayerID === null
                        ? []
                        : [
                            {
                              PlayerID: offer.GivePlayerID,
                              Name: offer.GivePlayerName ?? null,
                            },
                          ]),
                    picks: offer.GivePicks,
                    pickIds: offer.GivePickIDs,
                  };
                  const get = {
                    players:
                      offer.GetPlayers ??
                      (offer.GetPlayerID === null
                        ? []
                        : [
                            {
                              PlayerID: offer.GetPlayerID,
                              Name: offer.GetPlayerName ?? null,
                            },
                          ]),
                    picks: offer.GetPicks,
                    pickIds: offer.GetPickIDs,
                  };
                  const mine = sent ? give : get;
                  const theirs = sent ? get : give;
                  return (
                    <tr key={offer.OfferID} className={vbRowClass}>
                      <td className={vbCell}>
                        <div className="flex items-center gap-2">
                          <span className="text-(--text-muted)">
                            {sent ? "to" : "from"}
                          </span>
                          {otherName ? (
                            <VbTeamLink
                              kind="pro"
                              teamId={other}
                              name={otherName}
                            />
                          ) : (
                            <ClubName clubId={other} />
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-left">
                        <OfferSide clubId={id} {...mine} />
                      </td>
                      <td className="px-2 py-1.5 text-left">
                        <OfferSide clubId={other} {...theirs} />
                      </td>
                      <td className={vbCell}>
                        {vbLabel(offer.Status)}
                        {offer.Note ? `: ${offer.Note}` : ""}
                      </td>
                      <td className={vbCell}>
                        {new Date(offer.CreatedAt).toLocaleDateString()}
                      </td>
                      <td className={`${vbCell} text-right`}>
                        {offer.Status === "pending" && (
                          <div className="inline-flex gap-1">
                            {sent ? (
                              <SportButton
                                size="xs"
                                variant="secondary"
                                disabled={busy}
                                onClick={() => respond(offer, "withdraw")}
                              >
                                Withdraw
                              </SportButton>
                            ) : (
                              <>
                                <SportButton
                                  size="xs"
                                  variant="success"
                                  disabled={busy}
                                  onClick={() => respond(offer, "accept")}
                                >
                                  Accept
                                </SportButton>
                                <SportButton
                                  size="xs"
                                  variant="danger"
                                  disabled={busy}
                                  onClick={() => respond(offer, "reject")}
                                >
                                  Reject
                                </SportButton>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <VbEmpty>You have no trade offers.</VbEmpty>
          )}
        </VbLoad>
      </VbPanel>
    </div>
  );
};

type TradesTab = "desk" | "log";

const TradesBody: FC = () => {
  const { pvbTeam } = useSimVBStore();
  useVbTeams("pro");
  const tabs: Array<readonly [TradesTab, string]> = [
    ["desk", "Your trades"],
    ["log", "League trades"],
  ];
  const [shown, setTab] = useSportSectionTab(tabs, "desk");
  if (!pvbTeam) return <TradeLog />;
  return (
    <div className="space-y-2">
      <SportBannerSections tabs={tabs} value={shown} onChange={setTab} />
      <div className={shown === "desk" ? "" : "hidden"}>
        <TradeDesk club={pvbTeam} />
      </div>
      {shown === "log" && <TradeLog />}
    </div>
  );
};

export const VolleyballTradesPage: FC = () => (
  <VbPageShell kind="pro" title="Trades">
    {() => <TradesBody />}
  </VbPageShell>
);

const MAX_BOARD = 120;

type Prospect = VbDraftBoard["Prospects"][number];
type ProspectKey =
  | "name"
  | "position"
  | "college"
  | "age"
  | "height"
  | "sets"
  | "kills"
  | "assists"
  | "aces"
  | "digs"
  | "blocks"
  | "points"
  | "overall";

const prospectValue = (prospect: Prospect, key: ProspectKey) => {
  const last = prospect.LastSeason;
  switch (key) {
    case "name":
      return prospect.Name;
    case "position":
      return prospect.Position;
    case "college":
      return prospect.College;
    case "age":
      return prospect.Age;
    case "height":
      return prospect.HeightCm;
    case "sets":
      return last?.Sets ?? null;
    case "kills":
      return last?.Kills ?? null;
    case "assists":
      return last?.Assists ?? null;
    case "aces":
      return last?.Aces ?? null;
    case "digs":
      return last?.Digs ?? null;
    case "blocks":
      return last?.Blocks ?? null;
    case "points":
      return last?.Points ?? null;
    case "overall":
      return vbGradeRank(prospect.AbilityGrades?.Overall);
  }
};

const prospectStats: Array<[ProspectKey, string, string]> = [
  ["sets", "S", "Sets played last season"],
  ["kills", "K", "Kills last season"],
  ["assists", "A", "Assists last season"],
  ["aces", "SA", "Aces last season"],
  ["digs", "DIG", "Digs last season"],
  ["blocks", "BLK", "Blocks last season"],
  ["points", "PTS", "Points last season"],
];

// A club's own ranking of the coming draft class. At the club's pick the draft
// takes its highest-ranked player still available.
const DraftBoard: FC<{ club: VbTeam }> = ({ club }) => {
  const id = club.TeamID;
  const navigate = useNavigate();
  const view = useVbManaged(`manage-draft-board:${id}`, () =>
    VolleyballProService.getDraftBoard(id),
  );
  const [draft, setDraft] = useState<number[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [position, setPosition] = useState("");
  const [search, setSearch] = useState("");
  const prospects = view.data?.Prospects ?? [];
  const needle = search.trim().toLowerCase();
  const sort = useVbSort<Prospect, ProspectKey>(
    prospects.filter(
      (prospect) =>
        (!position || prospect.Position === position) &&
        (!needle ||
          prospect.Name.toLowerCase().includes(needle) ||
          prospect.College.toLowerCase().includes(needle)),
    ),
    prospectValue,
    "points",
    "desc",
  );
  if (!view.data) {
    return <VbLoad loading={view.loading} error={view.error} children={null} />;
  }
  const saved = view.data;
  const byId = new Map(prospects.map((prospect) => [prospect.PlayerID, prospect]));
  // Anyone who has left the class cannot be ranked, so she is dropped from
  // what gets saved.
  const savedBoard = saved.Board.filter((row) => row.InClass).map(
    (row) => row.PlayerID,
  );
  const gone = saved.Board.filter((row) => !row.InClass);
  const board = draft ?? savedBoard;
  const rankOf = new Map(board.map((playerId, index) => [playerId, index + 1]));
  const change = (next: number[]) => {
    setDraft(next);
    setErrors([]);
  };
  const move = (index: number, to: number) => {
    if (to < 0 || to >= board.length) return;
    const next = [...board];
    const [player] = next.splice(index, 1);
    next.splice(to, 0, player);
    change(next);
  };
  const save = async () => {
    setSaving(true);
    try {
      view.store(await VolleyballProService.saveDraftBoard(id, board));
      setDraft(null);
      setErrors([]);
      enqueueSnackbar("Draft board saved.", { variant: "success" });
    } catch (reason) {
      setErrors(vbErrorLines(reason));
    } finally {
      setSaving(false);
    }
  };
  const positions = [
    ...new Set(prospects.map((prospect) => prospect.Position).filter(Boolean)),
  ].sort() as string[];
  const playerLink = (playerId: number, name: string) => (
    <VbPlayerLink playerId={playerId} name={name} />
  );

  return (
    <div className="space-y-3">
      <VbPanel title={`Your draft board · ${saved.Season} draft`}>
        <div className="space-y-2 p-3 text-left text-sm">
          <div className="text-(--text-muted)">
            Rank the players you want, best first. At each of your picks the
            draft takes the highest one still available; if none is left, or
            the board is empty, your staff picks. The draft runs with
            graduation at the end of the season, so set this before then.
          </div>
          {gone.length > 0 && (
            <div className="text-(--accent-warning)">
              No longer in the class, and dropped when you next save:{" "}
              {gone.map((row) => row.Name ?? `Player ${row.PlayerID}`).join(", ")}
            </div>
          )}
          {board.length ? (
            <ol className="max-h-96 overflow-y-auto rounded-lg bg-(--sport-surface-2)">
              {board.map((playerId, index) => {
                const prospect = byId.get(playerId);
                return (
                  <li
                    key={playerId}
                    className="flex items-center gap-2 border-b border-(--sport-divider) px-2 py-1"
                  >
                    <span className="w-7 text-right tabular-nums text-(--text-muted)">
                      {index + 1}
                    </span>
                    <span className="w-9 text-(--text-muted)">
                      {prospect?.Position ?? ""}
                    </span>
                    <span className="flex-1 truncate">
                      {playerLink(playerId, prospect?.Name ?? `Player ${playerId}`)}
                      <span className="text-(--text-muted)">
                        {prospect ? ` · ${prospect.College}` : ""}
                      </span>
                    </span>
                    <SportButton
                      size="xs"
                      variant="secondary"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑
                    </SportButton>
                    <SportButton
                      size="xs"
                      variant="secondary"
                      aria-label="Move down"
                      disabled={index === board.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓
                    </SportButton>
                    <SportButton
                      size="xs"
                      variant="secondary"
                      aria-label="Move to the top"
                      disabled={index === 0}
                      onClick={() => move(index, 0)}
                    >
                      Top
                    </SportButton>
                    <SportButton
                      size="xs"
                      variant="danger"
                      aria-label="Remove from the board"
                      onClick={() =>
                        change(board.filter((item) => item !== playerId))
                      }
                    >
                      ✕
                    </SportButton>
                  </li>
                );
              })}
            </ol>
          ) : (
            <VbEmpty>
              Your board is empty, so your staff will make your picks. Add
              players from the class below.
            </VbEmpty>
          )}
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
      </VbPanel>

      <VbPanel title={`The ${saved.Season} draft class`}>
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
          <select
            className={vbFieldClass}
            aria-label="Position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            <option value="">Every position</option>
            {positions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            type="search"
            className={`${vbFieldClass} w-full sm:w-56`}
            placeholder="Filter by name or college"
            aria-label="Filter by name or college"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="text-(--text-muted)">
            {sort.sorted.length} of {prospects.length} players
          </span>
        </div>
        <table data-keep-table className={`${vbTableClass} min-w-[1320px]`}>
          <thead className={vbHeadClass}>
            <tr>
              <th className={`${vbGroupHead} border-l-0`} colSpan={6}>
                PROSPECT
              </th>
              <th className={vbGroupHead} colSpan={1 + vbFamilies.length}>
                ABILITY
              </th>
              <th className={vbGroupHead} colSpan={prospectStats.length}>
                LAST SEASON
              </th>
            </tr>
            <tr>
              <th className={vbCell} />
              <VbSortHeader label="Player" column="name" sort={sort} />
              <VbSortHeader label="Pos" column="position" sort={sort} />
              <VbSortHeader label="College" column="college" sort={sort} />
              <VbSortHeader label="Age" column="age" sort={sort} numeric />
              <VbSortHeader label="Ht" column="height" sort={sort} numeric title="Height" />
              <VbSortHeader label="Ovr" column="overall" sort={sort} numeric title="Overall at her position: the public read" />
              {vbFamilies.map(([key, short, label]) => (
                <th key={key} className={`${vbCell} text-right`} title={label}>
                  {short}
                </th>
              ))}
              {prospectStats.map(([key, label, title]) => (
                <VbSortHeader
                  key={key}
                  label={label}
                  column={key}
                  sort={sort}
                  title={title}
                  numeric
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((prospect) => {
              const rank = rankOf.get(prospect.PlayerID);
              return (
                <tr key={prospect.PlayerID} className={vbRowClass}>
                  <td className={vbCell}>
                    {rank ? (
                      <span className="tabular-nums text-(--text-muted)">
                        #{rank}
                      </span>
                    ) : (
                      <SportButton
                        size="xs"
                        disabled={board.length >= MAX_BOARD}
                        onClick={() => change([...board, prospect.PlayerID])}
                      >
                        Add
                      </SportButton>
                    )}
                  </td>
                  <td className={vbCell}>
                    {playerLink(prospect.PlayerID, prospect.Name)}
                  </td>
                  <td className={vbCell}>{prospect.Position ?? "—"}</td>
                  <td className={vbCell}>
                    <VbTeamLink
                      kind="college"
                      teamId={prospect.CollegeTeamID}
                      name={prospect.College}
                    />
                  </td>
                  <td className={vbNum}>{prospect.Age ?? "—"}</td>
                  <td className={vbNum}>
                    {prospect.HeightCm ? vbHeight(prospect.HeightCm) : "—"}
                  </td>
                  <td className={`${vbNum} font-semibold`}>
                    <VbGrade value={prospect.AbilityGrades?.Overall} />
                  </td>
                  {vbFamilies.map(([key]) => (
                    <td key={key} className={vbNum}>
                      <VbGrade value={prospect.AbilityGrades?.Families?.[key]} />
                    </td>
                  ))}
                  {prospectStats.map(([key]) => (
                    <td key={key} className={vbNum}>
                      {prospectValue(prospect, key) ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!prospects.length && (
          <VbEmpty>The coming draft class has not been set yet.</VbEmpty>
        )}
        <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
          College players in their final season of eligibility, with last
          season's statistics. Grades are the public read on each player,
          the same for every club, and can be a step off. A board holds up to {MAX_BOARD} players.
        </div>
      </VbPanel>
    </div>
  );
};

const DraftBody: FC = () => {
  const leagueId = useCollegeLeagueId();
  const { pvbTeam } = useSimVBStore();
  useVbTeams("pro");
  useVbTeams("college");
  const { season, picker } = useSeasonPicker();
  const draft = useVbResource(
    leagueId && season ? `pro-draft:${season}` : null,
    () => VolleyballProService.getDraft(leagueId!, season!),
  );
  const ownPicks = useVbResource(
    pvbTeam ? `manage-picks:${pvbTeam.TeamID}` : null,
    () => VolleyballProService.getPicks(pvbTeam!.TeamID),
  );
  const picks = draft.data?.Picks ?? [];

  return (
    <div className="space-y-3">
      {pvbTeam && (
        <VbPanel title="Your picks">
          <VbLoad loading={ownPicks.loading} error={ownPicks.error} rows={2}>
            <div className="px-3 py-2 text-left text-sm">
              {ownPicks.data?.Picks.length
                ? ownPicks.data.Picks.map((pick) => (
                    <span key={pick.PickID} className="mr-4 inline-block">
                      {heldPickLabel(pick, pvbTeam.TeamID)}
                    </span>
                  ))
                : "You hold no unused picks for this draft or the next."}
            </div>
          </VbLoad>
        </VbPanel>
      )}
      {pvbTeam && <DraftBoard key={pvbTeam.TeamID} club={pvbTeam} />}
      {picker}
      <VbPanel title={`Draft results · ${season ?? ""}`}>
        <VbLoad loading={draft.loading} error={draft.error} rows={12}>
          <table data-keep-table className={`${vbTableClass} min-w-[720px]`}>
            <thead className={vbHeadClass}>
              <tr>
                <th className={`${vbCell} text-right`}>Pick</th>
                <th className={`${vbCell} text-right`}>Round</th>
                <th className={vbCell}>Club</th>
                <th className={vbCell}>Player</th>
                <th className={vbCell}>College</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick) => (
                <tr key={pick.Pick} className={vbRowClass}>
                  <td className={vbNum}>{pick.Pick}</td>
                  <td className={vbNum}>{pick.Round}</td>
                  <td className={vbCell}>
                    <VbTeamLink kind="pro" teamId={pick.ClubID} name={pick.Club} />
                  </td>
                  <td className={`${vbCell} font-semibold`}>
                    {pick.Name ?? "—"}
                  </td>
                  <td className={vbCell}>
                    {pick.CollegeTeamID && pick.College ? (
                      <VbTeamLink
                        kind="college"
                        teamId={pick.CollegeTeamID}
                        name={pick.College}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!picks.length && (
            <VbEmpty>The {season} draft has not been held yet.</VbEmpty>
          )}
          <div className="px-3 py-2 text-left text-xs text-(--text-muted)">
            The draft runs by itself in the offseason; there is no draft room
            and no draft board to set.
          </div>
        </VbLoad>
      </VbPanel>
    </div>
  );
};

export const VolleyballDraftPage: FC = () => (
  <VbPageShell kind="pro" title="Draft">
    {() => <DraftBody />}
  </VbPageShell>
);
