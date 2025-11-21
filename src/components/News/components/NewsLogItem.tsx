import React, { useState, useEffect } from "react";
import { NewsLog } from "../../../models/footballModels";
import { Text } from "../../../_design/Typography";
import { Border } from "../../../_design/Borders";
import { Logo } from "../../../_design/Logo";
import { getLogo } from "../../../_utility/getLogo";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../../_constants/constants";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import { useAuthStore } from "../../../context/AuthContext";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "../../../firebase/firebase";
import { EngagementButton } from "./EngagementButton";

interface NewsLogItemProps {
  newsItem: NewsLog;
  league: League;
}

interface EngagementData {
  heart: number;
  wow: number;
  sad: number;
  happy: number;
  angry: number;
  hug: number;
  eyes: number;
  userEngagements: Record<
    string,
    "heart" | "wow" | "sad" | "happy" | "angry" | "hug" | "eyes" | null
  >;
}

export type EngagementType =
  | "heart"
  | "wow"
  | "sad"
  | "happy"
  | "angry"
  | "hug"
  | "eyes";

export const NewsLogItem: React.FC<NewsLogItemProps> = ({
  newsItem,
  league,
}) => {
  const { currentUser } = useAuthStore();
  const { cfbTeamMap, proTeamMap } = useSimFBAStore();
  const { cbbTeamMap, nbaTeamMap } = useSimBBAStore();
  const { chlTeamMap, phlTeamMap } = useSimHCKStore();

  // Engagement state
  const [engagementData, setEngagementData] = useState<EngagementData>({
    heart: 0,
    wow: 0,
    sad: 0,
    happy: 0,
    angry: 0,
    hug: 0,
    eyes: 0,
    userEngagements: {},
  });
  const [isLoadingEngagement, setIsLoadingEngagement] = useState(true);

  // Get team information based on league
  const getTeamInfo = () => {
    let team = null;
    let teamMap = null;

    switch (league) {
      case SimCFB:
        teamMap = cfbTeamMap;
        break;
      case SimNFL:
        teamMap = proTeamMap;
        break;
      case SimCBB:
        teamMap = cbbTeamMap;
        break;
      case SimNBA:
        teamMap = nbaTeamMap;
        break;
      case SimCHL:
        teamMap = chlTeamMap;
        break;
      case SimPHL:
        teamMap = phlTeamMap;
        break;
    }

    if (teamMap && newsItem.TeamID && newsItem.TeamID > 0) {
      team = teamMap[newsItem.TeamID];
    }

    return team;
  };

  const team = getTeamInfo();
  const teamLogo = team
    ? getLogo(league, newsItem.TeamID, currentUser?.isRetro)
    : null;

  // Get team name based on league and team structure
  const getTeamName = () => {
    if (!team) return null;

    // Use type assertion with any to handle different team interfaces safely
    const teamAny = team as any;

    switch (league) {
      case SimCFB:
      case SimCHL:
        return (
          teamAny.TeamName || teamAny.Team || teamAny.Mascot || teamAny.Nickname
        );
      case SimNFL:
      case SimPHL:
        return (
          teamAny.Mascot || teamAny.TeamName || teamAny.Team || teamAny.Nickname
        );
      case SimCBB:
        return (
          teamAny.Team || teamAny.TeamName || teamAny.Mascot || teamAny.Nickname
        );
      case SimNBA:
        return (
          teamAny.Nickname || teamAny.TeamName || teamAny.Team || teamAny.Mascot
        );
      default:
        return (
          teamAny.TeamName || teamAny.Team || teamAny.Mascot || teamAny.Nickname
        );
    }
  };

  const teamName = getTeamName();

  // Get user's team ID for current league
  const getUserTeamId = () => {
    if (!currentUser) return null;

    switch (league) {
      case SimCFB:
        return currentUser.teamId;
      case SimNFL:
        return currentUser.NFLTeamID;
      case SimCBB:
        return currentUser.cbb_id;
      case SimNBA:
        return currentUser.NBATeamID;
      case SimCHL:
        return currentUser.CHLTeamID;
      case SimPHL:
        return currentUser.PHLTeamID;
      default:
        return null;
    }
  };

  const userTeamId = getUserTeamId();

  // Load engagement data from Firebase
  useEffect(() => {
    const loadEngagementData = async () => {
      if (!newsItem.ID) return;

      try {
        const docRef = doc(
          firestore,
          "newsEngagement",
          league,
          "messages",
          newsItem.ID.toString()
        );
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as EngagementData;
          setEngagementData(data);
        } else {
          // Initialize document if it doesn't exist
          const initialData: EngagementData = {
            heart: 0,
            wow: 0,
            sad: 0,
            happy: 0,
            angry: 0,
            hug: 0,
            eyes: 0,
            userEngagements: {},
          };
          await setDoc(docRef, initialData);
          setEngagementData(initialData);
        }
      } catch (error) {
        console.error("Error loading engagement data:", error);
      } finally {
        setIsLoadingEngagement(false);
      }
    };

    loadEngagementData();
  }, [newsItem.ID, league]);

  // Handle engagement button clicks
  const handleEngagement = async (type: EngagementType) => {
    if (!userTeamId || !newsItem.ID) return;

    const userKey = `${userTeamId}`;
    const currentUserEngagement = engagementData.userEngagements[userKey];

    try {
      const docRef = doc(
        firestore,
        "newsEngagement",
        league,
        "messages",
        newsItem.ID.toString()
      );

      let updates: any = {};
      let newUserEngagements = { ...engagementData.userEngagements };

      if (currentUserEngagement === type) {
        // User is toggling off the same button
        updates[type] = increment(-1);
        newUserEngagements[userKey] = null;
      } else if (currentUserEngagement && currentUserEngagement !== type) {
        // User is switching from one engagement to another
        updates[currentUserEngagement] = increment(-1);
        updates[type] = increment(1);
        newUserEngagements[userKey] = type;
      } else {
        // User is engaging for the first time
        updates[type] = increment(1);
        newUserEngagements[userKey] = type;
      }

      updates.userEngagements = newUserEngagements;

      await updateDoc(docRef, updates);

      // Update local state optimistically
      setEngagementData((prev) => ({
        ...prev,
        heart: prev.heart + (updates.heart?._operand || 0),
        wow: prev.wow + (updates.wow?._operand || 0),
        sad: prev.sad + (updates.sad?._operand || 0),
        happy: prev.happy + (updates.happy?._operand || 0),
        angry: prev.angry + (updates.angry?._operand || 0),
        hug: prev.hug + (updates.hug?._operand || 0),
        eyes: prev.eyes + (updates.eyes?._operand || 0),
        userEngagements: newUserEngagements,
      }));
    } catch (error) {
      console.error("Error updating engagement:", error);
    }
  };

  // Get current user's engagement status
  const getCurrentUserEngagement = () => {
    if (!userTeamId) return null;
    return engagementData.userEngagements[`${userTeamId}`] || null;
  };

  const currentEngagement = getCurrentUserEngagement();

  // Format the date
  const formatDate = (timeObj: any) => {
    try {
      // Handle Time object or string
      if (!timeObj) return "";
      const dateString =
        typeof timeObj === "string" ? timeObj : timeObj.toString();
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Get message type styling
  const getMessageTypeStyle = (messageType: string) => {
    switch (messageType?.toLowerCase()) {
      case "recruiting":
        return "text-blue-400 bg-blue-900/20 border-blue-500/30";
      case "transfer":
        return "text-yellow-400 bg-yellow-900/20 border-yellow-500/30";
      case "injury":
        return "text-red-400 bg-red-900/20 border-red-500/30";
      case "signing":
        return "text-green-400 bg-green-900/20 border-green-500/30";
      case "coaching":
        return "text-purple-400 bg-purple-900/20 border-purple-500/30";
      case "draft":
        return "text-orange-400 bg-orange-900/20 border-orange-500/30";
      default:
        return "text-gray-400 bg-gray-900/20 border-gray-500/30";
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-700/50 rounded-xl max-[768px]:rounded-lg max-[768px]:p-3 p-4 max-[768px]:mb-2 mb-3 hover:bg-gray-800/60 transition-all duration-200 hover:border-gray-600/50">
      <div className="flex max-[768px]:gap-2 gap-3">
        {/* Team Logo - Avatar Style */}
        {teamLogo && team ? (
          <div className="flex-shrink-0">
            <div className="max-[768px]:w-8 max-[768px]:h-8 w-12 h-12 rounded-full overflow-hidden bg-gray-800 border border-gray-600 flex items-center justify-center">
              <Logo url={teamLogo} classes="w-full h-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 max-[768px]:w-8 max-[768px]:h-8 w-12 h-12 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 max-[768px]:text-xs text-sm font-bold">
              {newsItem.MessageType?.charAt(0) || "N"}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header - Username style */}
          <div className="flex items-center max-[768px]:gap-1 gap-2 max-[768px]:mb-1 mb-2 max-[768px]:flex-wrap">
            {/* Team Name */}
            {teamName && (
              <Text
                variant="body"
                classes="font-bold text-white hover:text-blue-400 cursor-pointer max-[768px]:text-sm"
              >
                {teamName}
              </Text>
            )}

            {/* Message Type Badge */}
            {newsItem.MessageType && (
              <span
                className={`max-[768px]:px-1 max-[768px]:py-0.5 max-[768px]:text-xs px-2 py-0.5 rounded-md text-xs font-medium ${getMessageTypeStyle(
                  newsItem.MessageType
                )}`}
              >
                {newsItem.MessageType}
              </span>
            )}

            <span className="text-gray-500 max-[768px]:hidden">•</span>

            {/* Time info */}
            <div className="flex items-center max-[768px]:gap-0.5 gap-1 text-gray-500">
              {newsItem.Week && (
                <span className="max-[768px]:text-xs text-sm">
                  Week {newsItem.Week}
                </span>
              )}
              {newsItem.Week && newsItem.CreatedAt && (
                <span className="max-[768px]:text-xs text-sm">•</span>
              )}
              {newsItem.CreatedAt && (
                <span className="max-[768px]:text-xs text-sm">
                  {formatDate(newsItem.CreatedAt)}
                </span>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="text-gray-200 max-[768px]:text-sm max-[768px]:leading-snug text-base leading-relaxed">
            {newsItem.Message}
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center max-[768px]:gap-2 gap-3 max-[768px]:mt-2 max-[768px]:pt-1.5 mt-3 pt-2 border-t border-gray-700/30 flex-wrap">
            <EngagementButton
              type="heart"
              emoji="❤️"
              count={engagementData.heart}
              isActive={currentEngagement === "heart"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("heart")}
              activeColor="text-red-500"
              hoverColor="hover:text-red-400"
            />

            <EngagementButton
              type="wow"
              emoji="😮"
              count={engagementData.wow}
              isActive={currentEngagement === "wow"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("wow")}
              activeColor="text-yellow-500"
              hoverColor="hover:text-yellow-400"
            />

            <EngagementButton
              type="happy"
              emoji="😂"
              count={engagementData.happy}
              isActive={currentEngagement === "happy"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("happy")}
              activeColor="text-yellow-500"
              hoverColor="hover:text-yellow-400"
            />

            <EngagementButton
              type="sad"
              emoji="😢"
              count={engagementData.sad}
              isActive={currentEngagement === "sad"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("sad")}
              activeColor="text-blue-500"
              hoverColor="hover:text-blue-400"
            />

            <EngagementButton
              type="angry"
              emoji="😡"
              count={engagementData.angry}
              isActive={currentEngagement === "angry"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("angry")}
              activeColor="text-red-600"
              hoverColor="hover:text-red-500"
            />

            <EngagementButton
              type="hug"
              emoji="🤗"
              count={engagementData.hug}
              isActive={currentEngagement === "hug"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("hug")}
              activeColor="text-pink-500"
              hoverColor="hover:text-pink-400"
            />

            <EngagementButton
              type="eyes"
              emoji="👀"
              count={engagementData.eyes}
              isActive={currentEngagement === "eyes"}
              isDisabled={isLoadingEngagement || !userTeamId}
              onClick={() => handleEngagement("eyes")}
              activeColor="text-purple-500"
              hoverColor="hover:text-purple-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
