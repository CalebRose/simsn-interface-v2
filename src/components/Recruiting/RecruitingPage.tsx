import { FC, useEffect, useMemo } from "react";
import { League, SimCBB, SimCFB, SimCHL } from "../../_constants/constants";
import { useAuthStore } from "../../context/AuthContext";
import { getThemeColors } from "../../_utility/themeHelpers";
import { useLeagueStore } from "../../context/LeagueContext";
import { useSimHCKStore } from "../../context/SimHockeyContext";
import { useSimFBAStore } from "../../context/SimFBAContext";
import { useSimBBAStore } from "../../context/SimBBAContext";
import { PageContainer } from "../../_design/Container";
import { CHLRecruiting } from "./CHLRecruiting/CHLRecruiting";
import { CFBRecruiting } from "./CFBRecruiting/CFBRecruiting";
import { CBBRecruiting } from "./CBBRecruiting/CBBRecruiting";

interface RecruitingPageProps {
  league: League;
}

export const RecruitingPage: FC<RecruitingPageProps> = ({ league }) => {
  const { selectedLeague, setSelectedLeague } = useLeagueStore();
  const { chlTeam } = useSimHCKStore();
  const { cfbTeam, recruits: CFBRecruits } = useSimFBAStore();
  const { cbbTeam, recruits: CBBRecruits } = useSimBBAStore();

  useEffect(() => {
    if (selectedLeague !== league) {
      setSelectedLeague(league);
    }
  }, [selectedLeague]);

  const isLoading = useMemo(() => {
    if (selectedLeague === SimCHL && chlTeam) {
      return false;
    }
    if (selectedLeague === SimCBB && cbbTeam && CBBRecruits) {
      return false;
    }
    if (selectedLeague === SimCFB && cfbTeam && CFBRecruits) {
      return false;
    }
    return true;
  }, [chlTeam, cfbTeam, CFBRecruits, CBBRecruits, selectedLeague]);

  return (
    <>
      <PageContainer direction="col" isLoading={isLoading} title="Recruiting">
        {selectedLeague === SimCHL && chlTeam && <CHLRecruiting />}
        {selectedLeague === SimCBB && cbbTeam && <CBBRecruiting />}
        {selectedLeague === SimCFB && cfbTeam && <CFBRecruiting />}
      </PageContainer>
    </>
  );
};
