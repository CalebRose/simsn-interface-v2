import { NavigateFunction, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, PillButton } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { useAuthStore } from "../../context/AuthContext";
import routes from "../../_constants/routes";
import { Border } from "../../_design/Borders";
import { ToggleSwitch } from "../../_design/Inputs";
import { Tab, TabGrid, TabGroup } from "../../_design/Tabs";
import {
  AdminRole,
  Bowls,
  ConfChampionships,
  Contracts,
  GameState,
  Postseason,
  Reports,
  Requests,
  SimCBB,
  SimCFB,
  SimCHL,
  SimCLAX,
  SimCollegeBaseball,
  SimMLB,
  SimNBA,
  SimNFL,
  SimPHL,
  Teams,
  Trades,
  Transactions,
  UDFAs,
} from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useAdminPage } from "../../context/AdminPageContext";
import { AdminTeamsTab } from "./AdminTeamsTab";
import { AdminRequestsTab } from "./AdminRequestsTab";
import { AdminStatesTab } from "./AdminStatesTab";
import { AdminConfChampionshipsTab } from "./AdminConfChampionshipsTab";
import { AdminCBBConfTournamentsTab } from "./AdminCBBConfTournamentsTab";
import { AdminCHLConfTournamentsTab } from "./AdminCHLConfTournamentsTab";
import { AdminBowlsTab } from "./AdminBowlsTab";
import { AdminPostseasonTab } from "./AdminPostseasonTab";
import { AdminNFLPostseasonTab } from "./AdminNFLPostseasonTab";
import { AdminCBBPostseasonTab } from "./AdminCBBPostseasonTab";
import { AdminNBAPostseasonTab } from "./AdminNBAPostseasonTab";
import { AdminCHLPostseasonTab } from "./AdminCHLPostseasonTab";
import { AdminNFLContractsTab } from "./AdminNFLContractsTab";
import { AdminNFLTransactionsTab } from "./AdminNFLTransactionsTab";
import { AdminTransactionsTab } from "./AdminTransactionsTab";
import { AdminNFLReportsTab } from "./AdminNFLReportsTab";
import { AdminNBAReportsTab } from "./AdminNBAReportsTab";
import { AdminPHLReportsTab } from "./AdminPHLReportsTab";
import { AdminCHLReportsTab } from "./AdminCHLReportsTab";
import { AdminReportsTab } from "./AdminReportsTab";
import { Refresh } from "../../_design/Icons";
import { CommissionerHub } from "./AdminComponents";
import { AdminTradesTab } from "./AdminTradesTab";
import { IFAAdminPanel } from "./IFAAdminPanel";
import { SimulationControlPanel } from "./SimulationControlPanel";
import { RecruitingAdminPanel } from "./RecruitingAdminPanel";
import { useMemo } from "react";
import { useSimBaseballStore } from "../../context/SimBaseballContext";
import { NFLUDFAAdminPanel } from "../Admin/NFLUDFAAdminPanel";
import { CollegeLacrosseAdminPage } from "../Lacrosse/CollegeLacrosseAdminPage";
import { useSimLAXStore } from "../../context/SimLAXContext";

const IFAAdminSection = () => {
  const { seasonContext } = useSimBaseballStore();
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  if (!leagueYearId) return null;
  return <IFAAdminPanel leagueYearId={leagueYearId} />;
};

const SimulationControlSection = () => {
  const { seasonContext } = useSimBaseballStore();
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  if (!leagueYearId) return null;
  return <SimulationControlPanel leagueYearId={leagueYearId} />;
};

const RecruitingAdminSection = () => {
  const { seasonContext } = useSimBaseballStore();
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  if (!leagueYearId) return null;
  return <RecruitingAdminPanel leagueYearId={leagueYearId} />;
};

interface UnAuthPageProps {
  navigate: NavigateFunction;
}

const UnAuthAdminPage: React.FC<UnAuthPageProps> = ({ navigate }) => {
  return (
    <PageContainer isLoading={false}>
      <div className="flex flex-col justify-center relative h-full mt-40">
        <Text variant="h3">Warning! Please return to Dashboard</Text>
        <Text variant="body" classes="mb-4">
          You are not an admin.
        </Text>
        <PillButton variant="danger" onClick={() => navigate(routes.HOME)}>
          Return to dashboard
        </PillButton>
      </div>
    </PageContainer>
  );
};

export const AdminPage = () => {
  const authStore = useAuthStore();
  const { currentUser } = authStore;
  const { RefreshRequests, selectedTab, setSelectedTab } = useAdminPage();
  const navigate = useNavigate();
  const { laxAdminStatus, laxAdminChecked } = useSimLAXStore();

  const isLaxAdmin = Boolean(laxAdminStatus?.isAdmin);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleID === AdminRole;
  }, [currentUser]);

  const isCFBCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleID?.includes("CFB Commissioner");
  }, [currentUser]);

  const isNFLCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleID?.includes("NFL Commissioner");
  }, [currentUser]);

  const isCBBCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.roleID?.includes("CBB Commissioner") ||
      currentUser.roleID?.includes("NBA Commissioner")
    );
  }, [currentUser]);

  const isNBACommissioner = useMemo(() => {
    if (!currentUser) return false;
    return (
      currentUser.roleID?.includes("CBB Commissioner") ||
      currentUser.roleID?.includes("NBA Commissioner")
    );
  }, [currentUser]);

  const isCHLCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleID?.includes("CHL Commissioner");
  }, [currentUser]);

  const isPHLCommissioner = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.roleID?.includes("PHL Commissioner");
  }, [currentUser]);

  const leagueStore = useLeagueStore();
  const { ts, selectedLeague, setSelectedLeague } = leagueStore;

  const columnCount = useMemo(() => {
    switch (selectedLeague) {
      case SimCFB:
        return 7;
      case SimNFL:
        return 9;
      case SimCBB:
        return 6;
      case SimNBA:
        return 9;
      case SimCHL:
        return 6;
      case SimCLAX:
        return 10;
      case SimPHL:
        return 9;
      case SimMLB:
        return 9;
      default:
        return 7;
    }
  }, [selectedLeague]);

  // Role gating logic
  if (!laxAdminChecked) {
    return (
      <PageContainer direction="col" isLoading={true} title="Admin">
        {null}
      </PageContainer>
    );
  }
  if (
    currentUser &&
    currentUser.roleID &&
    currentUser.roleID !== AdminRole &&
    !currentUser.roleID.includes("Commissioner") &&
    !isLaxAdmin
  ) {
    return <UnAuthAdminPage navigate={navigate} />;
  }

  return (
    <>
      <PageContainer direction="col" isLoading={false} title="Admin">
        <div className="flex flex-row">
          <Border classes="w-full px-4">
            <Text variant="h6" className="text-start mb-2">
              Leagues
            </Text>
            <ButtonGroup classes="justify-between flex-wrap gap-2 py-4">
              {(isAdmin || isCFBCommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimCFB}
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimCFB)}
                >
                  {SimCFB}
                </PillButton>
              )}
              {(isAdmin || isNFLCommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimNFL}
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimNFL)}
                >
                  {SimNFL}
                </PillButton>
              )}
              {(isAdmin || isCBBCommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimCBB}
                  variant="basketball"
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimCBB)}
                >
                  {SimCBB}
                </PillButton>
              )}
              {(isAdmin || isNBACommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimNBA}
                  variant="basketball"
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimNBA)}
                >
                  {SimNBA}
                </PillButton>
              )}
              {(isAdmin || isCHLCommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimCHL}
                  variant="hockey"
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimCHL)}
                >
                  {SimCHL}
                </PillButton>
              )}
              {(isAdmin || isPHLCommissioner) && (
                <PillButton
                  isSelected={selectedLeague === SimPHL}
                  variant="hockey"
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimPHL)}
                >
                  {SimPHL}
                </PillButton>
              )}
              {isLaxAdmin && (
                <PillButton
                  isSelected={selectedLeague === SimCLAX}
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimCLAX)}
                >
                  {SimCLAX}
                </PillButton>
              )}
              {isAdmin && (
                <PillButton
                  isSelected={selectedLeague === SimCollegeBaseball}
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimCollegeBaseball)}
                >
                  SimCBL
                </PillButton>
              )}
              {isAdmin && (
                <PillButton
                  isSelected={selectedLeague === SimMLB}
                  classes="w-[8rem]"
                  onClick={() => setSelectedLeague(SimMLB)}
                >
                  {SimMLB}
                </PillButton>
              )}
            </ButtonGroup>
          </Border>
        </div>
        {ts && selectedLeague !== SimCLAX && (
          <Border classes="w-full p-4 mt-2">
            <Text variant="h6">{selectedLeague} Controls</Text>
            <div className="flex flex-row justify-between pb-2">
              <div className="flex flex-col mx-1">
                <Text variant="body-small" className="text-start">
                  Run Cron
                </Text>
                <ToggleSwitch checked={ts!.RunCron} onChange={() => {}} />
              </div>
              <div className="flex flex-col mx-1">
                <Text variant="body-small" className="text-start">
                  Run Games
                </Text>
                <ToggleSwitch checked={ts!.RunGames} onChange={() => {}} />
              </div>
              <div className="flex flex-col mx-1">
                <Text variant="body-small" className="text-start">
                  Draft
                </Text>
                <ToggleSwitch checked={ts!.IsDraftTime} onChange={() => {}} />
              </div>
              <div className="flex flex-col mx-1">
                <Text variant="body-small" className="text-start">
                  Refresh
                </Text>
                <Button onClick={RefreshRequests}>
                  <Refresh />
                </Button>
              </div>
            </div>
          </Border>
        )}
        {selectedLeague !== SimCLAX && (
          <Border classes="w-full">
            <div className="flex flex-row flex-wrap w-full pt-1 pb-2 mb-2">
              <TabGrid classes="w-full" columns={columnCount}>
                <Tab
                  label={Requests}
                  selected={selectedTab === Requests}
                  setSelected={setSelectedTab}
                />
                <Tab
                  label={Teams}
                  selected={selectedTab === Teams}
                  setSelected={setSelectedTab}
                />
                <Tab
                  label={GameState}
                  selected={selectedTab === GameState}
                  setSelected={setSelectedTab}
                />
                {selectedLeague !== SimNFL &&
                  selectedLeague !== SimNBA &&
                  selectedLeague !== SimPHL &&
                  selectedLeague !== SimMLB && (
                    <Tab
                      label={ConfChampionships}
                      selected={selectedTab === ConfChampionships}
                      setSelected={setSelectedTab}
                    />
                  )}
                {selectedLeague === SimCFB && (
                  <>
                    <Tab
                      label={Bowls}
                      selected={selectedTab === Bowls}
                      setSelected={setSelectedTab}
                    />
                  </>
                )}
                <Tab
                  label={Postseason}
                  selected={selectedTab === Postseason}
                  setSelected={setSelectedTab}
                />
                {(selectedLeague === SimPHL ||
                  selectedLeague === SimNFL ||
                  selectedLeague === SimNBA ||
                  selectedLeague === SimMLB) && (
                  <>
                    <Tab
                      label={Trades}
                      selected={selectedTab === Trades}
                      setSelected={setSelectedTab}
                    />
                    <Tab
                      label={Contracts}
                      selected={selectedTab === Contracts}
                      setSelected={setSelectedTab}
                    />
                    <Tab
                      label={Transactions}
                      selected={selectedTab === Transactions}
                      setSelected={setSelectedTab}
                    />
                    {selectedLeague === SimNFL && (
                      <Tab
                        label={UDFAs}
                        selected={selectedTab === UDFAs}
                        setSelected={setSelectedTab}
                      />
                    )}
                  </>
                )}
                <Tab
                  label={Reports}
                  selected={selectedTab === Reports}
                  setSelected={setSelectedTab}
                />
              </TabGrid>
            </div>
            <div className="flex w-full max-h-[calc(65vh-10rem)] overflow-y-auto">
              {selectedTab === Requests && <AdminRequestsTab />}
              {selectedTab === Teams && <AdminTeamsTab />}
              {selectedTab === GameState && <AdminStatesTab />}
              {selectedTab === ConfChampionships &&
                selectedLeague === SimCFB && <AdminConfChampionshipsTab />}
              {selectedTab === ConfChampionships &&
                selectedLeague === SimCBB && <AdminCBBConfTournamentsTab />}
              {selectedTab === ConfChampionships &&
                selectedLeague === SimCHL && <AdminCHLConfTournamentsTab />}
              {selectedTab === Bowls && selectedLeague === SimCFB && (
                <AdminBowlsTab />
              )}
              {selectedTab === Postseason && selectedLeague === SimCFB && (
                <AdminPostseasonTab />
              )}
              {selectedTab === Postseason && selectedLeague === SimNFL && (
                <AdminNFLPostseasonTab />
              )}
              {selectedTab === Postseason && selectedLeague === SimCBB && (
                <AdminCBBPostseasonTab />
              )}
              {selectedTab === Postseason && selectedLeague === SimNBA && (
                <AdminNBAPostseasonTab />
              )}
              {selectedTab === Postseason && selectedLeague === SimCHL && (
                <AdminCHLPostseasonTab />
              )}
              {selectedTab === Trades && <AdminTradesTab />}
              {selectedTab === Contracts && selectedLeague === SimNFL && (
                <AdminNFLContractsTab />
              )}
              {selectedTab === Transactions && (
                <AdminTransactionsTab />
              )}
              {selectedTab === UDFAs && selectedLeague === SimNFL && (
                <div className="w-full p-4">
                  <NFLUDFAAdminPanel />
                </div>
              )}
              {selectedTab === Reports && selectedLeague === SimCFB && (
                <AdminReportsTab />
              )}
              {selectedTab === Reports && selectedLeague === SimNFL && (
                <AdminNFLReportsTab />
              )}
              {selectedTab === Reports && selectedLeague === SimNBA && (
                <AdminNBAReportsTab />
              )}
              {selectedTab === Reports && selectedLeague === SimPHL && (
                <AdminPHLReportsTab />
              )}
              {selectedTab === Reports && selectedLeague === SimCHL && (
                <AdminCHLReportsTab />
              )}
            </div>
          </Border>
        )}

        {selectedLeague === SimCLAX && <CollegeLacrosseAdminPage embedded />}

        {selectedLeague === SimMLB && <IFAAdminSection />}
        {(selectedLeague === SimMLB ||
          selectedLeague === SimCollegeBaseball) && (
          <SimulationControlSection />
        )}
        {selectedLeague === SimCollegeBaseball && <RecruitingAdminSection />}
      </PageContainer>
    </>
  );
};
