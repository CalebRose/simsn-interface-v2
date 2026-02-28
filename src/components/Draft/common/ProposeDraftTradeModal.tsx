import { FC, useEffect, useMemo, useState } from "react";
import { SingleValue } from "react-select";
import { Modal } from "../../../_design/Modal";
import { Text } from "../../../_design/Typography";
import { Button } from "../../../_design/Buttons";
import { Border } from "../../../_design/Borders";
import { Close } from "../../../_design/Icons";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { useResponsive } from "../../../_hooks/useMobile";
import { darkenColor } from "../../../_utility/getDarkerColor";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import {
  DraftPick as PHLDraftPick,
  ProfessionalPlayer,
  ProfessionalTeam,
} from "../../../models/hockeyModels";
import { League, SimPHL } from "../../../_constants/constants";
import { TradeBlockRow } from "../../Team/TeamPageTypes";
import {
  getTradeOptionsList,
  mapSelectedOptionsToTradeOptions,
} from "../../Team/Helpers/tradeModalHelper";
import { DraftPick } from "./types";

// ---------------------------------------------------------------------------
// Helpers — build TradeBlockRow arrays from raw model arrays
// ---------------------------------------------------------------------------

const buildPlayerTradeRows = (players: ProfessionalPlayer[]): TradeBlockRow[] =>
  players.map((p) => ({
    id: p.ID,
    isPlayer: true,
    name: `${p.FirstName} ${p.LastName}`,
    position: p.Position,
    arch: p.Archetype,
    year: p.Age?.toString() ?? "",
    overall: p.Overall?.toString() ?? "",
    draftRound: "",
    draftPick: "",
    value: p.Overall?.toString() ?? "",
    player: p,
  }));

const buildPickTradeRows = (picks: DraftPick[]): TradeBlockRow[] =>
  picks
    // Exclude picks already used in the draft room (DrafteeID) or filled via REST (SelectedPlayerID)
    .map((pk) => {
      const phlPick = pk as PHLDraftPick;
      return {
        id: phlPick.ID,
        isPlayer: false,
        name: `R${phlPick.DraftRound} P${phlPick.DraftNumber}`,
        position: "",
        arch: "",
        year: "",
        overall: "",
        draftRound: phlPick.DraftRound?.toString() ?? "",
        draftPick: phlPick.DraftNumber?.toString() ?? "",
        season: phlPick.Season,
        value: phlPick.DraftValue?.toString() ?? "",
        pick: phlPick,
      };
    });

// ---------------------------------------------------------------------------
// Shared select styles (mirrors ProposeTradeModal)
// ---------------------------------------------------------------------------

const dropdownStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
    color: "#ffffff",
    width: "15rem",
    maxWidth: "300px",
    padding: "0.3rem",
    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    zIndex: 100000,
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#1a202c",
    borderRadius: "8px",
    zIndex: 100000,
  }),
  menuList: (provided: any) => ({
    ...provided,
    backgroundColor: "#1a202c",
    padding: "0",
    zIndex: 100000,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    color: "#ffffff",
    padding: "10px",
    cursor: "pointer",
    zIndex: 1000,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#ffffff",
    zIndex: 1000,
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#ffffff",
    zIndex: 1000,
  }),
};

// ---------------------------------------------------------------------------
// TradeOption item row
// ---------------------------------------------------------------------------

interface DraftTradeOptionProps {
  option: TradeBlockRow;
  idx: number;
  removeItem: (idx: number) => void;
}

const DraftTradeOption: FC<DraftTradeOptionProps> = ({
  option,
  idx,
  removeItem,
}) => {
  const label = option.isPlayer
    ? `${option.position} ${option.arch} ${option.name} (${option.overall} OVR)`
    : `${option.season} Round ${option.draftRound}, Pick ${option.draftPick}`;

  return (
    <Border classes="w-full px-4 gap-x-4 items-center justify-between py-2">
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-col">
          <Text variant="xs" classes="text-start">
            Type: {option.isPlayer ? "Player" : "Draft Pick"}
          </Text>
          <Text classes="text-start">{label}</Text>
          {!option.isPlayer && option.value && (
            <Text variant="xs" classes="text-start text-gray-400">
              Value: {option.value}
            </Text>
          )}
        </div>
        <button
          className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
          onClick={() => removeItem(idx)}
          title="Remove"
        >
          <Close />
        </button>
      </div>
    </Border>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProposeDraftTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTeam: ProfessionalTeam | null;
  tradePartnerTeam: ProfessionalTeam | null;
  league: League;
  teamOptions: { label: string; value: string }[];
  selectTradePartner: (teamID: number) => void;
  userTradablePlayers: ProfessionalPlayer[];
  userTradablePicks: DraftPick[];
  partnerTradablePlayers: ProfessionalPlayer[];
  partnerTradablePicks: DraftPick[];
  proposeTrade: (dto: any) => Promise<void>;
  backgroundColor?: string;
  borderColor?: string;
}

export const ProposeDraftTradeModal: FC<ProposeDraftTradeModalProps> = ({
  isOpen,
  onClose,
  userTeam,
  tradePartnerTeam,
  league,
  teamOptions,
  selectTradePartner,
  userTradablePlayers,
  userTradablePicks,
  partnerTradablePlayers,
  partnerTradablePicks,
  proposeTrade,
  backgroundColor,
  borderColor,
}) => {
  const { isDesktop } = useResponsive();
  const sectionBg = darkenColor("#1f2937", -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);

  const [selectedUserItems, setSelectedUserItems] = useState<TradeBlockRow[]>(
    [],
  );
  const [selectedPartnerItems, setSelectedPartnerItems] = useState<
    TradeBlockRow[]
  >([]);

  // Build trade block rows
  const userTradeBlock = useMemo(
    () => [
      ...buildPlayerTradeRows(userTradablePlayers),
      ...buildPickTradeRows(userTradablePicks),
    ],
    [userTradablePlayers, userTradablePicks],
  );

  const partnerTradeBlock = useMemo(
    () => [
      ...buildPlayerTradeRows(partnerTradablePlayers),
      ...buildPickTradeRows(partnerTradablePicks),
    ],
    [partnerTradablePlayers, partnerTradablePicks],
  );

  const userTradeBlockOptions = useMemo(
    () => getTradeOptionsList(userTradeBlock),
    [userTradeBlock],
  );

  const partnerTradeBlockOptions = useMemo(
    () => getTradeOptionsList(partnerTradeBlock),
    [partnerTradeBlock],
  );

  // Reset partner selections when partner changes
  useEffect(() => {
    setSelectedPartnerItems([]);
  }, [tradePartnerTeam]);

  // ---- Item selection handlers -------------------------------------------

  const addUserItem = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const item = userTradeBlock[value];
    if (!item) return;
    const alreadyAdded = selectedUserItems.some(
      (s) => s.isPlayer === item.isPlayer && s.id === item.id,
    );
    if (alreadyAdded) return;
    setSelectedUserItems((prev) => [...prev, item]);
  };

  const addPartnerItem = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const item = partnerTradeBlock[value];
    if (!item) return;
    const alreadyAdded = selectedPartnerItems.some(
      (s) => s.isPlayer === item.isPlayer && s.id === item.id,
    );
    if (alreadyAdded) return;
    setSelectedPartnerItems((prev) => [...prev, item]);
  };

  const removeUserItem = (idx: number) => {
    setSelectedUserItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const removePartnerItem = (idx: number) => {
    setSelectedPartnerItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Trade partner selector --------------------------------------------

  const onSelectTradePartner = (opts: SingleValue<SelectOption>) => {
    if (!opts) return;
    selectTradePartner(Number(opts.value));
  };

  // ---- Submit ------------------------------------------------------------

  const sendProposal = async () => {
    if (!userTeam || !tradePartnerTeam) return;

    const userOptions = mapSelectedOptionsToTradeOptions(
      selectedUserItems,
      userTeam.ID,
    );
    const partnerOptions = mapSelectedOptionsToTradeOptions(
      selectedPartnerItems,
      tradePartnerTeam.ID,
    );

    const dto = {
      TeamID: userTeam.ID,
      RecepientTeamID: tradePartnerTeam.ID,
      TeamTradeOptions: userOptions,
      RecepientTeamTradeOptions: partnerOptions,
    };

    onClose();
    await proposeTrade(dto);
  };

  // ---- Labels ------------------------------------------------------------

  let title = "Propose Draft Trade";
  let userTeamName = "";
  let partnerTeamName = "Select Partner";

  if (league === SimPHL) {
    userTeamName = userTeam ? userTeam.TeamName : "";
    partnerTeamName = tradePartnerTeam
      ? tradePartnerTeam.TeamName
      : "Select Partner";
    if (tradePartnerTeam) {
      title = `Propose Draft Trade with ${partnerTeamName}`;
    }
  }

  const canSubmit =
    !!tradePartnerTeam &&
    (selectedUserItems.length > 0 || selectedPartnerItems.length > 0);

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onClose}
      classes="max-h-[85vh]"
      actions={
        <>
          <Button size="sm" variant="danger" onClick={onClose}>
            <Text variant="small">Cancel</Text>
          </Button>
          <Button size="sm" onClick={sendProposal} disabled={!canSubmit}>
            <Text variant="small">Confirm</Text>
          </Button>
        </>
      }
      maxWidth="max-w-[70vw]"
    >
      {/* Trade Partner Selector */}
      <div className="flex flex-col gap-y-2 mb-4">
        <Text as="h4">Select Trade Partner</Text>
        <SelectDropdown
          options={teamOptions.filter(
            (opt) => Number(opt.value) !== userTeam?.ID,
          )}
          isMulti={false}
          onChange={onSelectTradePartner}
          styles={dropdownStyles}
        />
      </div>

      {/* Trade Columns */}
      <div
        className={`grid gap-x-4 ${isDesktop ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {/* User team column */}
        <div className="flex flex-col items-center px-4">
          <Text as="h4" classes="mb-2">
            {userTeamName} Sends
          </Text>
          <div className="flex flex-row mb-2">
            <SelectDropdown
              options={userTradeBlockOptions}
              isMulti={false}
              onChange={addUserItem}
              styles={dropdownStyles}
            />
          </div>
          <div className="overflow-y-auto max-h-[25rem] w-full flex flex-col gap-y-2">
            {selectedUserItems.length === 0 && (
              <Border classes="p-4">
                <Text variant="xs" classes="text-gray-400">
                  No items selected
                </Text>
              </Border>
            )}
            {selectedUserItems.map((item, idx) => (
              <DraftTradeOption
                key={`user-${idx}`}
                option={item}
                idx={idx}
                removeItem={removeUserItem}
              />
            ))}
          </div>
        </div>

        {/* Partner team column */}
        <div className="flex flex-col items-center px-4">
          <Text as="h4" classes="mb-2">
            {partnerTeamName} Sends
          </Text>
          {tradePartnerTeam ? (
            <>
              <div className="flex flex-row mb-2">
                <SelectDropdown
                  options={partnerTradeBlockOptions}
                  isMulti={false}
                  onChange={addPartnerItem}
                  styles={dropdownStyles}
                />
              </div>
              <div className="overflow-y-auto max-h-[25rem] w-full flex flex-col gap-y-2">
                {selectedPartnerItems.length === 0 && (
                  <Border classes="p-4">
                    <Text variant="xs" classes="text-gray-400">
                      No items selected
                    </Text>
                  </Border>
                )}
                {selectedPartnerItems.map((item, idx) => (
                  <DraftTradeOption
                    key={`partner-${idx}`}
                    option={item}
                    idx={idx}
                    removeItem={removePartnerItem}
                  />
                ))}
              </div>
            </>
          ) : (
            <Border classes="p-4 w-full">
              <Text variant="xs" classes="text-gray-400">
                Select a trade partner above to see their available assets.
              </Text>
            </Border>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProposeDraftTradeModal;
