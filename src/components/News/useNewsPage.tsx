import { useCallback, useEffect, useMemo, useState } from "react";
import { useTeamColors } from "../../_hooks/useTeamColors";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";
import { darkenColor } from "../../_utility/getDarkerColor";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { usePagination } from "../../_hooks/usePagination";
import { getFBAWeekID, getHCKWeekID } from "../../_helper/statsPageHelper";
import { SingleValue } from "react-select";
import { SelectOption } from "../../_hooks/useSelectStyles";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase/firebase";

export const useNewsPage = () => {
  const {
    currentUser,
    isCFBUser,
    isCBBUser,
    isCHLUser,
    isNFLUser,
    isNBAUser,
    isPHLUser,
  } = useAuthStore();
  const { setSelectedLeague, selectedLeague, selectedTeam } = useLeagueStore();
  const {
    cfb_Timestamp,
    collegeNews: cfbNews,
    proNews: nflNews,
    getBootstrapNewsData: getFBABootstrapNewsData,
  } = useSimFBAStore();
  const {
    cbb_Timestamp,
    collegeNews: cbbNews,
    proNews: nbaNews,
    getBootstrapNewsData: getBBABootstrapNewsData,
  } = useSimBBAStore();
  const {
    hck_Timestamp,
    collegeNews: chlNews,
    proNews: phlNews,
    getBootstrapNewsData: getHCKBootstrapNewsData,
  } = useSimHCKStore();
  const isLoadingData = !selectedTeam;
  const backgroundColor = "#1f2937";
  let darkerBackgroundColor = darkenColor(backgroundColor, -5);
  const textColorClass = getTextColorBasedOnBg(backgroundColor);
  const teamColors = useTeamColors(
    selectedTeam?.ColorOne,
    selectedTeam?.ColorTwo,
    selectedTeam?.ColorThree
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    if (selectedLeague === SimCHL || selectedLeague === SimPHL) {
      return hck_Timestamp?.WeekID || -1;
    } else if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      return cfb_Timestamp?.CollegeWeekID || -1;
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      return cbb_Timestamp?.CollegeWeekID || -1;
    }
    return -1;
  });
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    if (selectedLeague === SimCHL || selectedLeague === SimPHL) {
      return hck_Timestamp?.SeasonID || -1;
    } else if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      return cfb_Timestamp?.CollegeSeasonID || -1;
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      return cbb_Timestamp?.SeasonID || -1;
    }
    return -1;
  });
  const [selectedNewsType, setSelectedNewsType] = useState<string>("");
  const [sortByNewest, setSortByNewest] = useState<boolean>(true);

  // Engagement data state
  const [engagementData, setEngagementData] = useState<
    Record<
      string,
      {
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
    >
  >({});
  const [lastEngagementFetch, setLastEngagementFetch] = useState<number>(0);
  const [collectionListener, setCollectionListener] = useState<
    (() => void) | null
  >(null);
  const [currentPageNewsIds, setCurrentPageNewsIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    getFBABootstrapNewsData();
    getBBABootstrapNewsData();
    getHCKBootstrapNewsData();
  }, []);

  const RefreshNews = useCallback(() => {
    if (isCFBUser || isNFLUser) {
      getFBABootstrapNewsData();
    }
    if (isCBBUser || isNBAUser) {
      getBBABootstrapNewsData();
    }
    if (isCHLUser || isPHLUser) {
      getHCKBootstrapNewsData();
    }
  }, [isCFBUser, isNFLUser, isCBBUser, isNBAUser, isCHLUser, isPHLUser]);

  const ts = useMemo(() => {
    if (selectedLeague === SimCHL || selectedLeague === SimPHL) {
      return hck_Timestamp;
    } else if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      return cfb_Timestamp;
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      return cbb_Timestamp;
    }
  }, [selectedLeague, hck_Timestamp, cfb_Timestamp, cbb_Timestamp]);

  const selectedLeagueNews = useMemo(() => {
    switch (selectedLeague) {
      case SimCFB:
        return cfbNews;
      case SimNFL:
        return nflNews;
      case SimCBB:
        return cbbNews;
      case SimNBA:
        return nbaNews;
      case SimCHL:
        return chlNews;
      case SimPHL:
        return phlNews;
      default:
        return [];
    }
  }, [selectedLeague, cfbNews, nflNews, cbbNews, nbaNews, chlNews, phlNews]);

  const filterNewsData = () => {
    return useMemo(() => {
      let source = selectedLeagueNews;
      console.log({ selectedNewsType, selectedSeason, selectedWeek });
      return source
        .filter((news) => {
          // news type filter - empty string means show all
          if (
            selectedNewsType !== "" &&
            selectedNewsType !== news.MessageType
          ) {
            return false;
          }
          if (selectedSeason !== -1 && selectedSeason !== news.SeasonID) {
            return false;
          }
          if (selectedWeek !== -1 && selectedWeek !== news.WeekID) {
            return false;
          }
          return true;
        })
        .sort((a, b) => {
          if (sortByNewest) {
            return (
              new Date(String(b.CreatedAt)).getTime() -
              new Date(String(a.CreatedAt)).getTime()
            );
          } else {
            return (
              new Date(String(a.CreatedAt)).getTime() -
              new Date(String(b.CreatedAt)).getTime()
            );
          }
        });
    }, [
      selectedNewsType,
      selectedLeagueNews,
      selectedSeason,
      selectedWeek,
      sortByNewest,
    ]);
  };

  const filteredNews = filterNewsData();

  const pageSize = 100;
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredNews.length, 100);

  const toPreviousPage = () => {
    // Force the window to scroll back up to the top.
    window.scrollTo(0, 0);
    goToPreviousPage();
  };

  const toNextPage = () => {
    window.scrollTo(0, 0);
    goToNextPage();
  };

  const pagedData = useMemo(() => {
    const start = currentPage!! * 100;
    return filteredNews.slice(start, start + pageSize);
  }, [filteredNews, currentPage, pageSize]);

  // Set up single collection listener for all engagement data in current league
  const setupEngagementListener = useCallback(
    (newsItems: any[]) => {
      if (!newsItems.length || !selectedLeague) return;

      // Clean up existing listener first
      if (collectionListener) {
        collectionListener();
        setCollectionListener(null);
      }

      // Track current page news IDs
      const newsIds = new Set(
        newsItems.map((item) => item.ID?.toString()).filter(Boolean)
      );
      setCurrentPageNewsIds(newsIds);

      // Initialize engagement data with defaults for current page items
      const defaultEngagementData: typeof engagementData = {};
      newsIds.forEach((newsId) => {
        defaultEngagementData[newsId] = {
          heart: 0,
          wow: 0,
          sad: 0,
          happy: 0,
          angry: 0,
          hug: 0,
          eyes: 0,
          userEngagements: {},
        };
      });
      setEngagementData((prev) => ({ ...prev, ...defaultEngagementData }));

      // Set up single collection listener
      const messagesRef = collection(
        firestore,
        "newsEngagement",
        selectedLeague,
        "messages"
      );

      const unsubscribe = onSnapshot(
        messagesRef,
        (snapshot) => {
          const updates: typeof engagementData = {};

          snapshot.docChanges().forEach((change) => {
            const docId = change.doc.id;

            // Only process documents for news items on current page
            if (newsIds.has(docId)) {
              const defaultData = {
                heart: 0,
                wow: 0,
                sad: 0,
                happy: 0,
                angry: 0,
                hug: 0,
                eyes: 0,
                userEngagements: {},
              };

              if (change.type === "added" || change.type === "modified") {
                if (change.doc.exists()) {
                  updates[docId] = { ...defaultData, ...change.doc.data() };
                } else {
                  updates[docId] = defaultData;
                }
              } else if (change.type === "removed") {
                updates[docId] = defaultData;
              }
            }
          });

          // Batch update engagement data
          if (Object.keys(updates).length > 0) {
            setEngagementData((prev) => ({ ...prev, ...updates }));
          }
        },
        (error) => {
          console.error(
            `Error listening to engagement collection for ${selectedLeague}:`,
            error
          );
        }
      );

      setCollectionListener(() => unsubscribe);
      setLastEngagementFetch(Date.now());
    },
    [selectedLeague]
  );

  // Fetch engagement data for current page of news items (fallback method)
  const fetchEngagementData = useCallback(
    async (newsItems: any[]) => {
      if (!newsItems.length || !selectedLeague) return;

      const engagementPromises = newsItems.map(async (newsItem) => {
        if (!newsItem.ID) return null;

        try {
          const docRef = doc(
            firestore,
            "newsEngagement",
            selectedLeague,
            "messages",
            newsItem.ID.toString()
          );
          const docSnap = await getDoc(docRef);

          const defaultData = {
            heart: 0,
            wow: 0,
            sad: 0,
            happy: 0,
            angry: 0,
            hug: 0,
            eyes: 0,
            userEngagements: {},
          };

          if (docSnap.exists()) {
            return {
              newsId: newsItem.ID.toString(),
              data: { ...defaultData, ...docSnap.data() },
            };
          } else {
            return {
              newsId: newsItem.ID.toString(),
              data: defaultData,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching engagement for news ${newsItem.ID}:`,
            error
          );
          return null;
        }
      });

      const results = await Promise.all(engagementPromises);
      const newEngagementData: typeof engagementData = {};

      results.forEach((result) => {
        if (result) {
          newEngagementData[result.newsId] = result.data;
        }
      });

      setEngagementData((prev) => ({ ...prev, ...newEngagementData }));
      setLastEngagementFetch(Date.now());
    },
    [selectedLeague]
  );

  // Update engagement data when user interacts with buttons
  const updateEngagementData = useCallback(
    async (
      newsId: string,
      type: "heart" | "wow" | "sad" | "happy" | "angry" | "hug" | "eyes",
      userTeamId: number
    ) => {
      if (!selectedLeague || !newsId || !userTeamId) return;

      const userKey = `${userTeamId}`;
      const currentData = engagementData[newsId];
      if (!currentData) return;

      const currentUserEngagement = currentData.userEngagements[userKey];

      try {
        const docRef = doc(
          firestore,
          "newsEngagement",
          selectedLeague,
          "messages",
          newsId
        );

        let updates: any = {};
        let newUserEngagements = { ...currentData.userEngagements };

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

        try {
          await updateDoc(docRef, updates);
        } catch (updateError: any) {
          // If document doesn't exist, create it first then update
          if (updateError.code === "not-found") {
            console.log(`Creating new engagement document for news ${newsId}`);

            // Create document with initial data
            const initialData = {
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

            // Now update with the user's engagement
            await updateDoc(docRef, updates);
          } else {
            throw updateError;
          }
        }

        // Update local state optimistically
        const optimisticUpdates: any = {};

        // Calculate new counts based on the operation
        if (currentUserEngagement === type) {
          // User is toggling off - decrease count
          optimisticUpdates[type] = Math.max(0, currentData[type] - 1);
        } else if (currentUserEngagement && currentUserEngagement !== type) {
          // User is switching - decrease old, increase new
          optimisticUpdates[currentUserEngagement] = Math.max(
            0,
            currentData[currentUserEngagement] - 1
          );
          optimisticUpdates[type] = currentData[type] + 1;
        } else {
          // User is engaging for first time - increase count
          optimisticUpdates[type] = currentData[type] + 1;
        }

        setEngagementData((prev) => ({
          ...prev,
          [newsId]: {
            ...currentData,
            ...optimisticUpdates,
            userEngagements: newUserEngagements,
          },
        }));
      } catch (error) {
        console.error("Error updating engagement:", error);
      }
    },
    [selectedLeague, engagementData]
  );

  // Set up collection listener when paged data changes
  useEffect(() => {
    if (pagedData.length > 0) {
      setupEngagementListener(pagedData);
    }

    // Clean up listener when component unmounts or paged data changes
    return () => {
      if (collectionListener) {
        collectionListener();
      }
    };
  }, [pagedData, setupEngagementListener]);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (collectionListener) {
        collectionListener();
      }
    };
  }, [collectionListener]);

  const changeLeagueOption = (opts: SingleValue<SelectOption>) => {
    const leagueOption = opts?.value as League;
    setSelectedLeague(leagueOption);
    if (leagueOption === SimCFB || leagueOption === SimNFL) {
      setSelectedSeason(cfb_Timestamp?.CollegeSeasonID || 6);
      setSelectedWeek(-1);
    } else if (leagueOption === SimCBB || leagueOption === SimNBA) {
      setSelectedSeason(cbb_Timestamp?.SeasonID || 5);
      setSelectedWeek(-1);
    } else if (leagueOption === SimCHL || leagueOption === SimPHL) {
      setSelectedSeason(hck_Timestamp?.SeasonID || 2);
      setSelectedWeek(-1);
    }
    setCurrentPage(0);
  };

  const SelectSeasonOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    let newWeekID = getHCKWeekID(hck_Timestamp?.WeekID || 1, num);
    if (selectedLeague === SimCFB || selectedLeague === SimNFL) {
      newWeekID = getFBAWeekID(cfb_Timestamp?.CollegeWeekID || 1, num);
    } else if (selectedLeague === SimCBB || selectedLeague === SimNBA) {
      newWeekID = getFBAWeekID(cbb_Timestamp?.CollegeWeekID || 1, num);
    }
    setSelectedSeason(num);
    setSelectedWeek(newWeekID);
    setCurrentPage(0);
  };

  const SelectWeekOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    const num = Number(value);
    setSelectedWeek(num);
    setCurrentPage(0);
  };

  const SelectNewsTypeOption = (opts: SingleValue<SelectOption>) => {
    const value = opts!.value;
    setSelectedNewsType(value);
    setCurrentPage(0);
  };

  return {
    changeLeagueOption,
    SelectSeasonOption,
    SelectWeekOption,
    SelectNewsTypeOption,
    currentPage,
    totalPages,
    toPreviousPage,
    toNextPage,
    backgroundColor,
    darkerBackgroundColor,
    textColorClass,
    teamColors,
    ts,
    setSelectedWeek,
    selectedSeason,
    setSelectedSeason,
    selectedNewsType,
    setSelectedNewsType,
    isLoadingData,
    cfbNews,
    nflNews,
    cbbNews,
    nbaNews,
    chlNews,
    phlNews,
    selectedWeek,
    setSelectedLeague,
    selectedLeague,
    selectedTeam,
    pagedData,
    RefreshNews,
    sortByNewest,
    setSortByNewest,
    engagementData,
    fetchEngagementData,
    setupEngagementListener,
    updateEngagementData,
    lastEngagementFetch,
  };
};
