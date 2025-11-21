import React from "react";
import { PageContainer } from "../../_design/Container";
import { useNewsPage } from "./useNewsPage";
import { NewsSideBar } from "./components/NewsSideBar";
import { NewsLogItem } from "./components/NewsLogItem";
import { League } from "../../_constants/constants";
import { NewsLog } from "../../models/footballModels";
export const NewsPage = () => {
  const {
    teamColors,
    ts,
    selectedSeason,
    selectedLeague,
    selectedTeam,
    changeLeagueOption,
    SelectSeasonOption,
    SelectWeekOption,
    SelectNewsTypeOption,
    currentPage,
    totalPages,
    toPreviousPage,
    toNextPage,
    pagedData,
    RefreshNews,
  } = useNewsPage();

  return (
    <PageContainer direction="col" title="News">
      <>
        <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
          <NewsSideBar
            teamColors={teamColors}
            league={selectedLeague as League}
            selectedTeam={selectedTeam}
            ts={ts}
            selectedSeason={selectedSeason}
            changeLeagueOption={changeLeagueOption}
            SelectSeasonOption={SelectSeasonOption}
            SelectWeekOption={SelectWeekOption}
            SelectNewsTypeOption={SelectNewsTypeOption}
            goToPreviousPage={toPreviousPage}
            goToNextPage={toNextPage}
            currentPage={currentPage}
            totalPages={totalPages}
            refreshNews={RefreshNews}
          />
          <div className="flex flex-col w-full">
            {pagedData.map((newsItem: NewsLog) => (
              <NewsLogItem
                key={newsItem.ID}
                newsItem={newsItem}
                league={selectedLeague as League}
              />
            ))}
          </div>
        </div>
      </>
    </PageContainer>
  );
};
