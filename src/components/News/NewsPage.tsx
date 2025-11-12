import { useEffect, useState } from "react";
import { PageContainer } from "../../_design/Container";
import { useNewsPage } from "./useNewsPage";
import { NewsSideBar } from "./components/NewsSideBar";
export const NewsPage = () => {
  const { backgroundColor, darkerBackgroundColor, textColorClass, teamColors } =
    useNewsPage();
  return (
    <PageContainer direction="col" title="News">
      <>
        <div className="grid grid-flow-row grid-auto-rows-auto w-full h-full max-[1024px]:grid-cols-1 max-[1024px]:gap-y-2 grid-cols-[2fr_10fr] max-[1024px]:gap-x-1 gap-x-2 mb-2">
          <NewsSideBar teamColors={teamColors} />
          <div>News Content</div>
        </div>
      </>
    </PageContainer>
  );
};
