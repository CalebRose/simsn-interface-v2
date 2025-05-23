import { NavigateFunction, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, PillButton } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";
import { useAuthStore } from "../../context/AuthContext";
import routes from "../../_constants/routes";
import { Border } from "../../_design/Borders";
import { ToggleSwitch } from "../../_design/Inputs";
import { Tab, TabGroup } from "../../_design/Tabs";
import {
  AdminRole,
  Requests,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
  Teams,
  Trades,
} from "../../_constants/constants";
import { useLeagueStore } from "../../context/LeagueContext";
import { useAdminPage } from "../../context/AdminPageContext";
import { AdminTeamsTab } from "./AdminTeamsTab";
import { AdminRequestsTab } from "./AdminRequestsTab";
import { Refresh } from "../../_design/Icons";
import { CommissionerHub } from "./AdminComponents";
import { AdminTradesTab } from "./AdminTradesTab";

interface UnAuthPageProps {
  navigate: NavigateFunction;
}

const UnAuthAdminPage: React.FC<UnAuthPageProps> = ({ navigate }) => {
  return (
    <PageContainer isLoading={false}>
      <div className="flex flex-col justify-center relative h-[100%] mt-[10rem]">
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
  const { RefreshRequests } = useAdminPage();
  const navigate = useNavigate();
  if (currentUser && currentUser.roleID && currentUser.roleID !== AdminRole) {
    return <UnAuthAdminPage navigate={navigate} />;
  }
  const leagueStore = useLeagueStore();
  const { ts, selectedLeague, setSelectedLeague } = leagueStore;
  const { selectedTab, setSelectedTab } = useAdminPage();

  return (
    <>
      <PageContainer direction="col" isLoading={false} title="Admin">
        <div className="flex flex-row">
          <Border classes="w-full px-4">
            <Text variant="h6" className="text-start mb-2">
              Leagues
            </Text>
            <ButtonGroup classes="justify-between flex-wrap gap-2">
              <PillButton
                isSelected={selectedLeague === SimCFB}
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimCFB)}
              >
                {SimCFB}
              </PillButton>
              <PillButton
                isSelected={selectedLeague === SimNFL}
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimNFL)}
              >
                {SimNFL}
              </PillButton>
              <PillButton
                isSelected={selectedLeague === SimNBA}
                variant="basketball"
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimNBA)}
              >
                {SimCBB}
              </PillButton>
              <PillButton
                isSelected={selectedLeague === SimCBB}
                variant="basketball"
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimNBA)}
              >
                {SimNBA}
              </PillButton>
              <PillButton
                isSelected={selectedLeague === SimCHL}
                variant="hockey"
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimCHL)}
              >
                {SimCHL}
              </PillButton>
              <PillButton
                isSelected={selectedLeague === SimPHL}
                variant="hockey"
                classes="w-[8rem]"
                onClick={() => setSelectedLeague(SimPHL)}
              >
                {SimPHL}
              </PillButton>
            </ButtonGroup>
          </Border>
        </div>
        {ts && (
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
                <Button>
                  <Refresh />
                </Button>
              </div>
            </div>
          </Border>
        )}
        <Border classes="w-full">
          <div className="flex flex-row flex-wrap justify-between pt-1 pb-2 mb-2">
            <TabGroup classes="flex flex-grow justify-between">
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
              {selectedLeague === SimPHL && (
                <>
                  <Tab
                    label={Trades}
                    selected={selectedTab === Trades}
                    setSelected={setSelectedTab}
                  />
                </>
              )}
            </TabGroup>
          </div>
          <div className="flex sm:flex-col md:flex-row md:justify-evenly flex-wrap md:gap-2 w-full max-h-[calc(55vh-12rem)] overflow-y-auto">
            {/* Logic for league select & tab selected here */}
            {selectedTab === Requests && <AdminRequestsTab />}
            {selectedTab === Teams && <AdminTeamsTab />}
            {selectedTab === Trades && <AdminTradesTab />}
          </div>
        </Border>
        {selectedLeague === SimNFL && (
          <Border classes="w-full sm:max-w-[65vw]">
            <div className="flex justify-center p-4">
              <Text variant="h6">{selectedLeague} Commissioner Hub</Text>
            </div>
            <CommissionerHub league={selectedLeague} />
          </Border>
        )}
      </PageContainer>
    </>
  );
};
