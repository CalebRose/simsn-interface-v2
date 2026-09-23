import {
  CollegeLineup,
  CollegePlayer,
  CollegeTeam,
  ProfessionalLineup,
  ProfessionalPlayer,
  ProfessionalTeam,
} from "../../../models/hockeyModels";
import { League, SimCHL } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { getHockeyLetterGrade } from "../../../_utility/getLetterGrade";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";
import { useResponsive } from "../../../_hooks/useMobile";

type HockeyPlayer = CollegePlayer | ProfessionalPlayer;
type HockeyLineup = CollegeLineup | ProfessionalLineup;
type HockeyTeam = CollegeTeam | ProfessionalTeam;

type LineupPositionKey =
  | "CenterID"
  | "Forward1ID"
  | "Forward2ID"
  | "Defender1ID"
  | "Defender2ID"
  | "GoalieID";

interface RinkSlot {
  key: LineupPositionKey;
  label: string;
  left: string;
  top: string;
  lineup?: HockeyLineup;
}

const getOverallGrade = (player: HockeyPlayer, league: League) =>
  league === SimCHL
    ? getHockeyLetterGrade(player.Overall, (player as CollegePlayer).Year)
    : player.Overall;

const getOverallColor = (overall: number) => {
  if (overall >= 90) return "text-blue-300";
  if (overall >= 80) return "text-green-300";
  if (overall >= 70) return "text-yellow-300";
  if (overall >= 60) return "text-orange-300";
  return "text-red-300";
};

const RinkBackground = () => (
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <clipPath id="ice-surface-clip">
        <path d="M 25 575 V 100 C 25 53 63 15 110 15 H 490 C 537 15 575 53 575 100 V 575 Z" />
      </clipPath>
    </defs>
    <g transform="translate(330 0) scale(1.5652173913)">
      <rect
        width="600"
        height="575"
        fill="#fff"
        clipPath="url(#ice-surface-clip)"
      />
      <path
        d="M 20 575 V 100 C 20 50 60 10 110 10 H 490 C 540 10 580 50 580 100 V 575"
        fill="none"
        stroke="#231f20"
        strokeWidth="10"
      />
      <line
        x1="25"
        y1="100"
        x2="575"
        y2="100"
        stroke="#ed1c24"
        strokeWidth="5"
      />
      <g>
        <path
          d="M 250 100 V 89 C 250 76 261 68 274 68 H 326 C 339 68 350 76 350 89 V 100"
          fill="#231f20"
        />
        <rect
          x="250"
          y="100"
          width="100"
          height="30"
          fill="#fff"
          stroke="#ed1c24"
          strokeWidth="5"
        />
      </g>
      <g fill="none" stroke="#ed1c24" strokeWidth="5">
        <circle cx="135" cy="225" r="65" />
        <circle cx="135" cy="225" r="7" fill="#ed1c24" stroke="none" />
        <circle cx="465" cy="225" r="65" />
        <circle cx="465" cy="225" r="7" fill="#ed1c24" stroke="none" />
      </g>
      <line
        x1="25"
        y1="410"
        x2="575"
        y2="410"
        stroke="#00aeef"
        strokeWidth="8"
      />
      <line
        x1="25"
        y1="570"
        x2="575"
        y2="570"
        stroke="#ed1c24"
        strokeWidth="8"
      />
      <path
        d="M 240 575 A 60 60 0 0 1 360 575"
        fill="none"
        stroke="#00aeef"
        strokeWidth="5"
      />
    </g>
  </svg>
);

interface HockeyRinkVisionProps {
  forwardLineup: HockeyLineup;
  defenseLineup: HockeyLineup;
  goalieLineup: HockeyLineup;
  rosterMap: Record<number, HockeyPlayer>;
  team?: HockeyTeam;
  league: League;
  primaryColor: string;
  accentColor: string;
  onPlayerClick?: (player: HockeyPlayer) => void;
}

export const HockeyRinkVision = ({
  forwardLineup,
  defenseLineup,
  goalieLineup,
  rosterMap,
  team,
  league,
  primaryColor,
  accentColor,
  onPlayerClick,
}: HockeyRinkVisionProps) => {
  const { isMobile, isTablet } = useResponsive();
  const logo = team?.ID ? getLogo(league, team.ID, false) : "";
  const teamName = team?.TeamName || "";

  // Goalie sits in the crease, defenders hold the faceoff circles, and
  // forwards are spread out near center ice — matching real rink geography.
  const slots: RinkSlot[] = [
    {
      key: "GoalieID",
      label: "G",
      left: "50%",
      top: "27%",
      lineup: goalieLineup,
    },
    {
      key: "Defender1ID",
      label: "LD",
      left: "34%",
      top: "39%",
      lineup: defenseLineup,
    },
    {
      key: "Defender2ID",
      label: "RD",
      left: "66%",
      top: "39%",
      lineup: defenseLineup,
    },
    {
      key: "CenterID",
      label: "C",
      left: "50%",
      top: "85%",
      lineup: forwardLineup,
    },
    {
      key: "Forward1ID",
      label: "LW",
      left: "32%",
      top: "75%",
      lineup: forwardLineup,
    },
    {
      key: "Forward2ID",
      label: "RW",
      left: "68%",
      top: "75%",
      lineup: forwardLineup,
    },
  ];

  if (isMobile || isTablet) {
    return <></>;
  }

  return (
    <section
      className="relative mb-2 w-full overflow-hidden rounded-lg border-2 p-3"
      style={{ borderColor: primaryColor }}
      aria-label="Line rink vision"
    >
      <div
        className="relative mx-auto aspect-video min-h-72 w-full max-w-285 shadow-inner"
        style={{ backgroundColor: "#0b1f33" }}
      >
        <RinkBackground />
        {slots.map((slot) => {
          const playerId = slot.lineup
            ? (slot.lineup as unknown as Record<LineupPositionKey, number>)[
                slot.key
              ]
            : 0;
          const player = playerId ? rosterMap[playerId] : undefined;
          const label = player
            ? `${slot.label}: ${player.FirstName} ${player.LastName}`
            : `${slot.label}: no player selected`;
          const overall = player ? getOverallGrade(player, league) : null;

          return (
            <div
              key={slot.key}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: slot.left, top: slot.top }}
            >
              <div
                className={`relative z-20 flex flex-col items-center justify-between rounded-lg border-4 p-2 text-center shadow-lg transition-transform hover:scale-[1.02] ${getTextColorBasedOnBg(primaryColor)} ${player && onPlayerClick ? "cursor-pointer" : ""}`}
                style={{
                  backgroundColor: primaryColor,
                  borderColor: accentColor,
                  width: "124px",
                  minHeight: "130px",
                }}
                title={label}
                aria-label={label}
                role={player && onPlayerClick ? "button" : undefined}
                tabIndex={player && onPlayerClick ? 0 : undefined}
                onClick={() => player && onPlayerClick?.(player)}
                onKeyDown={(event) => {
                  if (
                    player &&
                    onPlayerClick &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onPlayerClick(player);
                  }
                }}
              >
                <div className="absolute left-0 top-0 rounded-br-md bg-black/85 px-1.5 py-0.5 text-xs font-bold text-white">
                  {slot.label}
                </div>
                {player && (
                  <div className="absolute right-0 top-0 rounded-bl-md bg-black/85 px-1.5 py-0.5 text-xs font-bold">
                    <span
                      className={
                        typeof overall === "number"
                          ? getOverallColor(overall)
                          : "text-white"
                      }
                    >
                      {overall}
                    </span>
                  </div>
                )}
                {player ? (
                  <div className="mt-3 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded border bg-white [&_svg]:h-full [&_svg]:w-full">
                    <PlayerPicture
                      playerID={player.ID}
                      player={player}
                      team={team}
                      league={league}
                      classes="h-full w-full"
                    />
                  </div>
                ) : (
                  <div className="mt-8 text-xs font-semibold text-white">
                    Unassigned
                  </div>
                )}
                <span className="w-full leading-tight">
                  <strong className="block text-xs">
                    {player?.FirstName || "Unassigned"}
                  </strong>
                  {player && (
                    <strong className="block truncate text-sm">
                      {player.LastName}
                    </strong>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="flex h-16 items-center justify-between px-4"
        style={{
          backgroundColor: primaryColor,
          borderTop: `2px solid ${accentColor}`,
        }}
      >
        <Logo url={logo} variant="normal" />
        <h1
          className="font-sans antialiased text-2xl font-semibold uppercase text-white sm:text-3xl"
          style={{
            textShadow:
              "black 1.5px 1.5px 0px, black -1.5px -1.5px 0px, black 1.5px -1.5px 0px, black -1.5px 1.5px 0px",
          }}
        >
          {teamName}
        </h1>
        <Logo url={logo} variant="normal" />
      </div>
    </section>
  );
};
