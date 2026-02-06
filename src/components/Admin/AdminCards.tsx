import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
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
                {weeksMissed}
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
  sendingTradeOptions: TradeOption[];
  receivingTeamLabel: string;
  receivingTradeOptions: TradeOption[];
  sendingTeamLogo: string;
  receivingTeamLogo: string;
  accept: () => Promise<void>;
  veto: () => Promise<void>;
  backgroundColor?: string;
  borderColor?: string;
  proPlayerMap: any;
  draftPickMap: any;
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
}) => {
  return (
    <>
      <Border classes={`w-full px-3`}>
        <div className="grid grid-cols-5 items-center h-[12rem] w-full space-x-2">
          <Border
            classes="items-center justify-center mt-1"
            styles={{ backgroundColor, borderColor }}
          >
            <div className="flex flex-col w-full items-center justify-center p-4">
              <Logo
                url={sendingTeamLogo}
                label={sendingTeamLabel}
                variant="normal"
                classes=""
                containerClass="p-4"
              />
            </div>
          </Border>
          <div className="flex flex-col justify-center p-2 flex-1">
            {sendingTradeOptions &&
              sendingTradeOptions.map((item) => (
                <ManageOption
                  item={item}
                  player={proPlayerMap[item.PlayerID]}
                  pick={draftPickMap[item.DraftPickID]}
                />
              ))}
          </div>
          <div className="flex flex-col justify-center p-2 flex-1">
            {receivingTradeOptions &&
              receivingTradeOptions.map((item) => (
                <ManageOption
                  item={item}
                  player={proPlayerMap[item.PlayerID]}
                  pick={draftPickMap[item.DraftPickID]}
                />
              ))}
          </div>
          <Border
            classes="items-center justify-center mt-1"
            styles={{ backgroundColor, borderColor }}
          >
            <div className="flex flex-col w-full items-center justify-center p-4">
              <Logo
                url={receivingTeamLogo}
                label={receivingTeamLabel}
                variant="normal"
                classes=""
                containerClass="p-4"
              />
            </div>
          </Border>
          <div className="flex flex-col justify-center space-y-2">
            <Button variant="success" size="sm" onClick={accept}>
              Accept
            </Button>
            <Button variant="danger" size="sm" onClick={veto}>
              Reject
            </Button>
          </div>
        </div>
      </Border>
    </>
  );
};
