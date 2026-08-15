import React, { useMemo } from "react";
import { PageContainer } from "../../_design/Container";
import { Text, TextVariant } from "../../_design/Typography";
import { useLeagueStore } from "../../context/LeagueContext";
import { SelectDropdown } from "../../_design/Select";
import { League } from "../../_constants/constants";
import mainContent from "./maincontent.json";

type Documentation = {
  [key: string]: MainContentItem[];
};

type MainContentItem = {
  variant: TextVariant;
  content: string;
  classes: string;
};

export const DocumentationMain = () => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const [league, setLeague] = React.useState<string>(selectedLeague);

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

  return (
    <>
      <PageContainer direction="col" title="">
        <div className="grid grid-cols-12 w-full space-x-4">
          <div className="col-span-2">
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
          </div>
          <div className="col-span-10 text-start px-4 space-y-2">
            {mainContentMemo &&
              mainContentMemo.map((item: MainContentItem, index: number) => (
                <Text
                  key={index}
                  variant={item.variant || "body-small"}
                  className={item.classes}
                >
                  {item.content}
                </Text>
              ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
};
