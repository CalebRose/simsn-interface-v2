import { CollegeLineup, CollegePlayer, NBALineup, NBAPlayer } from "../../../models/basketballModels";
import { League } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { Logo } from "../../../_design/Logo";
import PlayerPicture from "../../../_utility/usePlayerFaces";
import { SimCBB } from "../../../_constants/constants";
import { getCBBLetterGrade } from "../../../_utility/getLetterGrade";
import { getYear } from "../../../_utility/getYear";
import { getRatingColor } from "../FootballGameplan/Utils/UIUtils";
import { getTextColorBasedOnBg } from "../../../_utility/getBorderClass";

interface BasketballCourtVisionProps {
  lineupFormation: string[];
  selectedTeamLineups: CollegeLineup[] | NBALineup[];
  selectedRosterMap: Record<number, CollegePlayer | NBAPlayer>;
  team: any;
  league: League;
  primaryColor: string;
  accentColor: string;
  onPlayerClick?: (player: CollegePlayer | NBAPlayer) => void;
}

const courtPositions = [
  { left: "55%", top: "95%" },
  { left: "18%", top: "75%" },
  { left: "82%", top: "60%" },
  { left: "28%", top: "40%" },
  { left: "65%", top: "30%" },
];

const shortName = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}. ${lastName}`;

const isWhiteColor = (color: string) => {
  const normalized = color.trim().toLowerCase().replace(/\s+/g, "");
  return ["#fff", "#ffffff", "white", "rgb(255,255,255)", "rgba(255,255,255,1)"].includes(normalized);
};

const getProOverallColor = (overall: number) => {
  if (overall >= 40) return "text-blue-300";
  if (overall >= 35) return "text-green-300";
  if (overall >= 30) return "text-yellow-300";
  if (overall >= 25) return "text-orange-300";
  return "text-red-300";
};

export const BasketballCourtVision = ({
  lineupFormation,
  selectedTeamLineups,
  selectedRosterMap,
  team,
  league,
  primaryColor,
  accentColor,
  onPlayerClick,
}: BasketballCourtVisionProps) => {
  const logo = team?.ID ? getLogo(league, team.ID, false) : "";
  const teamName = team?.Team || team?.TeamName || team?.Mascot || "";

  return (
  <section
    className="relative mb-2 w-full overflow-hidden rounded-lg border-2 p-3"
    style={{ borderColor: primaryColor }}
    aria-label="First string half-court vision"
  >
    <div
      className="relative mx-auto aspect-[16/9] min-h-72 w-full max-w-[1140px] shadow-inner"
      style={{ backgroundColor: "#CB9C5D", transform: "rotate(180deg)" }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g id="hardwood-planks" data-name="Hardwood plank outlines" fill="none" stroke="#8f6238" strokeWidth="0.25" opacity="0.42">
          {[3.5,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72,75,78,81,84,87,90,93,96,98].map((x) => (
            <line key={`plank-column-${x}`} x1={x} y1="1" x2={x} y2="99" />
          ))}
          <path d="M 7 22 H 15 M 24 41 H 34 M 45 16 H 55 M 66 62 H 76 M 85 34 H 93 M 15 78 H 24 M 34 57 H 45 M 55 83 H 66 M 76 25 H 85" />
        </g>
        <rect id="court-boundary" data-name="Court boundary" x="1" y="1" width="98" height="98" fill="none" stroke="black" strokeWidth="1.2" />
        <path id="three-point-line" data-name="Three-point line" d="M 18.75 1 L 18.75 43.75 A 31.25 31.25 0 0 0 81.25 43.75 L 81.25 1" fill="none" stroke="black" strokeWidth="1.2" />
        <rect id="paint-key" data-name="Paint / key" x="35" y="1" width="30" height="50" fill="none" stroke="black" strokeWidth="1.2" />
        {/*<rect id="paint-key" data-name="Paint / key" x="35" y="1" width="30" height="50" fill={isWhiteColor(primaryColor) ? accentColor : primaryColor} stroke="black" strokeWidth="1.2" />*/}
        {/*<path id="free-throw-lane-lines" data-name="Free-throw lane lines" d="M 43.75 1 L 43.75 16 A 6.25 6.25 0 0 0 56.25 16 L 56.25 1" fill="none" stroke="black" strokeWidth="1.2" />*/}
        <circle id="free-throw-circle" data-name="Free-throw circle" cx="50" cy="51" r="10" fill="none" stroke="black" strokeWidth="1.2" />
        <circle id="basket" data-name="Basket" cx="50" cy="8.5" r="2" fill="none" stroke="#f97316" strokeWidth="1.2" />
        <line id="backboard" data-name="Backboard" x1="43" y1="5" x2="57" y2="5" stroke="white" strokeWidth="1.2" />
      </svg>
      {/*<div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-white">First String Starters</div>*/}
      {lineupFormation.map((position, index) => {
        const lineup = selectedTeamLineups[index];
        const playerId = lineup?.FirstStringID;
        const player = playerId ? selectedRosterMap[playerId] : undefined;
        const location = courtPositions[index];
        const label = player ? `${position}: ${player.FirstName} ${player.LastName}` : `${position}: no player selected`;
        return (
          <div key={`${position}-${index}`} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: location.left, top: location.top, transform: "translate(-50%, -50%) rotate(180deg)" }}>
            <div className={`relative z-20 flex flex-col items-center justify-between rounded-lg border-4 p-2 text-center shadow-lg transition-transform hover:scale-[1.02] ${getTextColorBasedOnBg(primaryColor)} ${player && onPlayerClick ? "cursor-pointer" : ""}`} style={{ backgroundColor: primaryColor, borderColor: accentColor, width: "132px", minHeight: "142px" }} title={label} aria-label={label} role={player && onPlayerClick ? "button" : undefined} tabIndex={player && onPlayerClick ? 0 : undefined} onClick={() => player && onPlayerClick?.(player)} onKeyDown={(event) => { if (player && onPlayerClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onPlayerClick(player); } }}>
              <div className="absolute left-0 top-0 rounded-br-md bg-black/85 px-1.5 py-0.5 text-xs font-bold text-white">{position}</div>
              {player && (
                <div className="absolute right-0 top-0 rounded-bl-md bg-black/85 px-1.5 py-0.5 text-xs font-bold">
                  <span className={league === SimCBB ? getRatingColor(getCBBLetterGrade(player.Overall, player.Year), league) : getProOverallColor(player.Overall)}>
                    {league === SimCBB ? getCBBLetterGrade(player.Overall, player.Year) : player.Overall}
                  </span>
                </div>
              )}
              {player && league === SimCBB && <div className="absolute right-0 top-6 rounded-l-md bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-white">{getYear(player.Year, player.IsRedshirt)}</div>}
              {player ? (
                <div className="mt-3 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border bg-white [&_svg]:h-full [&_svg]:w-full">
                  <PlayerPicture playerID={player.ID} player={player} team={team} league={league} classes="h-full w-full" />
                </div>
              ) : (
                <div className="mt-8 text-xs font-semibold text-white">Unassigned</div>
              )}
              <span className="w-full leading-tight">
                <strong className="block text-xs">{player?.FirstName || "Unassigned"}</strong>
                {player && <strong className="block truncate text-sm">{player.LastName}</strong>}
              </span>
            </div>
          </div>
        );
      })}
    </div>
    <div className="flex h-20 items-center justify-between px-4" style={{ backgroundColor: primaryColor, borderTop: `2px solid ${accentColor}` }}>
      <Logo url={logo} variant="medium" />
      <h1 className="font-sans antialiased text-4xl font-semibold uppercase text-white sm:text-5xl" style={{ textShadow: "black 1.5px 1.5px 0px, black -1.5px -1.5px 0px, black 1.5px -1.5px 0px, black -1.5px 1.5px 0px" }}>
        {teamName}
      </h1>
      <Logo url={logo} variant="medium" />
    </div>
  </section>
  );
};
