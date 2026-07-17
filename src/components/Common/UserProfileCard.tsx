import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useForumStore } from "../../context/ForumContext";
import { useAuthStore } from "../../context/AuthContext";
import { ForumService } from "../../_services/forumService";
import { Thread, Post } from "../../models/forumModels";
import { Modal } from "../../_design/Modal";
import { Text } from "../../_design/Typography";
import { Button } from "../../_design/Buttons";
import routes from "../../_constants/routes";

interface UserProfileCardProps {
  uid: string;
  username: string;
  logoUrl?: string;
  children: ReactNode;
}

const LEAGUE_FIELDS: { key: keyof CurrentUser; label: string }[] = [
  { key: "teamId", label: "SimCFB" },
  { key: "NFLTeamID", label: "SimNFL" },
  { key: "cbb_id", label: "SimCBB" },
  { key: "NBATeamID", label: "SimNBA" },
  { key: "CHLTeamID", label: "SimCHL" },
  { key: "PHLTeamID", label: "SimPHL" },
  { key: "CollegeBaseballOrgID", label: "SimCBL" },
  { key: "MLBOrgID", label: "SimMLB" },
];

function formatActivityTs(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  uid,
  username,
  logoUrl,
  children,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { userMap, getOrFetchUserActivity } = useForumStore();

  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"threads" | "posts">("threads");
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const user = useMemo<CurrentUser | null>(
    () => userMap[uid] ?? null,
    [userMap, uid],
  );

  // Lazy-load recent activity when the modal first opens via the shared
  // ForumContext cache — avoids duplicate Firestore reads across components.
  useEffect(() => {
    if (!isModalOpen) return;
    let cancelled = false;
    setActivityLoading(true);
    getOrFetchUserActivity(uid, 10)
      .then(({ threads, posts }) => {
        if (cancelled) return;
        setRecentThreads(threads);
        setRecentPosts(posts);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setActivityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isModalOpen, uid, getOrFetchUserActivity]);

  const handleMouseEnter = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPopoverPos({ top: rect.top, left: rect.left });
      }
      setIsHovered(true);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setIsModalOpen(true);
  }, []);

  const handleViewProfile = useCallback(() => {
    setIsModalOpen(false);
    navigate(routes.USER.replace(":username", username));
  }, [navigate, username]);

  const joinDate = useMemo(() => {
    if (!user?.createdAt) return "—";
    return new Date(user.createdAt.seconds * 1000).toLocaleDateString(
      undefined,
      { year: "numeric", month: "short" },
    );
  }, [user]);

  const leagues = useMemo(() => {
    if (!user) return [];
    return LEAGUE_FIELDS.filter(
      ({ key }) => user[key] && (user[key] as number) > 0,
    ).map(({ label }) => label);
  }, [user]);

  const top5Users = useMemo(() => {
    if (!user?.top5UserIds) return [];
    return user.top5UserIds
      .map((id) => userMap[id])
      .filter((u): u is CurrentUser => !!u);
  }, [user, userMap]);

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block cursor-pointer text-start"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}

        {/* Mini hover popover — rendered via portal to escape overflow clipping */}
        {isHovered &&
          createPortal(
            <div
              className="fixed z-9999 w-60 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 pointer-events-none"
              style={{
                top: popoverPos.top,
                left: popoverPos.left,
                transform: "translateY(calc(-100% - 8px))",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-8 h-8 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 shrink-0" />
                )}
                <div>
                  <div className="font-semibold text-white text-sm">
                    {username}
                  </div>
                  {user?.selectedTitle && (
                    <div className="text-xs text-amber-400">
                      {user.selectedTitle}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-xs space-y-1">
                {user?.status && user.status.length > 0 && (
                  <div className="text-gray-300 italic">{user.status}</div>
                )}
                <div>
                  Joined: <span className="text-gray-300">{joinDate}</span>
                </div>
                <div>
                  Posts:{" "}
                  <span className="text-white">
                    {user?.forumPostCount ?? 0}
                  </span>
                </div>
                {leagues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {leagues.map((l) => (
                      <span
                        key={l}
                        className="bg-gray-700 rounded px-1 py-0.5 text-xs text-gray-200"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 text-xs text-blue-400 font-semibold">
                Click for full profile
              </div>
            </div>,
            document.body,
          )}
      </div>

      {/* Full profile modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${username}'s Profile`}
        maxWidth="max-w-lg"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4 text-start">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="w-14 h-14 object-contain shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-700 shrink-0" />
          )}
          <div className="flex-1">
            <Text variant="h5">{username}</Text>
            {user?.selectedTitle && (
              <Text variant="xs" classes="text-amber-400 font-semibold block">
                {user.selectedTitle}
              </Text>
            )}
            {user?.status && user.status.length > 0 && (
              <Text variant="xs" classes="text-gray-300 italic block">
                {user.status}
              </Text>
            )}
            <Text variant="xs" classes="text-gray-400">
              Member since {joinDate}
            </Text>
            <div className="flex gap-4 mt-1">
              <div>
                <span className="text-white font-semibold text-sm">
                  {user?.forumPostCount ?? 0}
                </span>
                <span className="text-gray-400 text-xs ml-1">Posts</span>
              </div>
              <div>
                <span className="text-white font-semibold text-sm">
                  {user?.forumReactionCount ?? 0}
                </span>
                <span className="text-gray-400 text-xs ml-1">
                  Reactions received
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leagues */}
        {leagues.length > 0 && (
          <div className="mb-4">
            <Text variant="h6" classes="mb-1">
              Leagues
            </Text>
            <div className="flex flex-wrap gap-1">
              {leagues.map((l) => (
                <span
                  key={l}
                  className="bg-gray-700 rounded px-2 py-0.5 text-xs text-gray-200"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top 5 */}
        {top5Users.length > 0 && (
          <div className="mb-4">
            <Text variant="h6" classes="mb-1">
              Top 5
            </Text>
            <div className="flex gap-2 flex-wrap">
              {top5Users.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-1 bg-gray-800 rounded-lg px-2 py-1 text-xs"
                >
                  <span className="text-gray-500">#{i + 1}</span>
                  <span className="text-white font-semibold">{u.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-4">
          <Text variant="h6" classes="mb-2">
            Recent Activity
          </Text>
          <div className="flex gap-2 mb-3">
            {(["threads", "posts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activityLoading ? (
            <Text variant="xs" classes="text-gray-400">
              Loading...
            </Text>
          ) : activeTab === "threads" ? (
            recentThreads.length === 0 ? (
              <Text variant="xs" classes="text-gray-500 italic">
                No threads yet.
              </Text>
            ) : (
              <ul className="space-y-1 max-h-36 overflow-y-auto">
                {recentThreads.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className="text-xs border-b border-gray-700 pb-1 last:border-b-0"
                  >
                    <Link
                      to={`/forums/thread/${t.id}`}
                      onClick={() => setIsModalOpen(false)}
                      className="font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {t.title}
                    </Link>
                    <span className="text-gray-500 ml-2">
                      {formatActivityTs(
                        t.createdAt as unknown as { seconds: number },
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : recentPosts.length === 0 ? (
            <Text variant="xs" classes="text-gray-500 italic">
              No posts yet.
            </Text>
          ) : (
            <ul className="space-y-1 max-h-36 overflow-y-auto">
              {recentPosts.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="text-xs border-b border-gray-700 pb-1 last:border-b-0"
                >
                  <Link
                    to={`/forums/thread/${p.threadId}`}
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-300 line-clamp-2 hover:text-blue-400 transition-colors block"
                  >
                    {p.bodyText}
                  </Link>
                  <span className="text-gray-500 ml-2">
                    {formatActivityTs(
                      p.createdAt as unknown as { seconds: number },
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="primary" size="sm" onClick={handleViewProfile}>
            View Full Profile
          </Button>
          {currentUser?.id === uid && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                navigate(routes.USER);
              }}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};
