import React, { useEffect, useState } from "react";
import {
  BaseballDraftPick,
  DraftPhase,
  DRAFT_CLASS_LABELS,
  DRAFT_MAX_OFFERS,
  estimateDraftAcceptance,
  formatSlotValue,
  SignPickResponse,
} from "../../../models/baseball/baseballDraftModels";
import { BaseballService } from "../../../_services/baseballService";
import { CurrencyInput } from "../../Team/baseball/FreeAgency/CurrencyInput";
import "../../Team/baseball/baseballMobile.css";

interface BaseballPickSigningProps {
  orgPicks: BaseballDraftPick[];
  phase: DraftPhase;
  orgId: number | null;
  leagueYearId: number | null;
  onSignPick: (pickId: number, bonus: number) => Promise<SignPickResponse | null>;
  onPassPick: (pickId: number) => Promise<void>;
  onRefresh: () => void;
  userOrgAbbrev: string;
}

const money = (n: number | null | undefined) =>
  n == null ? "—" : `$${Math.round(n).toLocaleString()}`;

const pct = (p: number) => `${Math.round(p * 100)}%`;

/** Final states, in words (not just a color). */
const FINAL_STATUS: Record<string, { text: string; className: string }> = {
  signed: { text: "✓ Signed", className: "text-green-400" },
  passed: { text: "Passed: pick given up", className: "text-gray-400" },
  refused: { text: "✗ Refused, returned to school", className: "text-red-400" },
};

const ClassBadge: React.FC<{ classYear: BaseballDraftPick["class_year"] }> = ({ classYear }) => {
  if (!classYear) return null;
  const info = DRAFT_CLASS_LABELS[classYear];
  if (!info) return null;
  return (
    <span
      className="ml-2 rounded-sm bg-gray-700 px-1.5 py-0.5 text-[11px] font-semibold text-gray-200"
      title={info.long}
    >
      {info.short}
    </span>
  );
};

interface RowProps {
  pick: BaseballDraftPick;
  canAct: boolean;
  budget: number | null;
  onSignPick: BaseballPickSigningProps["onSignPick"];
  onPassPick: BaseballPickSigningProps["onPassPick"];
  onBudgetChanged: () => void;
}

const PickNegotiation: React.FC<RowProps> = ({
  pick,
  canAct,
  budget,
  onSignPick,
  onPassPick,
  onBudgetChanged,
}) => {
  const ask = pick.ask_bonus ?? null;
  const offers = pick.offers ?? [];
  const offersMade = pick.offers_made ?? offers.length;
  const offersLeft = pick.offers_remaining ?? Math.max(DRAFT_MAX_OFFERS - offersMade, 0);
  const status = pick.sign_status ?? "pending";
  const isPending = status === "pending";

  // Default offer: the slot value (the server's default), or the best offer he
  // already turned down if that was higher. Never suggest less than a rejection.
  const bestRejected = offers.reduce((m, o) => Math.max(m, o.amount), 0);
  const defaultAmount = Math.max(pick.slot_value, bestRejected);
  const [amount, setAmount] = useState(defaultAmount);
  const [busy, setBusy] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [result, setResult] = useState<{ tone: "good" | "bad" | "info"; text: string } | null>(null);

  useEffect(() => {
    setAmount(defaultAmount);
  }, [pick.pick_id, defaultAmount]);

  const estimate = ask ? estimateDraftAcceptance(amount, ask, pick.class_year) : null;
  const overBudget = budget != null && amount > budget;
  const isLastOffer = offersLeft === 1;

  const makeOffer = async () => {
    setBusy(true);
    setResult(null);
    try {
      const res = await onSignPick(pick.pick_id, amount);
      if (!res) return;
      if (res.accepted) {
        setResult({
          tone: "good",
          text: `He accepted ${money(res.offer)}. Signed for ${res.years ?? 3} years.`,
        });
        onBudgetChanged();
      } else if (res.status === "refused") {
        setResult({
          tone: "bad",
          text: `He turned down ${money(res.offer)}, his last chance. He refused and returned to school; the pick is spent.`,
        });
      } else {
        setResult({
          tone: "bad",
          text: `He turned down ${money(res.offer)} (${pct(res.accept_probability)} chance). ${res.offers_remaining} offer${res.offers_remaining === 1 ? "" : "s"} left.`,
        });
      }
    } catch (err: any) {
      setResult({ tone: "bad", text: err?.message || "Offer failed" });
    } finally {
      setBusy(false);
    }
  };

  const pass = async () => {
    if (!confirmPass) {
      setConfirmPass(true);
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      await onPassPick(pick.pick_id);
      setResult({ tone: "info", text: "You passed on this pick." });
    } catch (err: any) {
      setResult({ tone: "bad", text: err?.message || "Pass failed" });
      setConfirmPass(false);
    } finally {
      setBusy(false);
    }
  };

  const final = FINAL_STATUS[status];

  return (
    <div className="rounded-sm border border-gray-700 bg-gray-800 p-4">
      {/* Header: who, where, what he wants */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-base font-semibold">
          {pick.player_name}
          <ClassBadge classYear={pick.class_year} />
          <span className="ml-2 text-xs font-normal text-gray-400">
            Rd {pick.round}, Pick {pick.pick_in_round}
          </span>
        </div>
        {final ? (
          <span className={`text-sm font-semibold ${final.className}`}>
            {final.text}
            {status === "signed" && pick.bonus_agreed != null && ` · ${money(pick.bonus_agreed)}`}
          </span>
        ) : (
          <span className="text-sm text-gray-300">
            {offersLeft} of {DRAFT_MAX_OFFERS} offers left
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-300">
        <span>Slot value: <strong className="text-white tabular-nums">{money(pick.slot_value)}</strong></span>
        <span>His ask: <strong className="text-white tabular-nums">{money(ask)}</strong></span>
      </div>

      {/* Offer history */}
      {offers.length > 0 && (
        <ol className="mt-2 flex flex-wrap gap-2 text-xs" aria-label="Offers made">
          {offers.map((o) => (
            <li
              key={o.offer_no}
              className={`rounded-sm px-2 py-0.5 ${o.result === "accepted" ? "bg-green-900/50 text-green-300" : "bg-red-900/40 text-red-300"}`}
            >
              Offer {o.offer_no}: <span className="tabular-nums">{money(o.amount)}</span>{" "}
              {o.result === "accepted" ? "✓ accepted" : "✗ rejected"}
            </li>
          ))}
        </ol>
      )}

      {/* Negotiation form */}
      {isPending && canAct && offersLeft > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48">
              <CurrencyInput label="Your offer (signing bonus)" value={amount} onChange={setAmount} />
            </div>
            <div className="flex gap-2">
              {ask != null && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.ceil(ask))}
                  className="rounded-sm bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
                  title="An offer at or above his ask is always accepted"
                >
                  Match ask
                </button>
              )}
              <button
                type="button"
                onClick={makeOffer}
                disabled={busy || amount <= 0 || overBudget}
                className="rounded-sm bg-green-600 px-3 py-1 text-sm font-medium hover:bg-green-500 disabled:opacity-50"
              >
                {busy ? "..." : `Offer ${formatSlotValue(amount)}`}
              </button>
              <button
                type="button"
                onClick={pass}
                disabled={busy}
                className="rounded-sm bg-gray-600 px-3 py-1 text-sm font-medium hover:bg-gray-500 disabled:opacity-50"
              >
                {confirmPass ? "Confirm pass" : "Pass"}
              </button>
            </div>
          </div>
          {estimate != null && (
            <p className="text-xs text-gray-400">
              {estimate >= 1
                ? "At or above his ask: he will accept."
                : `Estimated chance he accepts: ${pct(estimate)}.`}
              {pick.class_year && pick.class_year !== "senior" && pick.class_year !== "hs_senior" && estimate < 1 &&
                " Underclassmen would rather go back to school, so they take less below their ask."}
            </p>
          )}
          {overBudget && (
            <p className="text-xs text-red-400">
              Over your signing budget of {money(budget)}.
            </p>
          )}
          {isLastOffer && (
            <p className="text-xs font-semibold text-amber-400">
              Last offer: if he says no, he refuses and returns to school, and the pick is spent.
            </p>
          )}
          {confirmPass && (
            <p className="text-xs text-amber-400">
              Passing gives up the pick for good. Click "Confirm pass" to go ahead.
            </p>
          )}
        </div>
      )}

      {result && (
        <p
          className={`mt-2 text-sm ${result.tone === "good" ? "text-green-400" : result.tone === "bad" ? "text-red-400" : "text-gray-300"}`}
          role="status"
        >
          {result.text}
        </p>
      )}
    </div>
  );
};

const BaseballPickSigning: React.FC<BaseballPickSigningProps> = ({
  orgPicks,
  phase,
  orgId,
  leagueYearId,
  onSignPick,
  onPassPick,
  onRefresh,
  userOrgAbbrev,
}) => {
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetKey, setBudgetKey] = useState(0);

  useEffect(() => {
    if (!orgId || !leagueYearId) return;
    BaseballService.GetFASigningBudget(orgId, leagueYearId)
      .then((res) => setBudget(res.available_budget))
      .catch(() => setBudget(null));
  }, [orgId, leagueYearId, budgetKey]);

  const canAct = phase === "SIGNING";
  const picksWithPlayers = orgPicks.filter((p) => p.player_id != null);
  const pending = picksWithPlayers.filter((p) => (p.sign_status ?? "pending") === "pending");
  const signed = picksWithPlayers.filter((p) => p.sign_status === "signed");
  const askTotal = pending.reduce((sum, p) => sum + (p.ask_bonus ?? 0), 0);
  const signedTotal = signed.reduce((sum, p) => sum + (p.bonus_agreed ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-gray-900 p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Pick Signing — {userOrgAbbrev}</h2>
        <button
          onClick={() => {
            onRefresh();
            setBudgetKey((k) => k + 1);
          }}
          className="rounded-sm bg-gray-700 px-3 py-1.5 text-sm hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* How it works */}
      <p className="text-sm text-gray-300">
        Each drafted player has a bonus ask. You get up to {DRAFT_MAX_OFFERS} offers per pick, and
        each is answered right away. An offer at or above his ask is always accepted; below it
        he may say no. If he turns down all {DRAFT_MAX_OFFERS}, he refuses and returns to school,
        and the pick is spent.
        {!canAct && " Signing is closed: the draft is complete."}
      </p>

      {/* Budget Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-sm border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Signing budget</p>
          <p className="text-lg font-bold text-white tabular-nums">{money(budget)}</p>
        </div>
        <div className="rounded-sm border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Still to sign ({pending.length}): total ask</p>
          <p className="text-lg font-bold text-blue-400 tabular-nums">{money(askTotal)}</p>
        </div>
        <div className="rounded-sm border border-gray-700 bg-gray-800 p-4 text-center">
          <p className="text-xs text-gray-400">Signed ({signed.length}): bonuses</p>
          <p className="text-lg font-bold text-green-400 tabular-nums">{money(signedTotal)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {picksWithPlayers.length === 0 && (
          <p className="text-center text-gray-500">No drafted players to sign.</p>
        )}
        {picksWithPlayers.map((p) => (
          <PickNegotiation
            key={p.pick_id}
            pick={p}
            canAct={canAct}
            budget={budget}
            onSignPick={onSignPick}
            onPassPick={onPassPick}
            onBudgetChanged={() => setBudgetKey((k) => k + 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default BaseballPickSigning;
