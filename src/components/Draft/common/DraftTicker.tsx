import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { getLogo } from "../../../_utility/getLogo";
import {
  DraftLeague,
  DraftPick,
  Draftee,
  TeamColors,
  getLeagueConstant,
  isNFLLeague,
} from "./types";
import {
  DrafteeInfoType,
  ModalAction,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";

interface DraftTickerProps {
  recentPicks: Array<{
    pick: DraftPick;
    player?: Draftee;
  }>;
  onPickClick?: (action: ModalAction, player: Draftee) => void;
  teamColors: TeamColors;
  backgroundColor: string;
  league: DraftLeague;
  draftablePlayerMap: Record<number, Draftee>;
}

// ---------------------------------------------------------------------------
// PickCard — defined at module level so its identity is stable across renders.
// Defining it inside DraftTicker would make React treat it as a new component
// type on every render, causing every card to unmount/remount and reset the
// slide-in animation and the scroll position.
// ---------------------------------------------------------------------------

interface PickCardProps {
  pickData: { pick: DraftPick; player?: Draftee };
  index: number;
  league: DraftLeague;
  leagueConstant: string;
  draftablePlayerMap: Record<number, Draftee>;
  teamColors: TeamColors;
  isHovered: boolean;
  onHoverEnter: (id: number) => void;
  onHoverLeave: () => void;
  onPickClick?: (action: ModalAction, player: Draftee) => void;
}

const PickCard: FC<PickCardProps> = ({
  pickData,
  index,
  league,
  leagueConstant,
  draftablePlayerMap,
  teamColors,
  isHovered,
  onHoverEnter,
  onHoverLeave,
  onPickClick,
}) => {
  const { pick } = pickData;
  const teamLogo = getLogo(league, pick.TeamID, false);
  const isNew = index === 0;

  const draftee = useMemo(() => {
    if (!draftablePlayerMap) return undefined;
    if (league === SimPHL) {
      return draftablePlayerMap[pick.DrafteeID];
    }
    return draftablePlayerMap[pick.SelectedPlayerID];
  }, [pick, draftablePlayerMap, league]);

  const drafteeName = useMemo(
    () => (draftee ? `${draftee.FirstName} ${draftee.LastName}` : ""),
    [draftee],
  );

  const drafteePosition = useMemo(() => {
    if (!draftee) return "";
    if (league === SimNFL) {
      return `${draftee.Position}${draftee.PositionTwo.length > 0 ? `/${draftee.PositionTwo}` : ""}`;
    }
    return `${draftee.Position}`;
  }, [draftee, league]);

  const drafteeArchetype = useMemo(() => {
    if (!draftee) return "";
    if (league === SimNFL) {
      return `${draftee.Archetype}${draftee.ArchetypeTwo.length > 0 ? `/${draftee.ArchetypeTwo}` : ""}`;
    }
    return draftee.Archetype;
  }, [draftee, league]);

  const drafteeCollege = useMemo(
    () => (draftee ? draftee.College : ""),
    [draftee],
  );

  const viewPlayer = useCallback(() => {
    if (onPickClick && draftee) {
      onPickClick(DrafteeInfoType, draftee);
    }
  }, [onPickClick, draftee]);

  return (
    <div
      className={`
        flex-shrink-0 w-[35rem] mx-2 cursor-pointer transition-all duration-300
        ${isHovered ? "transform scale-105" : ""}
        ${isNew ? "animate-slideIn" : ""}
      `}
      style={{
        transformOrigin: "center",
        willChange: isHovered ? "transform" : "auto",
        contain: "layout style",
      }}
      onClick={viewPlayer}
      onMouseEnter={() => onHoverEnter(pick.ID)}
      onMouseLeave={onHoverLeave}
    >
      <Border
        classes={`
          p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-2
          ${isNew ? "ring-2 ring-blue-500 ring-opacity-50" : ""}
        `}
        styles={{
          borderColor: isHovered ? teamColors.primary : "#374151",
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold
              ${isNew ? "bg-blue-500 text-white animate-pulse" : "bg-gray-600 text-gray-300"}
            `}
            >
              {pick.DraftNumber}
            </div>
          </div>

          {/* Team logo */}
          <img
            src={teamLogo}
            alt={pick.Team}
            className="w-10 h-10 object-contain"
          />
          <div className="flex-1 min-w-0">
            <Text variant="body" classes="text-white font-semibold truncate">
              {drafteeName || "Selecting..."}
            </Text>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-400">{pick.Team}</span>
              {drafteePosition && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-blue-400 font-semibold">
                    {drafteeArchetype} {drafteePosition}
                  </span>
                </>
              )}
              {drafteeCollege && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 truncate">
                    {drafteeCollege}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs text-gray-500 uppercase">
              R{pick.DraftRound}
            </span>
          </div>
        </div>
        {pick.PreviousTeamID > 0 && pick.PreviousTeamID !== pick.TeamID && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <Text variant="xs" classes="text-yellow-500">
              Traded from {pick.PreviousTeam}
            </Text>
          </div>
        )}
        {pick.PreviousTeamID === 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <Text variant="xs" classes="text-green-500">
              Original Pick
            </Text>
          </div>
        )}
      </Border>
    </div>
  );
};

export const DraftTicker: FC<DraftTickerProps> = ({
  recentPicks,
  onPickClick,
  teamColors,
  backgroundColor,
  league,
  draftablePlayerMap,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [hoveredPick, setHoveredPick] = useState<number | null>(null);

  const leagueConstant = getLeagueConstant(league);

  useEffect(() => {
    if (isAutoScrolling && scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const scrollAmount = 1;

      const scroll = () => {
        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += scrollAmount;
        }
      };

      const intervalId = setInterval(scroll, 50);
      return () => clearInterval(intervalId);
    }
  }, [isAutoScrolling]);

  const handleMouseEnter = () => setIsAutoScrolling(false);
  const handleMouseLeave = () => setIsAutoScrolling(true);

  const handleHoverEnter = useCallback((id: number) => setHoveredPick(id), []);
  const handleHoverLeave = useCallback(() => setHoveredPick(null), []);

  return (
    <div
      className="relative rounded-lg p-4 border-2 h-full"
      style={{ backgroundColor, borderColor: teamColors.primary }}
    >
      <div className="flex items-center justify-between mb-2 px-4">
        <Text variant="h5" classes="text-white font-semibold">
          Recent Picks
        </Text>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Text variant="xs" classes="text-gray-400 uppercase">
            Live
          </Text>
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ contain: "layout style" }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"
          style={{ contain: "strict" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"
          style={{ contain: "strict" }}
        />
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            scrollBehavior: "smooth",
            contain: "layout style",
            willChange: isAutoScrolling ? "scroll-position" : "auto",
          }}
        >
          {recentPicks.length > 0 ? (
            recentPicks.map((pickData, index) => (
              <PickCard
                key={pickData.pick.ID}
                pickData={pickData}
                index={index}
                league={league}
                leagueConstant={leagueConstant}
                draftablePlayerMap={draftablePlayerMap}
                teamColors={teamColors}
                isHovered={hoveredPick === pickData.pick.ID}
                onHoverEnter={handleHoverEnter}
                onHoverLeave={handleHoverLeave}
                onPickClick={onPickClick}
              />
            ))
          ) : (
            <div className="w-full text-center py-8">
              <Text variant="body" classes="text-gray-500">
                No picks have been made yet
              </Text>
            </div>
          )}
          {recentPicks.length > 0 &&
            recentPicks.length < 10 &&
            recentPicks.map((pickData, index) => (
              <PickCard
                key={`dup-${pickData.pick.ID}`}
                pickData={pickData}
                index={recentPicks.length + index}
                league={league}
                leagueConstant={leagueConstant}
                draftablePlayerMap={draftablePlayerMap}
                teamColors={teamColors}
                isHovered={hoveredPick === pickData.pick.ID}
                onHoverEnter={handleHoverEnter}
                onHoverLeave={handleHoverLeave}
                onPickClick={onPickClick}
              />
            ))}
        </div>
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
          contain: layout style;
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
};
