import React, { useMemo, useState } from "react";
import { SimCFB, SimNFL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGroup } from "../../_design/Buttons";
import { Input, ToggleSwitch } from "../../_design/Inputs";
import { Modal } from "../../_design/Modal";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { DraftService } from "../../_services/draftService";
import { NFLDraftPick } from "../../models/footballModels";

export const AdminDraftTab = () => {
  const { selectedLeague } = useLeagueStore();
  const {
    cfb_Timestamp,
    setCFB_Timestamp,
    nflTeams,
    nflDraftPicks,
    setNFLDraftPicks,
  } = useSimFBAStore();

  const isNFL = selectedLeague === SimNFL;
  const isCFB = selectedLeague === SimCFB;

  // -------------------------------------------------------------
  // SIMNFL: Compensatory Pick Modal State
  // -------------------------------------------------------------
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compTeamID, setCompTeamID] = useState<number>(0);
  const [compYear, setCompYear] = useState<number>(
    cfb_Timestamp?.Season ?? 2028,
  );
  const [compRound, setCompRound] = useState<number>(3);
  const [compPickNumber, setCompPickNumber] = useState<number>(33);
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [compMessage, setCompMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // -------------------------------------------------------------
  // SIMNFL: Forfeit Pick Modal State
  // -------------------------------------------------------------
  const [isForfeitModalOpen, setIsForfeitModalOpen] = useState(false);
  const [forfeitTeamID, setForfeitTeamID] = useState<number>(0);
  const [forfeitPickID, setForfeitPickID] = useState<number>(0);
  const [forfeitReason, setForfeitReason] = useState<string>("");
  const [isSubmittingForfeit, setIsSubmittingForfeit] = useState(false);
  const [forfeitMessage, setForfeitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // -------------------------------------------------------------
  // SIMNFL: Combine Runner State
  // -------------------------------------------------------------
  const [combineIDsText, setCombineIDsText] = useState<string>("");
  const [isRunningCombine, setIsRunningCombine] = useState(false);
  const [combineMessage, setCombineMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // -------------------------------------------------------------
  // SIMCFB: Pro Day State
  // -------------------------------------------------------------
  const [isTogglingNominations, setIsTogglingNominations] = useState(false);
  const [isRunningProDays, setIsRunningProDays] = useState(false);
  const [proDayMessage, setProDayMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Options
  const teamOptions = useMemo(() => {
    if (!nflTeams || nflTeams.length === 0) return [];
    return [...nflTeams]
      .sort((a, b) => (a.TeamName || "").localeCompare(b.TeamName || ""))
      .map((t) => ({
        label: `${t.TeamName} ${t.Mascot}`,
        value: t.ID.toString(),
      }));
  }, [nflTeams]);

  const compRoundOptions = useMemo(
    () => [
      { label: "Round 1", value: "1" },
      { label: "Round 2", value: "2" },
      { label: "Round 3", value: "3" },
      { label: "Round 4", value: "4" },
      { label: "Round 5", value: "5" },
      { label: "Round 6", value: "6" },
      { label: "Round 7", value: "7" },
    ],
    [],
  );

  const availableTeamPicks = useMemo(() => {
    if (!forfeitTeamID || !nflDraftPicks) return [];
    return nflDraftPicks
      .filter((p: NFLDraftPick) => p.TeamID === forfeitTeamID && !p.IsVoid)
      .sort((a: NFLDraftPick, b: NFLDraftPick) => {
        if (a.Season !== b.Season) return a.Season - b.Season;
        if (a.DraftRound !== b.DraftRound) return a.DraftRound - b.DraftRound;
        return a.DraftNumber - b.DraftNumber;
      })
      .map((p: NFLDraftPick) => {
        const fromNote = p.OriginalTeam ? ` (From ${p.OriginalTeam})` : "";
        return {
          label: `${p.Season} Round ${p.DraftRound}, Pick #${p.DraftNumber}${fromNote}`,
          value: p.ID.toString(),
        };
      });
  }, [forfeitTeamID, nflDraftPicks]);

  // Handlers for Comp Pick
  const handleOpenCompModal = () => {
    const defaultYear = cfb_Timestamp?.Season ?? 2028;
    setCompYear(defaultYear);
    if (teamOptions.length > 0 && !compTeamID) {
      setCompTeamID(Number(teamOptions[0].value));
    }
    setCompRound(3);
    setCompPickNumber(33);
    setCompMessage(null);
    setIsCompModalOpen(true);
  };

  const handleSaveCompPick = async () => {
    if (!compTeamID) {
      setCompMessage({ type: "error", text: "Please select a team." });
      return;
    }
    if (!compRound || compRound < 1 || compRound > 7) {
      setCompMessage({
        type: "error",
        text: "Round must be between 1 and 7.",
      });
      return;
    }
    if (!compPickNumber || compPickNumber < 1) {
      setCompMessage({
        type: "error",
        text: "Pick number within the round must be at least 1.",
      });
      return;
    }

    setIsSubmittingComp(true);
    setCompMessage(null);
    try {
      const createdPick = await DraftService.AddCompensatoryDraftPick({
        TeamID: compTeamID,
        Season: compYear,
        SeasonID: compYear > 2020 ? compYear - 2020 : compYear,
        DraftRound: compRound,
        DraftNumber: compPickNumber,
      });

      if (setNFLDraftPicks && createdPick) {
        setNFLDraftPicks([...(nflDraftPicks || []), createdPick]);
      }

      setCompMessage({
        type: "success",
        text: `Successfully added compensatory pick: Round ${compRound}, Pick #${compPickNumber}!`,
      });
      setTimeout(() => {
        setIsCompModalOpen(false);
      }, 1500);
    } catch (e) {
      setCompMessage({
        type: "error",
        text: `Failed to add comp pick: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsSubmittingComp(false);
    }
  };

  // Handlers for Forfeit Pick
  const handleOpenForfeitModal = () => {
    if (teamOptions.length > 0 && !forfeitTeamID) {
      setForfeitTeamID(Number(teamOptions[0].value));
    }
    setForfeitPickID(0);
    setForfeitReason("");
    setForfeitMessage(null);
    setIsForfeitModalOpen(true);
  };

  const handleSaveForfeitPick = async () => {
    if (!forfeitTeamID) {
      setForfeitMessage({ type: "error", text: "Please select a team." });
      return;
    }
    if (!forfeitPickID) {
      setForfeitMessage({
        type: "error",
        text: "Please select a pick to forfeit.",
      });
      return;
    }
    if (!forfeitReason.trim()) {
      setForfeitMessage({
        type: "error",
        text: "Please enter a reason for the forfeiture.",
      });
      return;
    }

    setIsSubmittingForfeit(true);
    setForfeitMessage(null);
    try {
      const updatedPick = await DraftService.ForfeitNFLDraftPick({
        DraftPickID: forfeitPickID,
        Reason: forfeitReason.trim(),
      });

      if (setNFLDraftPicks && nflDraftPicks) {
        const nextPicks = nflDraftPicks.map((p: NFLDraftPick) =>
          p.ID === forfeitPickID ? { ...p, IsVoid: true } : p,
        );
        setNFLDraftPicks(nextPicks);
      }

      setForfeitMessage({
        type: "success",
        text: "Draft pick has been forfeited and logged in transactions.",
      });
      setTimeout(() => {
        setIsForfeitModalOpen(false);
      }, 1500);
    } catch (e) {
      setForfeitMessage({
        type: "error",
        text: `Failed to forfeit pick: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsSubmittingForfeit(false);
    }
  };

  // Handler for Combine Runner
  const handleRunCombine = async () => {
    const rawLines = combineIDsText.split("\n");
    const ids: number[] = [];
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parsed = Number(trimmed);
      if (!isNaN(parsed) && parsed > 0) {
        ids.push(parsed);
      }
    }

    if (ids.length === 0) {
      setCombineMessage({
        type: "error",
        text: "Please enter at least one valid numeric player ID (one per line).",
      });
      return;
    }

    setIsRunningCombine(true);
    setCombineMessage(null);
    try {
      const res = await DraftService.RunCombine(ids);
      const unfoundCount = res?.Unfound?.length ?? 0;
      let msg = res?.Message || `Ran combine for ${res?.Count ?? ids.length} players.`;
      if (unfoundCount > 0) {
        msg += ` (${unfoundCount} IDs not found: ${res.Unfound.slice(0, 5).join(", ")}${unfoundCount > 5 ? "..." : ""})`;
      }
      setCombineMessage({
        type: "success",
        text: msg,
      });
    } catch (e) {
      setCombineMessage({
        type: "error",
        text: `Failed to run combine: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsRunningCombine(false);
    }
  };

  // Handler for Pro Day Toggle
  const handleToggleNominations = async () => {
    setIsTogglingNominations(true);
    setProDayMessage(null);
    try {
      const res = await DraftService.ToggleProDayNominations();
      if (setCFB_Timestamp && cfb_Timestamp) {
        setCFB_Timestamp({
          ...cfb_Timestamp,
          AllowProDayNominations: Boolean(res?.AllowProDayNominations),
        } as any);
      }
      setProDayMessage({
        type: "success",
        text: `Pro Day nominations are now ${res?.AllowProDayNominations ? "OPEN" : "CLOSED"}.`,
      });
    } catch (e) {
      setProDayMessage({
        type: "error",
        text: `Failed to toggle nominations: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsTogglingNominations(false);
    }
  };

  // Handler for Pro Day Runner
  const handleRunProDays = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to run Pro Days? This will test all nominated players, 5 random graduates from non-nominating FBS teams, and top 35 FCS players.",
    );
    if (!confirmed) return;

    setIsRunningProDays(true);
    setProDayMessage(null);
    try {
      const res = await DraftService.RunProDays();
      setProDayMessage({
        type: "success",
        text: res?.Message || `Successfully ran Pro Days for ${res?.Count ?? 0} prospects.`,
      });
    } catch (e) {
      setProDayMessage({
        type: "error",
        text: `Failed to run Pro Days: ${e instanceof Error ? e.message : e}`,
      });
    } finally {
      setIsRunningProDays(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4 gap-6">
      {/* ---------------- SIMNFL SECTION ---------------- */}
      {isNFL && (
        <>
          <Border classes="w-full p-4 flex flex-col gap-4">
            <Text variant="h6" className="text-start">
              Draft Order & Pick Management
            </Text>
            <Text variant="body-small" classes="text-gray-400 text-start">
              Manage draft order changes, add compensatory picks to teams, or forfeit
              picks due to league sanctions.
            </Text>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button variant="primary" onClick={handleOpenCompModal}>
                Add Comp Pick
              </Button>
              <Button variant="danger" onClick={handleOpenForfeitModal}>
                Forfeit a Pick
              </Button>
            </div>
          </Border>

          <Border classes="w-full p-4 flex flex-col gap-4">
            <Text variant="h6" className="text-start">
              NFL Combine Runner
            </Text>
            <Text variant="body-small" classes="text-gray-400 text-start">
              Enter player IDs (one per line) to execute the Combine testing simulation
              for the invited prospects. Results will be stored and downloadable in the
              War Room.
            </Text>

            <div className="flex flex-col gap-2 max-w-xl">
              <label className="text-xs text-gray-300 text-start">
                Player IDs (one per line):
              </label>
              <textarea
                className="w-full h-40 p-2 text-sm bg-gray-900 text-gray-100 border border-gray-700 rounded-md focus:outline-none focus:border-blue-500 font-mono"
                placeholder="101&#10;102&#10;103&#10;..."
                value={combineIDsText}
                onChange={(e) => setCombineIDsText(e.target.value)}
              />
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="primary"
                  onClick={handleRunCombine}
                  disabled={isRunningCombine || !combineIDsText.trim()}
                >
                  {isRunningCombine ? "Running Combine..." : "Run Combine Function"}
                </Button>
              </div>
            </div>

            {combineMessage && (
              <Text
                variant="body-small"
                classes={`text-start ${
                  combineMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {combineMessage.text}
              </Text>
            )}
          </Border>
        </>
      )}

      {/* ---------------- SIMCFB SECTION ---------------- */}
      {isCFB && (
        <>
          <Border classes="w-full p-4 flex flex-col gap-4">
            <Text variant="h6" className="text-start">
              CFB Pro Day Controls
            </Text>
            <Text variant="body-small" classes="text-gray-400 text-start">
              Manage Pro Day nominations for college coaches and execute Pro Day testing
              events across the country.
            </Text>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-900 border border-gray-700 rounded-md max-w-2xl gap-4">
              <div className="flex flex-col text-start">
                <Text variant="body-small" className="font-semibold text-white">
                  Allow Coach Pro Day Nominations
                </Text>
                <Text variant="xs" classes="text-gray-400">
                  When enabled, CFB team coaches can nominate up to 5 declared or
                  graduated players from their CFB Roster page.
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <ToggleSwitch
                  checked={Boolean(cfb_Timestamp?.AllowProDayNominations)}
                  onChange={handleToggleNominations}
                />
                <Text variant="small" classes="text-gray-300 font-mono">
                  {cfb_Timestamp?.AllowProDayNominations ? "OPEN" : "CLOSED"}
                </Text>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 pt-2">
              <Text variant="body-small" classes="text-gray-400 text-start">
                Run Pro Days for all declared/graduated players:
              </Text>
              <ul className="text-xs text-gray-400 list-disc list-inside text-start pl-2">
                <li>Nominated players from participating FBS teams are added.</li>
                <li>Teams without nominations have 5 random available graduates added.</li>
                <li>FCS teams automatically have their top 35 players added.</li>
              </ul>
              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleRunProDays}
                  disabled={isRunningProDays}
                >
                  {isRunningProDays ? "Running Pro Days..." : "Run Pro Days"}
                </Button>
              </div>
            </div>

            {proDayMessage && (
              <Text
                variant="body-small"
                classes={`text-start ${
                  proDayMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {proDayMessage.text}
              </Text>
            )}
          </Border>
        </>
      )}

      {/* ---------------- COMPENSATORY PICK MODAL ---------------- */}
      {isCompModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCompModalOpen(false)}
          title="Add Compensatory Draft Pick"
          actions={
            <ButtonGroup>
              <Button
                variant="secondaryOutline"
                onClick={() => setIsCompModalOpen(false)}
                disabled={isSubmittingComp}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCompPick}
                disabled={isSubmittingComp || !compTeamID}
              >
                {isSubmittingComp ? "Adding..." : "Add Pick"}
              </Button>
            </ButtonGroup>
          }
        >
          <div className="flex flex-col gap-y-4 p-2 text-start">
            <Text variant="body-small" classes="text-gray-400">
              Add a compensatory pick to the draft order for a designated NFL team.
            </Text>

            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Team
              </Text>
              <SelectDropdown
                options={teamOptions}
                value={
                  teamOptions.find((o: any) => o.value === compTeamID.toString()) ??
                  null
                }
                onChange={(opt: any) => opt && setCompTeamID(Number(opt.value))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Year"
                min={2020}
                value={compYear}
                onChange={(e) => setCompYear(Number(e.target.value) || 2028)}
              />

              <div className="flex flex-col gap-y-1">
                <Text variant="small" classes="text-gray-400">
                  Round
                </Text>
                <SelectDropdown
                  options={compRoundOptions}
                  value={
                    compRoundOptions.find(
                      (r: any) => r.value === compRound.toString(),
                    ) ?? null
                  }
                  onChange={(opt: any) => opt && setCompRound(Number(opt.value))}
                />
              </div>

              <Input
                type="number"
                label="Pick in Round"
                min={1}
                value={compPickNumber}
                onChange={(e) => setCompPickNumber(Number(e.target.value) || 1)}
              />
            </div>

            {compMessage && (
              <Text
                variant="body-small"
                classes={
                  compMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {compMessage.text}
              </Text>
            )}
          </div>
        </Modal>
      )}

      {/* ---------------- FORFEIT PICK MODAL ---------------- */}
      {isForfeitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsForfeitModalOpen(false)}
          title="Forfeit a Draft Pick"
          actions={
            <ButtonGroup>
              <Button
                variant="secondaryOutline"
                onClick={() => setIsForfeitModalOpen(false)}
                disabled={isSubmittingForfeit}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleSaveForfeitPick}
                disabled={isSubmittingForfeit || !forfeitPickID || !forfeitReason.trim()}
              >
                {isSubmittingForfeit ? "Forfeiting..." : "Forfeit Pick"}
              </Button>
            </ButtonGroup>
          }
        >
          <div className="flex flex-col gap-y-4 p-2 text-start">
            <Text variant="body-small" classes="text-gray-400">
              Forfeiting a draft pick marks it as void in the draft board and logs an
              official disciplinary / league sanction entry in the NFL transaction log.
            </Text>

            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Team
              </Text>
              <SelectDropdown
                options={teamOptions}
                value={
                  teamOptions.find((o: any) => o.value === forfeitTeamID.toString()) ??
                  null
                }
                onChange={(opt: any) => {
                  if (opt) {
                    setForfeitTeamID(Number(opt.value));
                    setForfeitPickID(0);
                  }
                }}
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Pick to Forfeit
              </Text>
              <SelectDropdown
                options={availableTeamPicks}
                value={
                  availableTeamPicks.find(
                    (p: any) => p.value === forfeitPickID.toString(),
                  ) ?? null
                }
                onChange={(opt: any) => opt && setForfeitPickID(Number(opt.value))}
                placeholder={
                  availableTeamPicks.length === 0
                    ? "No available picks for this team"
                    : "Select a pick to forfeit"
                }
              />
            </div>

            <div className="flex flex-col gap-y-1">
              <Text variant="small" classes="text-gray-400">
                Reason for Forfeiture (logged in transactions)
              </Text>
              <Input
                type="text"
                placeholder="e.g. Tampering during Free Agency period"
                value={forfeitReason}
                onChange={(e) => setForfeitReason(e.target.value)}
              />
            </div>

            {forfeitMessage && (
              <Text
                variant="body-small"
                classes={
                  forfeitMessage.type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {forfeitMessage.text}
              </Text>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
