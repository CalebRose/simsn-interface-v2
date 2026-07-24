import React from "react";
import { League, SimNBA } from "../../../_constants/constants";

interface NBADraftPageProps {
  league: League;
}

export const NBADraftPage: React.FC<NBADraftPageProps> = ({ league }) => {
  return <div>NBA Draft Page for {league === SimNBA ? "SimNBA" : ""}</div>;
};
