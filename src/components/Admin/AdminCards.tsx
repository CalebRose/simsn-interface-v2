import { League, SimNFL, SimPHL } from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { NFLTradeOption } from "../../models/footballModels";
import { TradeOption } from "../../models/hockeyModels";
import { ManageOption } from "../Team/Common/ManageTradesModal";

interface AdminTeamCardProps {
  logo: string;
  teamLabel: string;
  owner?: string | null;
  coach?: string | null;
  gm?: string | null;
  scout?: string | null;
  marketing?: string | null;
  backgroundColor?: string;
  borderColor?: string;
  onClick?: () => void;
  disable: boolean;
  lastLogin: string;
  isInGoodStanding?: boolean;
  penaltyMarks?: number;
  weeksMissed?: number;
  isAIInRecruiting?: boolean;
}

export const AdminTeamCard: React.FC<AdminTeamCardProps> = ({
  teamLabel,
  logo,
  owner,
  coach = "",
  gm,
  scout,
  marketing,
  backgroundColor = "",
  borderColor = "",
  onClick,
  disable,
  lastLogin,
  isInGoodStanding,
  penaltyMarks,
  weeksMissed,
  isAIInRecruiting,
}) => {
  return (
    <Border classes="w-full p-2">
      <div className="flex flex-row items-start w-full">
        <Border
          classes="items-center justify-center mt-1"
          styles={{ backgroundColor, borderColor }}
        >
          <div className="flex flex-col w-[6rem] h-[6rem] items-center justify-center">
            <Logo url={logo} variant="normal" classes="" containerClass="p-4" />
          </div>
        </Border>
        <div className="flex flex-col pt-2 px-2 mx-auto flex-grow">
          <Text variant="small" classes="mb-2">
            {teamLabel}
          </Text>
          {owner && (
            <Text variant="xs" classes="mb-2">
              Owner: {owner.length > 0 ? owner : "Open"}
            </Text>
          )}
          {gm && (
            <Text variant="xs" classes="mb-2">
              GM: {gm.length > 0 ? gm : "Open"}
            </Text>
          )}
          {coach && (
            <Text variant="xs" classes="mb-2">
              Coach: {coach.length > 0 ? coach : "Open"}
            </Text>
          )}
          {scout && (
            <Text variant="xs" classes="mb-2">
              Scout: {scout.length > 0 ? scout : "Open"}
            </Text>
          )}
          {marketing && (
            <Text variant="xs" classes="mb-2">
              Marketing: {marketing.length > 0 ? marketing : "Open"}
            </Text>
          )}
        </div>
        <div className="flex flex-col pt-2 px-2 min-w-[120px]">
          <Text variant="xs" classes="mb-2">
            Last Activity
          </Text>
          <Text variant="xs" classes="mb-2">
            {lastLogin}
          </Text>
          <Text
            variant="xs"
            className={isInGoodStanding ? "text-green-500" : "text-red-500"}
          >
            {isInGoodStanding ? "In Good Standing" : "Inactive"}
          </Text>
        </div>
        <div className="flex flex-col pt-2 px-2 min-w-[100px]">
          {penaltyMarks && (
            <>
              <Text variant="xs" classes="mb-2">
                Penalty Marks
              </Text>
              <Text variant="xs" classes="mb-2">
                {penaltyMarks}
              </Text>
            </>
          )}
          {weeksMissed !== undefined && (
            <>
              <Text variant="xs" classes="mb-2">
                Weeks Missed
              </Text>
              <Text variant="xs" classes="mb-2">
                {weeksMissed} {isAIInRecruiting ? "(AI Active)" : ""}
              </Text>
            </>
          )}
        </div>
        <div className="flex flex-col pt-2 px-2 my-auto">
          <Button variant="danger" onClick={onClick} disabled={disable}>
            Remove
          </Button>
        </div>
      </div>
    </Border>
  );
};

interface AdminRequestCardProps {
  accept: () => Promise<void>;
  reject: () => Promise<void>;
  backgroundColor?: string;
  borderColor?: string;
  requestLogo: string;
  username?: string;
  teamLabel?: string;
  role?: string;
  oneItem: boolean;
}

export const AdminRequestCard: React.FC<AdminRequestCardProps> = ({
  accept,
  reject,
  backgroundColor,
  borderColor,
  requestLogo,
  username,
  teamLabel,
  role,
  oneItem,
}) => {
  return (
    <Border classes={`${!oneItem ? "w-full" : "w-auto"} px-3`}>
      <div className="flex flex-row flex-grow items-center h-[12rem] w-full">
        <Border
          classes="items-center justify-center mt-1"
          styles={{ backgroundColor, borderColor }}
        >
          <div className="flex flex-col w-full items-center justify-center p-4">
            <Logo
              url={requestLogo}
              variant="normal"
              classes=""
              containerClass="p-4"
            />
          </div>
        </Border>
        <div className="flex flex-col justify-center p-2 flex-1">
          <Text variant="small">{teamLabel}</Text>
          <Text variant="small" classes="mb-2">
            User: {username}
          </Text>
          {role && <Text variant="small">Role: {role}</Text>}
        </div>
        <div className="flex flex-col justify-center space-y-2 mr-1">
          <Button variant="success" size="sm" onClick={accept}>
            Accept
          </Button>
          <Button variant="danger" size="sm" onClick={reject}>
            Reject
          </Button>
        </div>
      </div>
    </Border>
  );
};

interface AdminTradeCardProps {
  sendingTeamLabel: string;
  sendingTradeOptions: TradeOption[] | NFLTradeOption[];
  receivingTeamLabel: string;
  receivingTradeOptions: TradeOption[] | NFLTradeOption[];
  sendingTeamLogo: string;
  receivingTeamLogo: string;
  accept: () => Promise<void>;
  veto: () => Promise<void>;
  backgroundColor?: string;
  borderColor?: string;
  proPlayerMap: any;
  draftPickMap: any;
  league?: League;
}

export const AdminTradeCard: React.FC<AdminTradeCardProps> = ({
  backgroundColor,
  borderColor,
  sendingTeamLabel,
  sendingTeamLogo,
  sendingTradeOptions,
  receivingTeamLabel,
  receivingTeamLogo,
  receivingTradeOptions,
  proPlayerMap,
  draftPickMap,
  accept,
  veto,
  league,
}) => {
  return (
    <Border classes="w-full px-3">
      {/* Mobile: 2-col grid (logos top, options below, buttons full-width).
          Desktop (lg): 5-col horizontal layout.
          CSS order reorders items between breakpoints without duplication. */}
      <div className="grid grid-cols-2 gap-2 py-2 lg:grid-cols-5 lg:items-center">
        {/* Sending team logo — mobile: row 1 col 1 | desktop: col 1 */}
        <Border
          classes="items-center justify-center order-1 lg:order-none"
          styles={{ backgroundColor, borderColor }}
        >
          <div className="flex flex-col w-full items-center justify-center p-2 lg:p-4">
            <Logo
              url={sendingTeamLogo}
              label={sendingTeamLabel}
              variant="normal"
              classes=""
              containerClass="p-2 lg:p-4"
            />
          </div>
        </Border>

        {/* Sending trade options — mobile: row 2 col 1 | desktop: col 2 */}
        <div className="flex flex-col justify-center p-2 order-3 lg:order-none">
          {sendingTradeOptions &&
            sendingTradeOptions.map((item) => {
              let playerID = 0;
              let draftPickID = 0;
              if (league === SimNFL) {
                const i = item as NFLTradeOption;
                playerID = i.NFLPlayerID;
                draftPickID = i.NFLDraftPickID;
              } else if (league === SimPHL) {
                const i = item as TradeOption;
                playerID = i.PlayerID;
                draftPickID = i.DraftPickID;
              }
              return (
                <ManageOption
                  item={item}
                  player={proPlayerMap[playerID]}
                  pick={draftPickMap[draftPickID]}
                />
              );
            })}
        </div>

        {/* Receiving trade options — mobile: row 2 col 2 | desktop: col 3 */}
        <div className="flex flex-col justify-center p-2 order-4 lg:order-none">
          {receivingTradeOptions &&
            receivingTradeOptions.map((item) => {
              let playerID = 0;
              let draftPickID = 0;
              if (league === SimNFL) {
                const i = item as NFLTradeOption;
                playerID = i.NFLPlayerID;
                draftPickID = i.NFLDraftPickID;
              } else if (league === SimPHL) {
                const i = item as TradeOption;
                playerID = i.PlayerID;
                draftPickID = i.DraftPickID;
              }
              return (
                <ManageOption
                  item={item}
                  player={proPlayerMap[playerID]}
                  pick={draftPickMap[draftPickID]}
                />
              );
            })}
        </div>

        {/* Receiving team logo — mobile: row 1 col 2 | desktop: col 4 */}
        <Border
          classes="items-center justify-center order-2 lg:order-none"
          styles={{ backgroundColor, borderColor }}
        >
          <div className="flex flex-col w-full items-center justify-center p-2 lg:p-4">
            <Logo
              url={receivingTeamLogo}
              label={receivingTeamLabel}
              variant="normal"
              classes=""
              containerClass="p-2 lg:p-4"
            />
          </div>
        </Border>

        {/* Buttons — mobile: row 3 spanning both cols | desktop: col 5 */}
        <div className="flex flex-row lg:flex-col justify-center gap-2 order-5 col-span-2 lg:col-span-1 lg:order-none">
          <Button variant="success" size="sm" onClick={accept}>
            Accept
          </Button>
          <Button variant="danger" size="sm" onClick={veto}>
            Reject
          </Button>
        </div>
      </div>
    </Border>
  );
};
