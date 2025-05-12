import { FC, useEffect, useMemo, useState } from "react";
import { Modal } from "../../../_design/Modal";
import {
  ProCapsheet,
  ProfessionalTeam,
  Timestamp as HCKTimestamp,
  TradeProposal,
  DraftPick,
  ProfessionalPlayer,
  TradeOption as HCKTradeOption,
} from "../../../models/hockeyModels";
import { NFLTeam } from "../../../models/footballModels";
import { NBATeam } from "../../../models/basketballModels";
import { League, SimPHL } from "../../../_constants/constants";
import { Text } from "../../../_design/Typography";
import { TradeBlockRow } from "../TeamPageTypes";
import { Button } from "../../../_design/Buttons";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { CapsheetInfo } from "../TeamPageComponents";
import { darkenColor } from "../../../_utility/getDarkerColor";
import { useResponsive } from "../../../_hooks/useMobile";
import {
  getTradeOptionsList,
  mapSelectedOptionsToTradeOptions,
  mapTradeProposals,
} from "../Helpers/tradeModalHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SelectDropdown } from "../../../_design/Select";
import { Border } from "../../../_design/Borders";
import { Close } from "../../../_design/Icons";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";

interface ManageTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ProfessionalTeam | NFLTeam | NBATeam;
  league: League;
  sentTradeProposals: TradeProposal[];
  receivedTradeProposals: TradeProposal[];
  backgroundColor?: string;
  borderColor?: string;
  textColorClass?: string;
  userCapSheet: ProCapsheet;
  ts: HCKTimestamp;
  individualDraftPickMap: Record<number, DraftPick>;
  proPlayerMap: Record<number, ProfessionalPlayer>;
  cancelTrade: (dto: TradeProposal) => Promise<void>;
  acceptTrade: (dto: TradeProposal) => Promise<void>;
  rejectTrade: (dto: TradeProposal) => Promise<void>;
}

export const ManageTradeModal: FC<ManageTradeModalProps> = ({
  isOpen,
  onClose,
  team,
  league,
  sentTradeProposals,
  receivedTradeProposals,
  backgroundColor,
  borderColor,
  textColorClass,
  userCapSheet,
  individualDraftPickMap,
  proPlayerMap,
  ts,
  cancelTrade,
  acceptTrade,
  rejectTrade
}) => {
  const { phlTeamMap } = useSimHCKStore();
  const sectionBg = darkenColor("#1f2937", -5);
  let title = "";
  let teamName = "";
  if (league === SimPHL) {
    let phlTeam = team as ProfessionalTeam;
    teamName = phlTeam.TeamName;
    title = `Manage ${teamName} Trades`;
  }
  const cleanSentTrades = useMemo(() => {
    return mapTradeProposals(sentTradeProposals, team.ID);
  }, [sentTradeProposals]);

  const cleanReceivedTrades = useMemo(() => {
    return mapTradeProposals(receivedTradeProposals, team.ID);
  }, [receivedTradeProposals]);

  const cancel = async (dto: TradeProposal) => {
    return await cancelTrade(dto);
  }

  const accept = async (dto: TradeProposal) => {
    return await acceptTrade(dto);
  }

  const reject = async (dto: TradeProposal) => {
    return await rejectTrade(dto);
  }

  return (
    <>
      <Modal
        title={title}
        isOpen={isOpen}
        maxWidth="max-w-[75vw]"
        onClose={onClose}
        actions={<></>}
      >
        <div className="grid grid-cols-[1fr_2fr_2fr] gap-x-4">
          <div className="flex flex-col">
            <Text as="h4" classes="mb-1">
              {teamName} Cap
            </Text>
            <CapsheetInfo
              ts={ts}
              capsheet={userCapSheet}
              league={league}
              borderColor={borderColor}
              backgroundColor={sectionBg}
              lineColor={borderColor}
            />
          </div>
          <div className="flex flex-col">
            <Text as="h4" classes="mb-2">
              Sent
            </Text>
            {cleanSentTrades.length === 0 && <>
              <Border classes="mt-2 p-4">
                <Text as="h4">No pending trades</Text>
              </Border>
            </>}
            {cleanSentTrades.map((trade) =>               
            <TradeSection 
                otherTeam={phlTeamMap[trade.RecepientTeamID]}
                trade={trade}
                league={league}
                individualDraftPickMap={individualDraftPickMap}
                proPlayerMap={proPlayerMap}
                cancel={cancel}
                accept={accept}
                reject={reject}
                isSentTrade
              />)}
          </div>
          <div className="flex  flex-col">
            <Text as="h4" classes="mb-2">
              Received
            </Text>
            {cleanReceivedTrades.length === 0 && <>
              <Border classes="mt-2 p-4">
                <Text as="h4">No received trades</Text>
              </Border>
            </>}
            {cleanReceivedTrades.map((trade) => 
              <TradeSection 
                otherTeam={phlTeamMap[trade.TeamID]}
                trade={trade}
                league={league}
                individualDraftPickMap={individualDraftPickMap}
                proPlayerMap={proPlayerMap}
                cancel={cancel}
                accept={accept}
                reject={reject}
              />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

interface TradeSectionProps {
  trade: TradeProposal;
  otherTeam: ProfessionalTeam;
  league: League;
  individualDraftPickMap: Record<number, DraftPick>;
  proPlayerMap: Record<number, ProfessionalPlayer>;
  cancel: (dto: TradeProposal) => Promise<void>;
  accept: (dto: TradeProposal) => Promise<void>;
  reject: (dto: TradeProposal) => Promise<void>;
  isSentTrade?: boolean;
}

const TradeSection: FC<TradeSectionProps> = ({ trade, 
  otherTeam, 
  league, 
  individualDraftPickMap,
  proPlayerMap,
  cancel, 
  accept, reject, isSentTrade }) => {

  const otherLogo = getLogo(league, otherTeam.ID, false);
  return (
    <Border direction="row" classes="p-4">
      <div className="grid grid-cols-4 w-full">
        <div className="flex flex-col items-start">
          <Logo
            url={otherLogo}
            label={otherTeam.Abbreviation}
            textClass="text-center"
          />
        </div>
        <div className="flex flex-col">
          <Text>Sending</Text>
          {trade.TeamTradeOptions.map((item) => (
            <ManageOption
              item={item}
              player={proPlayerMap[item.PlayerID]}
              pick={individualDraftPickMap[item.DraftPickID]}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <Text>Receiving</Text>
          {trade.RecepientTeamTradeOptions.map((item) => (
            <ManageOption
              item={item}
              player={proPlayerMap[item.PlayerID]}
              pick={individualDraftPickMap[item.DraftPickID]}
            />
          ))}
        </div>
        {isSentTrade ? 
        (<div className="flex flex-col items-end gap-y-2">
          <Button size="sm" classes="w-[5rem]" onClick={() => cancel(trade)}>
            Cancel
          </Button>
        </div>) : (
          <div className="flex flex-col items-end gap-y-2">
          <Button size="sm" classes="w-[5rem]" onClick={() => accept(trade)}>
            Accept
          </Button>
          <Button size="sm" classes="w-[5rem]" onClick={() => reject(trade)}>
            Reject
          </Button>
        </div>)}
      </div>
    </Border>)
}

interface ManageOptionProps {
  item: HCKTradeOption;
  player: ProfessionalPlayer;
  pick: DraftPick;
}

const ManageOption: FC<ManageOptionProps> = ({ item, player, pick }) => {
  const isPlayer = item.OptionType === "Player";
  let label = "";
  if (isPlayer) {
    label = `${player.Age} year, ${player.Archetype} ${player.Position} ${player.FirstName} ${player.LastName}`;
  } else {
    label = `${pick.Season}, R${pick.DraftRound}, P${pick.DraftNumber}`;
  }
  return (
    <div className="flex flex-col">
      <Text variant="xs" classes="text-start">
        {label}
      </Text>
    </div>
  );
};

interface TradeOptionProps {
  option: TradeBlockRow;
  removeItem: (idx: number) => void;
  idx: number;
}

const TradeOption: FC<TradeOptionProps> = ({ option, removeItem, idx }) => {
  return (
    <Border classes="w-full px-4 gap-x-4 items-center justify-center py-2">
      <div className="flex flex-row w-full justify-between">
        <Text classes="text-start">
          Type: {option.isPlayer ? "Player" : "Pick"}
        </Text>
        <Button
          size="sm"
          classes="justify-center w-[45px] rounded-full"
          onClick={() => removeItem(idx)}
        >
          <Close />
        </Button>
      </div>
      <div className="flex flex-row w-full">
        {option.isPlayer && (
          <>
            <Text>
              {option.position} {option.arch} {option.name}
            </Text>
          </>
        )}
        {!option.isPlayer && (
          <>
            <Text>
              {option.season}, Round {option.draftRound}, Pick{" "}
              {option.draftPick}
            </Text>
          </>
        )}
      </div>
      <div className="flex flex-row w-full">
        <Text>Value: {option.value}</Text>
      </div>
    </Border>
  );
};

interface ProposeTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTeam: ProfessionalTeam | NFLTeam | NBATeam;
  recipientTeam: ProfessionalTeam | NFLTeam | NBATeam;
  league: League;
  userTradeBlock: TradeBlockRow[];
  otherTeamTradeBlock: TradeBlockRow[];
  userCapSheet: ProCapsheet;
  recipientCapSheet: ProCapsheet;
  ts: HCKTimestamp;
  backgroundColor?: string;
  borderColor?: string;
  proposeTrade: (dto: any) => Promise<void>;
}

export const ProposeTradeModal: FC<ProposeTradeModalProps> = ({
  isOpen,
  onClose,
  userTeam,
  recipientTeam,
  league,
  userTradeBlock,
  otherTeamTradeBlock,
  userCapSheet,
  recipientCapSheet,
  ts,
  backgroundColor,
  borderColor,
  proposeTrade,
}) => {
  const [selectedUserItems, setSelectedUserItems] = useState<TradeBlockRow[]>(
    []
  );
  const [selectedRecipientItems, setSelectedRecipientItems] = useState<
    TradeBlockRow[]
  >([]);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const sectionBg = darkenColor("#1f2937", -5);
  const { isDesktop } = useResponsive();

  const userTradeBlockOptions = getTradeOptionsList(userTradeBlock);
  const recipientTradeBlockOptions = getTradeOptionsList(otherTeamTradeBlock);

  useEffect(() => {
    setSelectedRecipientItems([]);
  }, [recipientTeam]);

  const changeUserItemList = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const item = userTradeBlock[value];
    for (let i = 0; i < selectedUserItems.length; i++) {
      const selectedItem = selectedUserItems[i];
      if (
        item.isPlayer === selectedItem.isPlayer &&
        item.id === selectedItem.id
      ) {
        return;
      }
    }
    setSelectedUserItems((items: any[]) => [...items, item]);
  };

  const changeRecipientItemList = (opts: SingleValue<SelectOption>) => {
    const value = Number(opts?.value);
    const item = otherTeamTradeBlock[value];
    for (let i = 0; i < selectedRecipientItems.length; i++) {
      const selectedItem = selectedRecipientItems[i];
      if (
        item.isPlayer === selectedItem.isPlayer &&
        item.id === selectedItem.id
      ) {
        return;
      }
    }
    setSelectedRecipientItems((items: any[]) => [...items, item]);
  };

  const removeItemFromUserList = (idx: number) => {
    setSelectedUserItems((items: any[]) =>
      items.filter((items, index) => index !== idx)
    );
  };

  const removeItemFromRecipientList = (idx: number) => {
    setSelectedRecipientItems((items: any[]) =>
      items.filter((items, index) => index !== idx)
    );
  };

  const sendProposal = async () => {
    const userOptions = mapSelectedOptionsToTradeOptions(
      selectedUserItems,
      userTeam.ID
    );
    const recepientOptions = mapSelectedOptionsToTradeOptions(
      selectedRecipientItems,
      recipientTeam.ID
    );
    const dto = {
      TeamID: userTeam.ID,
      RecepientTeamID: recipientTeam.ID,
      TeamTradeOptions: userOptions,
      RecepientTeamTradeOptions: recepientOptions,
    };
    onClose();
    return await proposeTrade(dto);
  };

  let title = "";
  let userTeamName = "";
  let recipientTeamName = "";
  if (league === SimPHL) {
    let userPhlTeam = userTeam as ProfessionalTeam;
    let phlTeam = recipientTeam as ProfessionalTeam;
    userTeamName = `${userPhlTeam.TeamName}`;
    recipientTeamName = `${phlTeam.TeamName}`;
    title = `Propose Trade With ${recipientTeamName}`;
  }

  /*
    -- Confirm should send up the proposal
  */

  return (
    <>
      <Modal
        title={title}
        isOpen={isOpen}
        onClose={onClose}
        classes="max-h-[80vh]"
        actions={
          <>
            <Button size="sm" variant="danger" onClick={onClose}>
              <Text variant="small">Cancel</Text>
            </Button>
            <Button size="sm" onClick={sendProposal}>
              <Text variant="small">Confirm</Text>
            </Button>
          </>
        }
        maxWidth="max-w-[70vw]"
      >
        <div className={`grid ${isDesktop ? "grid-cols-4" : "grid-cols-2"}`}>
          {isDesktop && (
            <div className="flex flex-col">
              <Text as="h4" classes="mb-1">
                {userTeamName} Cap
              </Text>
              <CapsheetInfo
                ts={ts}
                capsheet={userCapSheet}
                league={league}
                borderColor={borderColor}
                backgroundColor={sectionBg}
                lineColor={borderColor}
              />
            </div>
          )}
          <div className="flex flex-col items-center px-6">
            <Text as="h4" classes="mb-2">
              {userTeamName} Sends
            </Text>
            <div className="flex flex-row mb-2">
              <SelectDropdown
                options={userTradeBlockOptions}
                isMulti={false}
                onChange={changeUserItemList}
                styles={{
                  control: (provided, state) => ({
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
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                    zIndex: 100000,
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                    zIndex: 100000,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                    zIndex: 1000,
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                    zIndex: 1000,
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                    zIndex: 1000,
                  }),
                }}
              />
            </div>
            <div className="overflow-y-auto max-h-[25rem] w-full">
              {selectedUserItems.map((x, idx) => (
                <TradeOption
                  option={x}
                  removeItem={removeItemFromUserList}
                  idx={idx}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center px-6">
            <Text as="h4" classes="mb-2">
              {recipientTeamName} Sends
            </Text>
            <div className="flex flex-row mb-2">
              <SelectDropdown
                options={recipientTradeBlockOptions}
                isMulti={false}
                onChange={changeRecipientItemList}
                styles={{
                  control: (provided, state) => ({
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
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    borderRadius: "8px",
                    zIndex: 100000,
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1a202c",
                    padding: "0",
                    zIndex: 100000,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
                    color: "#ffffff",
                    padding: "10px",
                    cursor: "pointer",
                    zIndex: 1000,
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                    zIndex: 1000,
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ffffff",
                    zIndex: 1000,
                  }),
                }}
              />
            </div>
            <div className="overflow-y-auto max-h-[25rem] w-full">
              {selectedRecipientItems.map((x, idx) => (
                <TradeOption
                  option={x}
                  removeItem={removeItemFromRecipientList}
                  idx={idx}
                />
              ))}
            </div>
          </div>
          {isDesktop && (
            <div className="flex flex-col">
              <Text as="h4" classes="mb-1">
                {recipientTeamName} Cap
              </Text>
              <CapsheetInfo
                ts={ts}
                capsheet={recipientCapSheet}
                league={league}
                borderColor={borderColor}
                backgroundColor={sectionBg}
                lineColor={borderColor}
              />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
