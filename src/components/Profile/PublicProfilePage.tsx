import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SimCFB,
  SimNFL,
  SimCBB,
  SimNBA,
  SimCHL,
  SimPHL,
  SimCollegeBaseball,
  SimMLB,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { Logo } from "../../_design/Logo";
import { Text } from "../../_design/Typography";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { Achievement } from "../../models/forumModels";
import { ForumService } from "../../_services/forumService";
import { useAuthStore } from "../../context/AuthContext";
import { useForumStore } from "../../context/ForumContext";
import { getUserLogoUrl } from "../../_utility/getLogo";
import routes from "../../_constants/routes";

const MEDIA_POINT_ENTRIES: { label: string; key: keyof CurrentUser }[] = [
  { label: SimCFB, key: "SimCFBMediaPoints" },
  { label: SimNFL, key: "SimNFLMediaPoints" },
  { label: SimCBB, key: "SimCBBMediaPoints" },
  { label: SimNBA, key: "SimNBAMediaPoints" },
  { label: SimCHL, key: "SimCHLMediaPoints" },
  { label: SimPHL, key: "SimPHLMediaPoints" },
  { label: "SimCBL", key: "SimCBLMediaPoints" },
  { label: SimMLB, key: "SimMLBMediaPoints" },
];

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { userMap } = useForumStore();

  const [viewedUser, setViewedUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);

    // Optimistically populate from userMap while the fetch is in-flight
    const fromMap = Object.values(userMap).find((u) => u.username === username);
    if (fromMap) setViewedUser(fromMap);

    ForumService.GetUserByUsername(username)
      .then((user) => {
        if (!cancelled) setViewedUser(user);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, userMap]);

  useEffect(() => {
    if (!viewedUser?.id) return;
    ForumService.GetAchievementsByUser(viewedUser.id)
      .then(setAchievements)
      .catch(console.error);
  }, [viewedUser?.id]);

  const logoUrl = useMemo(() => {
    if (!viewedUser) return "";
    return getUserLogoUrl(viewedUser);
  }, [viewedUser]);

  const leagues = useMemo(() => {
    if (!viewedUser) return [];
    const result: { label: string; key: string }[] = [];
    if (viewedUser.teamId && viewedUser.teamId > 0)
      result.push({ label: SimCFB, key: SimCFB });
    if (viewedUser.NFLTeamID && viewedUser.NFLTeamID > 0)
      result.push({ label: SimNFL, key: SimNFL });
    if (viewedUser.cbb_id && viewedUser.cbb_id > 0)
      result.push({ label: SimCBB, key: SimCBB });
    if (viewedUser.NBATeamID && viewedUser.NBATeamID > 0)
      result.push({ label: SimNBA, key: SimNBA });
    if (viewedUser.CHLTeamID && viewedUser.CHLTeamID > 0)
      result.push({ label: SimCHL, key: SimCHL });
    if (viewedUser.PHLTeamID && viewedUser.PHLTeamID > 0)
      result.push({ label: SimPHL, key: SimPHL });
    if (viewedUser.CollegeBaseballOrgID && viewedUser.CollegeBaseballOrgID > 0)
      result.push({ label: "SimCBL", key: SimCollegeBaseball });
    if (viewedUser.MLBOrgID && viewedUser.MLBOrgID > 0)
      result.push({ label: SimMLB, key: SimMLB });
    return result;
  }, [viewedUser]);

  const top5Users = useMemo(() => {
    if (!viewedUser?.top5UserIds) return [];
    return viewedUser.top5UserIds
      .map((id) => userMap[id])
      .filter((u): u is CurrentUser => !!u);
  }, [viewedUser, userMap]);

  const joinDate = useMemo(() => {
    if (!viewedUser?.createdAt) return "—";
    return new Date(viewedUser.createdAt.seconds * 1000).toLocaleDateString(
      undefined,
      { year: "numeric", month: "long", day: "numeric" },
    );
  }, [viewedUser]);

  if (!loading && !viewedUser) {
    return (
      <PageContainer direction="col" isLoading={false} title="Profile">
        <div className="text-center py-16">
          <Text variant="h5" classes="text-gray-400">
            User not found.
          </Text>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      direction="col"
      isLoading={loading && !viewedUser}
      title={`${username}'s Profile`}
    >
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {/* Profile Header */}
        <Border classes="w-full p-4">
          <div className="flex items-start gap-4">
            <Logo url={logoUrl} variant="large" />
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Text variant="h4">{viewedUser?.username ?? username}</Text>
                {viewedUser?.selectedTitle && (
                  <span className="text-amber-400 font-semibold text-sm">
                    {viewedUser.selectedTitle}
                  </span>
                )}
              </div>
              <Text variant="body-small" classes="text-gray-400 mt-0.5">
                Member since {joinDate}
              </Text>
              <div className="flex gap-6 mt-2">
                <div>
                  <span className="text-white font-bold text-lg">
                    {viewedUser?.forumPostCount ?? 0}
                  </span>
                  <span className="text-gray-400 text-xs ml-1">Posts</span>
                </div>
                <div>
                  <span className="text-white font-bold text-lg">
                    {viewedUser?.forumReactionCount ?? 0}
                  </span>
                  <span className="text-gray-400 text-xs ml-1">
                    Reactions received
                  </span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(routes.USER)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Border>

        {/* Leagues */}
        {leagues.length > 0 && (
          <Border classes="w-full p-4">
            <Text variant="h6" classes="mb-2">
              Leagues
            </Text>
            <div className="flex flex-wrap gap-2">
              {leagues.map((l) => (
                <span
                  key={l.key}
                  className="bg-gray-700 rounded-full px-3 py-1 text-sm text-gray-200"
                >
                  {l.label}
                </span>
              ))}
            </div>
          </Border>
        )}

        {/* Top 5 */}
        {top5Users.length > 0 && (
          <Border classes="w-full p-4">
            <Text variant="h6" classes="mb-2">
              Top 5
            </Text>
            <div className="flex gap-3 flex-wrap">
              {top5Users.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
                >
                  <span className="text-gray-500 text-xs font-bold">
                    #{i + 1}
                  </span>
                  <span className="text-white font-semibold text-sm">
                    {u.username}
                  </span>
                </div>
              ))}
            </div>
          </Border>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <Border classes="w-full p-4">
            <Text variant="h6" classes="mb-2">
              Achievements
            </Text>
            <div className="space-y-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 bg-gray-800 rounded p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Text variant="body-small" classes="font-semibold">
                        {a.title}
                      </Text>
                      <span className="text-xs text-gray-500 bg-gray-700 rounded px-1.5 py-0.5">
                        {a.league}
                      </span>
                    </div>
                    <Text variant="xs" classes="text-gray-400 mt-0.5">
                      {a.description}
                    </Text>
                    <Text variant="xs" classes="text-gray-500 mt-0.5">
                      Season {a.seasonId}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Border>
        )}

        {/* Media Points */}
        <Border classes="w-full p-4">
          <Text variant="h6" classes="mb-2">
            Media Points
          </Text>
          <div className="grid grid-cols-4 gap-2">
            {MEDIA_POINT_ENTRIES.map(({ label, key }) => (
              <div
                key={String(key)}
                className="flex flex-col items-center rounded p-2 bg-black/20 border border-white/10"
              >
                <Text variant="small" classes="font-semibold">
                  {label}
                </Text>
                <Text variant="h6" classes="text-amber-400">
                  {(viewedUser?.[key] as number | undefined) ?? 0}
                </Text>
              </div>
            ))}
          </div>
        </Border>
      </div>
    </PageContainer>
  );
};
