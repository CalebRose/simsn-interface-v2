import React, { useMemo, useState } from "react";
import { PageContainer } from "../../_design/Container";
import { Text, TextVariant } from "../../_design/Typography";
import { useLeagueStore } from "../../context/LeagueContext";
import { SelectDropdown } from "../../_design/Select";
import { League } from "../../_constants/constants";
import mainContent from "./maincontent.json";
import { MarkdownDoc } from "./MarkdownDoc";
import { DocTableOfContents } from "./DocTableOfContents";
import {
  parseMarkdownHeadings,
  stripEmbeddedToc,
} from "../../_helper/markdownDocsHelper";
import simHockeyDoc from "../../_techdocs/SimHCK.md?raw";

type Documentation = {
  [key: string]: MainContentItem[];
};

type MainContentItem = {
  variant: TextVariant;
  content: string;
  classes: string;
};

// Leagues that render from a markdown doc instead of the JSON content map.
const leagueMarkdownDocs: Partial<Record<string, string>> = {
  SimCHL: simHockeyDoc,
  SimPHL: simHockeyDoc,
};

export const DocumentationMain = () => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const [league, setLeague] = React.useState<string>(selectedLeague);
  const [activeId, setActiveId] = useState<string | null>(null);

  const leagueOptions = useMemo(() => {
    return [
      { label: "Main", value: "None" },
      { label: "SimCFB", value: "SimCFB" },
      { label: "SimNFL", value: "SimNFL" },
      { label: "SimCBB", value: "SimCBB" },
      { label: "SimNBA", value: "SimNBA" },
      { label: "SimCHL", value: "SimCHL" },
      { label: "SimPHL", value: "SimPHL" },
      { label: "SimCBL", value: "SimCollegeBaseball" },
      { label: "SimMLB", value: "SimMLB" },
    ];
  }, []);

  const handleLeagueChange = (opts: any) => {
    const league = opts.value;
    setLeague(league);
    if (league !== "None") {
      setSelectedLeague(league as League);
    }
  };

  const mainContentMemo = useMemo(() => {
    const mc = mainContent as Documentation;
    const d = mc[league !== "None" ? league : "None"];
    return d;
  }, [league]);

  const markdownDoc = leagueMarkdownDocs[league];

  const markdownBody = useMemo(() => {
    if (!markdownDoc) return null;
    return stripEmbeddedToc(markdownDoc);
  }, [markdownDoc]);

  const toc = useMemo(() => {
    if (!markdownDoc) return [];
    return parseMarkdownHeadings(markdownDoc);
  }, [markdownDoc]);

  const handleTocSelect = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <PageContainer direction="col" title="">
        <div className="grid grid-cols-12 w-full h-[calc(100vh-7rem)]">
          {/* Sidebar for league selection && table of contents */}
          <div className="col-span-2 min-w-0 h-full space-y-4 overflow-y-auto overflow-x-hidden pr-2">
            <Text variant="h3">
              {league !== "None" ? league : "Main"} Documentation
            </Text>
            <SelectDropdown
              options={leagueOptions}
              value={{
                label: league !== "None" ? league : "Main",
                value: league,
              }}
              onChange={handleLeagueChange}
            />
            {toc.length > 0 && (
              <DocTableOfContents
                toc={toc}
                activeId={activeId}
                onSelect={handleTocSelect}
              />
            )}
          </div>
          {/* Main content area */}
          <div className="col-span-10 min-w-0 h-full overflow-y-auto text-start px-4 space-y-2">
            {markdownBody ? (
              <MarkdownDoc content={markdownBody} />
            ) : (
              mainContentMemo &&
              mainContentMemo.map((item: MainContentItem, index: number) => (
                <Text
                  key={index}
                  variant={item.variant || "body-small"}
                  className={item.classes}
                >
                  {item.content}
                </Text>
              ))
            )}
          </div>
        </div>
      </PageContainer>
    </>
  );
};
