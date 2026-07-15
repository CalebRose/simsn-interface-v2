import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  SimCBB,
  SimCFB,
  SimCHL,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { Button, ButtonGrid } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { ToggleSwitch } from "../../_design/Inputs";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useAuthStore } from "../../context/AuthContext";
import { useForumStore } from "../../context/ForumContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { ForumService } from "../../_services/forumService";
import { Achievement, Thread, Post } from "../../models/forumModels";
import {
  ProfileCFBTeamCard,
  ProfileCHLTeamCard,
  ProfileNFLTeamCard,
  ProfilePHLTeamCard,
  ProfileCBBTeamCard,
  ProfileNBATeamCard,
  ProfileCBLTeamCard,
  ProfileMLBTeamCard,
} from "./ProfileTeamCard";
import { CSSObjectWithLabel } from "react-select";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { Logo } from "../../_design/Logo";
import { getUserLogoUrl } from "../../_utility/getLogo";
import { CollegeTeam as CFBTeam, NFLTeam } from "../../models/footballModels";
import { Team as CBBTeam, NBATeam } from "../../models/basketballModels";
import {
  CollegeTeam as CHLTeam,
  ProfessionalTeam,
} from "../../models/hockeyModels";
import { BaseballOrganization } from "../../models/baseball/baseballModels";
import { ClickableUserLabel } from "../Common/Labels";

// ─── Shared constants ────────────────────────────────────────────────────────

const LEAGUE_CHECKS: { key: keyof CurrentUser; label: string }[] = [
  { key: "teamId", label: SimCFB },
  { key: "NFLTeamID", label: SimNFL },
  { key: "cbb_id", label: SimCBB },
  { key: "NBATeamID", label: SimNBA },
  { key: "CHLTeamID", label: SimCHL },
  { key: "PHLTeamID", label: SimPHL },
  { key: "CollegeBaseballOrgID", label: "SimCBL" },
  { key: "MLBOrgID", label: SimMLB },
];

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

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: "32px",
    fontSize: "0.875rem",
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    borderColor: state.isFocused ? "#4A90E2" : "#4A5568",
    color: "#ffffff",
    padding: "2px 4px",
    boxShadow: state.isFocused ? "0 0 0 1px #4A90E2" : "none",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    width: "100%",
  }),
  valueContainer: (base: CSSObjectWithLabel) => ({
    ...base,
    padding: "0 6px",
  }),
  singleValue: (base: CSSObjectWithLabel) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#fff",
  }),
  placeholder: (base: CSSObjectWithLabel) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#9ca3af",
  }),
  option: (base: any, state: { isFocused: any }) => ({
    ...base,
    backgroundColor: state.isFocused ? "#2d3748" : "#1a202c",
    color: "#fff",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.875rem",
  }),
  menu: (base: CSSObjectWithLabel) => ({
    ...base,
    fontSize: "0.875rem",
    backgroundColor: "#1a202c",
    borderRadius: "8px",
    color: "#fff",
    zIndex: 50,
  }),
  menuList: (base: any) => ({
    ...base,
    backgroundColor: "#1a202c",
    padding: "0",
    color: "#fff",
  }),
};

function formatTs(ts: { seconds: number } | null | undefined): string {
  if (!ts) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Recent Activity ─────────────────────────────────────────────────────────

interface RecentActivitySectionProps {
  uid: string;
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  uid,
}) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"threads" | "posts">("threads");

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      ForumService.GetThreadsByAuthor(uid, 10),
      ForumService.GetPostsByAuthor(uid, 10),
    ])
      .then(([t, p]) => {
        if (cancelled) return;
        setThreads(t);
        setPosts(p);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return (
    <Border classes="w-full p-4">
      <Text variant="h6" classes="mb-3">
        Recent Activity
      </Text>
      <div className="flex gap-2 mb-3">
        {(["threads", "posts"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1 rounded transition-colors ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Text variant="xs" classes="text-gray-400">
          Loading…
        </Text>
      ) : tab === "threads" ? (
        threads.length === 0 ? (
          <Text variant="xs" classes="text-gray-500 italic">
            No threads yet.
          </Text>
        ) : (
          <ul className="space-y-1.5 max-h-80 overflow-y-auto">
            {threads.map((th) => (
              <li
                key={th.id}
                className="text-xs border-b border-gray-700 pb-1.5 last:border-b-0"
              >
                <Link
                  to={`/forums/thread/${th.id}`}
                  className="font-semibold text-white hover:text-blue-400 transition-colors"
                >
                  {th.title}
                </Link>
                <span className="text-gray-500 ml-2">
                  {formatTs(th.createdAt as unknown as { seconds: number })}
                </span>
              </li>
            ))}
          </ul>
        )
      ) : posts.length === 0 ? (
        <Text variant="xs" classes="text-gray-500 italic">
          No posts yet.
        </Text>
      ) : (
        <ul className="space-y-1.5 max-h-80 overflow-y-auto">
          {posts.map((p) => (
            <li
              key={p.id}
              className="text-xs border-b border-gray-700 pb-1.5 last:border-b-0"
            >
              <Link
                to={`/forums/thread/${p.threadId}`}
                className="text-gray-300 line-clamp-2 hover:text-blue-400 transition-colors block"
              >
                {p.bodyText}
              </Link>
              <span className="text-gray-500 ml-2">
                {formatTs(p.createdAt as unknown as { seconds: number })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Border>
  );
};

// ─── Shared read-only profile content ────────────────────────────────────────

interface PublicProfileContentProps {
  viewedUser: CurrentUser | null;
  displayName: string | undefined;
  viewedLogoUrl: string;
  viewedJoinDate: string;
  selectedCFBTeam: CFBTeam | null;
  selectedNFLTeam: NFLTeam | null;
  selectedCBBTeam: CBBTeam | null;
  selectedNBATeam: NBATeam | null;
  selectedCHLTeam: CHLTeam | null;
  selectedPHLTeam: ProfessionalTeam | null;
  selectedCBLTeam: BaseballOrganization | null | undefined;
  selectedMLBTeam: BaseballOrganization | null | undefined;
  viewedTop5: CurrentUser[];
  viewedAchievements: Achievement[];
}

const PublicProfileContent: React.FC<PublicProfileContentProps> = ({
  viewedUser,
  displayName,
  viewedLogoUrl,
  viewedJoinDate,
  selectedCFBTeam,
  selectedNFLTeam,
  selectedCBBTeam,
  selectedNBATeam,
  selectedCHLTeam,
  selectedPHLTeam,
  selectedCBLTeam,
  selectedMLBTeam,
  viewedTop5,
  viewedAchievements,
}) => (
  <>
    {/* Header */}
    <Border classes="w-full p-4">
      <div className="flex items-start gap-4">
        <Logo url={viewedLogoUrl} variant="large" />
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Text variant="h4">{viewedUser?.username ?? displayName}</Text>
            {viewedUser?.selectedTitle && (
              <span className="text-amber-400 font-semibold text-sm">
                {viewedUser.selectedTitle}
              </span>
            )}
          </div>
          {viewedUser?.status && viewedUser.status.length > 0 && (
            <Text variant="body-small" classes="text-gray-300 italic mt-0.5">
              {viewedUser.status}
            </Text>
          )}
          <Text variant="body-small" classes="text-gray-400 mt-0.5">
            Member since {viewedJoinDate}
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
      </div>
    </Border>

    {/* Teams */}
    {(selectedCFBTeam ||
      selectedNFLTeam ||
      selectedCBBTeam ||
      selectedNBATeam ||
      selectedCHLTeam ||
      selectedPHLTeam ||
      selectedCBLTeam ||
      selectedMLBTeam) && (
      <Border classes="w-full p-4">
        <Text variant="h6" classes="mb-3">
          Teams
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedCFBTeam && (
            <ProfileCFBTeamCard IsUser={false} Team={selectedCFBTeam} />
          )}
          {selectedNFLTeam && (
            <ProfileNFLTeamCard IsUser={false} Team={selectedNFLTeam} />
          )}
          {selectedCBBTeam && (
            <ProfileCBBTeamCard IsUser={false} Team={selectedCBBTeam} />
          )}
          {selectedNBATeam && (
            <ProfileNBATeamCard IsUser={false} Team={selectedNBATeam} />
          )}
          {selectedCHLTeam && (
            <ProfileCHLTeamCard IsUser={false} Team={selectedCHLTeam} />
          )}
          {selectedPHLTeam && (
            <ProfilePHLTeamCard IsUser={false} Team={selectedPHLTeam} />
          )}
          {selectedCBLTeam && (
            <ProfileCBLTeamCard IsUser={false} Org={selectedCBLTeam} />
          )}
          {selectedMLBTeam && (
            <ProfileMLBTeamCard IsUser={false} Org={selectedMLBTeam} />
          )}
        </div>
      </Border>
    )}

    {/* Top 5 */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Border classes="w-full p-4">
        <Text variant="h6" classes="mb-2">
          Top 5
        </Text>
        <div className="flex gap-3 flex-wrap">
          {viewedTop5.length === 0 && (
            <Text variant="body-small" classes="text-gray-500">
              This user needs to make some friends!
            </Text>
          )}
          {viewedTop5.length > 0 &&
            viewedTop5.map((u, i) => (
              <div
                key={u.id}
                className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2"
              >
                <span className="text-gray-500 text-xs font-bold">
                  #{i + 1}
                </span>
                <ClickableUserLabel
                  label={u.username || "-"}
                  coach={u.username ? u.username : ""}
                  textColorClass="text-white"
                  additionalClasses="font-semibold"
                  textVariant="small"
                />
              </div>
            ))}
        </div>
      </Border>

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
      {/* Achievements */}
      <Border classes="w-full p-4">
        <Text variant="h6" classes="mb-2">
          Achievements
        </Text>
        <div className="space-y-2">
          {viewedAchievements.length === 0 && (
            <Text variant="body-small" classes="text-gray-500">
              No achievements yet.
            </Text>
          )}
          {viewedAchievements.length > 0 &&
            viewedAchievements.map((a) => (
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
    </div>

    {/* Recent Activity */}
    {viewedUser?.id && <RecentActivitySection uid={viewedUser.id} />}
  </>
);

// ─── Main component ──────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const { username: paramUsername } = useParams<{ username?: string }>();
  const {
    currentUser,
    setCurrentUser,
    viewMode,
    setViewMode,
    isCHLUser,
    isPHLUser,
    isSubscriber,
    defaultLogo,
  } = useAuthStore();
  const { userMap, userListOptions } = useForumStore();
  const { cfbTeam, nflTeam, cfbTeamMap, proTeamMap } = useSimFBAStore();
  const { cbbTeam, nbaTeam, cbbTeamMap, nbaTeamMap } = useSimBBAStore();
  const { chlTeam, phlTeam, chlTeamMap, phlTeamMap } = useSimHCKStore();
  const { collegeOrganization, mlbOrganization, organizationMap } =
    useSimBaseballStore();

  const isOwnProfile =
    !paramUsername || paramUsername === currentUser?.username;

  // ── All state (before any early return) ─────────────────────────

  const [viewedUser, setViewedUser] = useState<CurrentUser | null>(null);
  const [viewedUserLoading, setViewedUserLoading] = useState(false);
  const [viewedAchievements, setViewedAchievements] = useState<Achievement[]>(
    [],
  );

  const [top5Draft, setTop5Draft] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [activeTop5Slot, setActiveTop5Slot] = useState<number | null>(null);
  const [top5SearchQuery, setTop5SearchQuery] = useState("");
  const [top5SearchResults, setTop5SearchResults] = useState<
    { uid: string; username: string }[]
  >([]);
  const [top5Saving, setTop5Saving] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [titleSaving, setTitleSaving] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);

  const selectedCFBTeam = useMemo(() => {
    if (!cfbTeamMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return cfbTeamMap[viewedUser.teamId ?? 0] || null;
    }
    if (currentUser?.teamId) {
      return cfbTeam;
    }
    return null;
  }, [currentUser, viewedUser, cfbTeam, cfbTeamMap]);

  const selectedNFLTeam = useMemo(() => {
    if (!proTeamMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return proTeamMap[viewedUser.NFLTeamID ?? 0] || null;
    }
    if (currentUser?.NFLTeamID) {
      return nflTeam;
    }
    return null;
  }, [currentUser, viewedUser, nflTeam, proTeamMap]);

  const selectedCBBTeam = useMemo(() => {
    if (!cbbTeamMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return cbbTeamMap[viewedUser.cbb_id ?? 0] || null;
    }
    if (currentUser?.cbb_id) {
      return cbbTeam;
    }
    return null;
  }, [currentUser, viewedUser, cbbTeam, cbbTeamMap]);

  const selectedNBATeam = useMemo(() => {
    if (!nbaTeamMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return nbaTeamMap[viewedUser.NBATeamID ?? 0] || null;
    }
    if (currentUser?.NBATeamID) {
      return nbaTeam;
    }
    return null;
  }, [currentUser, viewedUser, nbaTeam, nbaTeamMap]);

  const selectedCHLTeam = useMemo(() => {
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return chlTeamMap[viewedUser.CHLTeamID ?? 0] || null;
    }
    if (currentUser?.CHLTeamID) {
      return chlTeam;
    }
    return null;
  }, [currentUser, viewedUser, chlTeam, chlTeamMap]);

  const selectedPHLTeam = useMemo(() => {
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return phlTeamMap[viewedUser.PHLTeamID ?? 0] || null;
    }
    if (currentUser?.PHLTeamID) {
      return phlTeam;
    }
    return null;
  }, [currentUser, viewedUser, phlTeam, phlTeamMap]);

  const selectedCBLTeam = useMemo(() => {
    if (!organizationMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return organizationMap[viewedUser.CollegeBaseballOrgID ?? 0] || null;
    }
    if (currentUser?.CollegeBaseballOrgID) {
      return collegeOrganization;
    }
    return null;
  }, [currentUser, viewedUser, collegeOrganization, organizationMap]);

  const selectedMLBTeam = useMemo(() => {
    if (!organizationMap) return null;
    if (viewedUser && viewedUser.id !== currentUser?.id) {
      return organizationMap[viewedUser.MLBOrgID ?? 0] || null;
    }
    if (currentUser?.MLBOrgID) {
      return mlbOrganization;
    }
    return null;
  }, [currentUser, viewedUser, mlbOrganization, organizationMap]);

  // ── Effects ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!paramUsername) return;
    let cancelled = false;
    setViewedUserLoading(true);
    const fromMap = Object.values(userMap).find(
      (u) => u.username === paramUsername,
    );
    if (fromMap) setViewedUser(fromMap);
    ForumService.GetUserByUsername(paramUsername)
      .then((u) => {
        if (!cancelled) setViewedUser(u);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setViewedUserLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paramUsername]);

  useEffect(() => {
    const uid = viewedUser?.id;
    if (!uid || uid === currentUser?.id) {
      setViewedAchievements([]);
      return;
    }
    ForumService.GetAchievementsByUser(uid)
      .then(setViewedAchievements)
      .catch(console.error);
  }, [viewedUser?.id, currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    const ids = currentUser.top5UserIds ?? [];
    setTop5Draft([
      ids[0] ?? null,
      ids[1] ?? null,
      ids[2] ?? null,
      ids[3] ?? null,
      ids[4] ?? null,
    ]);
    setSelectedTitle(currentUser.selectedTitle ?? null);
    setStatusDraft(currentUser.status ?? "");
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    ForumService.GetAchievementsByUser(currentUser.id)
      .then(setAchievements)
      .catch(console.error);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!top5SearchQuery.trim()) {
      setTop5SearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      ForumService.SearchUsersByPrefix(top5SearchQuery, 6)
        .then(setTop5SearchResults)
        .catch(console.error);
    }, 200);
    return () => clearTimeout(timer);
  }, [top5SearchQuery]);

  // ── Derived values ───────────────────────────────────────────────

  const viewedLogoUrl = useMemo(
    () => (viewedUser ? getUserLogoUrl(viewedUser) : ""),
    [viewedUser],
  );

  const viewedLeagues = useMemo(() => {
    if (!viewedUser) return [];
    return LEAGUE_CHECKS.filter(
      ({ key }) => viewedUser[key] && (viewedUser[key] as number) > 0,
    ).map(({ label }) => label);
  }, [viewedUser]);

  const viewedTop5 = useMemo(() => {
    if (!viewedUser?.top5UserIds) return [];
    return viewedUser.top5UserIds
      .map((id) => userMap[id])
      .filter((u): u is CurrentUser => !!u);
  }, [viewedUser, userMap]);

  const viewedJoinDate = useMemo(() => {
    if (!viewedUser?.createdAt) return "—";
    return new Date(viewedUser.createdAt.seconds * 1000).toLocaleDateString(
      undefined,
      { year: "numeric", month: "long", day: "numeric" },
    );
  }, [viewedUser]);

  // Own profile derived values
  const ownLeagues = useMemo(() => {
    if (!currentUser) return [];
    return LEAGUE_CHECKS.filter(
      ({ key }) => currentUser[key] && (currentUser[key] as number) > 0,
    ).map(({ label }) => label);
  }, [currentUser]);

  const ownTop5 = useMemo(() => {
    if (!currentUser?.top5UserIds) return [];
    return currentUser.top5UserIds
      .map((id) => userMap[id])
      .filter((u): u is CurrentUser => !!u);
  }, [currentUser, userMap]);

  const ownJoinDate = useMemo(() => {
    if (!currentUser?.createdAt) return "—";
    return new Date(currentUser.createdAt.seconds * 1000).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  }, [currentUser]);

  const themeOptions = [
    { label: "🌙 Dark", value: "dark" },
    { label: "⚫ Steel", value: "steel" },
    { label: "🔘 Grey", value: "grey" },
    { label: "☀️ Light", value: "light" },
    { label: "🟡 Gold", value: "gold" },
    { label: "🔴 Red", value: "red" },
    { label: "🟣 Purple", value: "purple" },
    { label: "🔵 Blue", value: "blue" },
    { label: "🌊 Ocean Blue", value: "oceanblue" },
    { label: "🐚 Teal", value: "teal" },
    { label: "🌿 Deep Sea Green", value: "deepsea" },
    { label: "🍃 Castleton Green", value: "castleton" },
    { label: "🌲 Sage Green", value: "sage" },
  ];
  const selectedTheme =
    themeOptions.find((o) => o.value === viewMode) ?? themeOptions[0];

  // ── Handlers ────────────────────────────────────────────────────

  const setDefaultLeague = async (league: string) => {
    setCurrentUser({ ...currentUser, DefaultLeague: league } as CurrentUser);
    await updateUserByUsername(currentUser!.username, {
      DefaultLeague: league,
    });
  };

  const setRetro = async () => {
    const newRetro = !currentUser?.IsRetro;
    setCurrentUser({ ...currentUser, IsRetro: newRetro } as CurrentUser);
    await updateUserByUsername(currentUser!.username, { IsRetro: newRetro });
  };

  const setTheme = (opt: any) => {
    setViewMode(opt.value);
    localStorage.setItem("theme", opt.value);
  };

  const handleSelectUser = (opt: any) => {
    setViewedUser(opt ? (userMap[opt.value] ?? null) : null);
  };

  const assignTop5User = (slotIndex: number, uid: string) => {
    if (uid === currentUser?.id) return; // Prevent adding self to top 5
    const next = [...top5Draft];
    next[slotIndex] = uid;
    setTop5Draft(next);
    setActiveTop5Slot(null);
    setTop5SearchQuery("");
    setTop5SearchResults([]);
  };

  const clearTop5Slot = (slotIndex: number) => {
    const next = [...top5Draft];
    next[slotIndex] = null;
    setTop5Draft(next);
  };

  const saveTop5 = async () => {
    if (!currentUser) return;
    setTop5Saving(true);
    try {
      const ids = top5Draft.filter((id): id is string => !!id);
      await updateUserByUsername(currentUser.username, { top5UserIds: ids });
      setCurrentUser({ ...currentUser, top5UserIds: ids } as CurrentUser);
    } catch (err) {
      console.error(err);
    } finally {
      setTop5Saving(false);
    }
  };

  const saveTitle = async (title: string | null) => {
    if (!currentUser) return;
    setTitleSaving(true);
    try {
      await updateUserByUsername(currentUser.username, {
        selectedTitle: title ?? null,
      });
      setCurrentUser({ ...currentUser, selectedTitle: title } as CurrentUser);
      setSelectedTitle(title);
    } catch (err) {
      console.error(err);
    } finally {
      setTitleSaving(false);
    }
  };

  const saveStatus = async () => {
    if (!currentUser) return;
    setStatusSaving(true);
    try {
      await updateUserByUsername(currentUser.username, { status: statusDraft });
      setCurrentUser({ ...currentUser, status: statusDraft } as CurrentUser);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusSaving(false);
    }
  };

  // ── Own profile: dropdown selected a different user ──────────────
  const isShowingOtherUser = !!viewedUser && viewedUser.id !== currentUser?.id;

  // ── Own profile view ─────────────────────────────────────────────
  return (
    <PageContainer
      direction="col"
      isLoading={false}
      title={`${currentUser?.username}'s Profile`}
    >
      <div className="grid grid-cols-12">
        <div className="col-span-12 sm:col-span-2">
          {/* Settings */}
          <Border classes="w-full p-4 text-start">
            <Text variant="h6" classes="mb-3">
              Settings
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              {/* Default League */}
              <div>
                <Text variant="body-small" classes="mb-2">
                  Default League
                </Text>
                <ButtonGrid classes="grid-cols-4 gap-1.5">
                  {[
                    { label: SimCFB, val: SimCFB },
                    { label: SimNFL, val: SimNFL },
                    { label: SimCBB, val: SimCBB },
                    { label: SimNBA, val: SimNBA },
                    { label: SimCHL, val: SimCHL },
                    { label: SimPHL, val: SimPHL },
                    { label: "SimCBL", val: SimCollegeBaseball },
                    { label: SimMLB, val: SimMLB },
                  ].map(({ label, val }) => (
                    <Button
                      key={val}
                      isSelected={currentUser?.DefaultLeague === val}
                      onClick={() => setDefaultLeague(val)}
                      variant="secondary"
                      size="xs"
                    >
                      {label}
                    </Button>
                  ))}
                </ButtonGrid>
              </div>

              {/* Other settings */}
              <div className="space-y-3">
                <div>
                  <Text variant="body-small" classes="mb-2">
                    Interface Theme
                  </Text>
                  <SelectDropdown
                    options={themeOptions}
                    value={selectedTheme}
                    onChange={setTheme}
                    isMulti={false}
                    styles={selectStyles}
                  />
                </div>

                {(isSubscriber || currentUser?.IsRetro) && (
                  <div className="flex items-center gap-3">
                    <Text variant="body-small">Retro Mode</Text>
                    <ToggleSwitch
                      checked={currentUser?.IsRetro!!}
                      onChange={setRetro}
                    />
                  </div>
                )}

                {achievements.length > 0 && (
                  <div>
                    <Text variant="body-small" classes="mb-2">
                      Forum Title{titleSaving ? " (saving…)" : ""}
                    </Text>
                    <SelectDropdown
                      options={[
                        { label: "None", value: "" },
                        ...achievements.map((a) => ({
                          label: a.title,
                          value: a.title,
                        })),
                      ]}
                      value={
                        selectedTitle
                          ? { label: selectedTitle, value: selectedTitle }
                          : { label: "None", value: "" }
                      }
                      onChange={(opt: any) => saveTitle(opt?.value || null)}
                      isMulti={false}
                      styles={selectStyles}
                    />
                  </div>
                )}

                <div>
                  <Text variant="body-small" classes="mb-2">
                    View another user
                  </Text>
                  <SelectDropdown
                    options={userListOptions}
                    value={null}
                    onChange={handleSelectUser}
                    isClearable
                    isMulti={false}
                    styles={selectStyles}
                    placeholder="Search a user…"
                  />
                </div>
              </div>
            </div>
          </Border>
        </div>
        <div className="col-span-12 sm:col-span-10">
          <div className="px-4 mx-auto w-full space-y-4 text-start">
            {isShowingOtherUser ? (
              /* ── Inline public profile of dropdown-selected user ── */
              <>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    onClick={() => setViewedUser(null)}
                  >
                    ← Back to my profile
                  </Button>
                  <Text variant="body-small" classes="text-gray-400">
                    Viewing {viewedUser!.username}'s profile
                  </Text>
                </div>
                <PublicProfileContent
                  viewedUser={viewedUser}
                  displayName={viewedUser!.username}
                  viewedLogoUrl={viewedLogoUrl}
                  viewedJoinDate={viewedJoinDate}
                  selectedCFBTeam={selectedCFBTeam}
                  selectedNFLTeam={selectedNFLTeam}
                  selectedCBBTeam={selectedCBBTeam}
                  selectedNBATeam={selectedNBATeam}
                  selectedCHLTeam={selectedCHLTeam}
                  selectedPHLTeam={selectedPHLTeam}
                  selectedCBLTeam={selectedCBLTeam}
                  selectedMLBTeam={selectedMLBTeam}
                  viewedTop5={viewedTop5}
                  viewedAchievements={viewedAchievements}
                />
              </>
            ) : (
              /* ── Editable own profile — same structure as public view ── */
              <>
                {/* Header */}
                <Border classes="w-full p-4">
                  <div className="flex items-start text-start gap-4">
                    <Logo url={defaultLogo} variant="large" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Text variant="h4">{currentUser?.username}</Text>
                        {currentUser?.selectedTitle && (
                          <span className="text-amber-400 font-semibold text-sm">
                            {currentUser.selectedTitle}
                          </span>
                        )}
                      </div>
                      {currentUser?.status && currentUser.status.length > 0 && (
                        <Text
                          variant="body-small"
                          classes="text-gray-300 italic mt-0.5"
                        >
                          {currentUser.status}
                        </Text>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={statusDraft}
                          onChange={(e) => setStatusDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveStatus();
                          }}
                          placeholder="Set a status…"
                          maxLength={100}
                          className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={saveStatus}
                          disabled={statusSaving}
                        >
                          {statusSaving ? "…" : "Save"}
                        </Button>
                      </div>
                      <Text variant="body-small" classes="text-gray-400 mt-0.5">
                        Member since {ownJoinDate}
                      </Text>
                      <div className="flex gap-6 mt-2">
                        <div>
                          <span className="text-white font-bold text-lg">
                            {currentUser?.forumPostCount ?? 0}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">
                            Posts
                          </span>
                        </div>
                        <div>
                          <span className="text-white font-bold text-lg">
                            {currentUser?.forumReactionCount ?? 0}
                          </span>
                          <span className="text-gray-400 text-xs ml-1">
                            Reactions received
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Border>

                {/* Teams */}

                <Border classes="w-full p-4">
                  <Text variant="h6" classes="mb-3">
                    Teams
                  </Text>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedCFBTeam && (
                      <ProfileCFBTeamCard
                        IsUser={true}
                        Team={selectedCFBTeam}
                      />
                    )}
                    {selectedNFLTeam && (
                      <ProfileNFLTeamCard
                        IsUser={true}
                        Team={selectedNFLTeam}
                      />
                    )}
                    {selectedCBBTeam && (
                      <ProfileCBBTeamCard
                        IsUser={true}
                        Team={selectedCBBTeam}
                      />
                    )}
                    {selectedNBATeam && (
                      <ProfileNBATeamCard
                        IsUser={true}
                        Team={selectedNBATeam}
                      />
                    )}
                    {selectedCHLTeam && (
                      <ProfileCHLTeamCard
                        IsUser={true}
                        Team={selectedCHLTeam}
                      />
                    )}
                    {selectedPHLTeam && (
                      <ProfilePHLTeamCard
                        IsUser={true}
                        Team={selectedPHLTeam}
                      />
                    )}
                    {selectedCBLTeam && (
                      <ProfileCBLTeamCard IsUser={true} Org={selectedCBLTeam} />
                    )}
                    {selectedMLBTeam && (
                      <ProfileMLBTeamCard IsUser={true} Org={selectedMLBTeam} />
                    )}
                  </div>
                </Border>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Top 5 Editor */}
                  <Border classes="w-full p-4">
                    <Text variant="h6" classes="mb-3">
                      Top 5 Friends
                    </Text>
                    <div className="space-y-2 mb-3">
                      {top5Draft.map((uid, i) => {
                        const slotUser = uid ? userMap[uid] : null;
                        const displayName =
                          slotUser?.username ?? (uid ? "…" : null);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs w-5 shrink-0">
                              #{i + 1}
                            </span>
                            {uid ? (
                              <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-1.5 flex-1">
                                <ClickableUserLabel
                                  label={displayName || "-"}
                                  coach={displayName ? displayName : ""}
                                  textColorClass="text-white"
                                  additionalClasses="font-semibold flex-1"
                                  textVariant="small"
                                />
                                <button
                                  onClick={() => clearTop5Slot(i)}
                                  className="text-gray-500 hover:text-red-400 text-xs transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveTop5Slot(i);
                                  setTop5SearchQuery("");
                                }}
                                className="flex-1 text-left text-xs text-gray-500 bg-gray-800/50 border border-dashed border-gray-600 rounded px-3 py-1.5 hover:border-gray-400 transition-colors"
                              >
                                {activeTop5Slot === i
                                  ? "Type to search below…"
                                  : "── Empty slot ──"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {activeTop5Slot !== null && (
                      <div className="mb-3">
                        <input
                          type="text"
                          value={top5SearchQuery}
                          onChange={(e) => setTop5SearchQuery(e.target.value)}
                          placeholder={`Search for slot #${activeTop5Slot + 1}…`}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        {top5SearchResults.length > 0 && (
                          <div className="mt-1 bg-gray-800 border border-gray-600 rounded overflow-hidden">
                            {top5SearchResults.map((r) => (
                              <button
                                key={r.uid}
                                onClick={() =>
                                  assignTop5User(activeTop5Slot, r.uid)
                                }
                                className="block w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                              >
                                {r.username}
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setActiveTop5Slot(null);
                            setTop5SearchQuery("");
                            setTop5SearchResults([]);
                          }}
                          className="mt-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={saveTop5}
                      disabled={top5Saving}
                    >
                      {top5Saving ? "Saving…" : "Save Top 5"}
                    </Button>
                  </Border>

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
                            {(currentUser?.[key] as number | undefined) ?? 0}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </Border>
                  {/* Achievements (own) */}

                  <Border classes="w-full p-4">
                    <Text variant="h6" classes="mb-2">
                      Achievements
                    </Text>
                    <div className="space-y-2">
                      {achievements.length === 0 && (
                        <Text>
                          Keep participating and you will earn one soon :D
                        </Text>
                      )}
                      {achievements.length > 0 &&
                        achievements.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-start gap-3 bg-gray-800 rounded p-3"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Text
                                  variant="body-small"
                                  classes="font-semibold"
                                >
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
                </div>

                {/* Recent Activity (own) */}
                {currentUser?.id && (
                  <RecentActivitySection uid={currentUser.id} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
