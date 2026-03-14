import { useCallback, useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PageContainer } from "../../../_design/Container";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimCollegeBaseball, SimMLB } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { formatMoney } from "./BaseballFinancials/financialConstants";
import {
  FINANCIALS_TABS,
  OVERVIEW_TAB,
  CONTRACTS_TAB,
  SERVICE_TIME_TAB,
} from "./BaseballFinancials/financialConstants";
import { OverviewTab } from "./BaseballFinancials/OverviewTab";
import { ContractsTab } from "./BaseballFinancials/ContractsTab";
import { ServiceTimeTab } from "./BaseballFinancials/ServiceTimeTab";

interface BaseballFinancialsPageProps {
  league: string;
}

export const BaseballFinancialsPage = ({ league }: BaseballFinancialsPageProps) => {
  const { currentUser } = useAuthStore();
  const { organizations, mlbOrganization, collegeOrganization, financials, seasonContext, loadBootstrapForOrg } =
    useSimBaseballStore();

  const [selectedTab, setSelectedTab] = useState(OVERVIEW_TAB);

  const userOrg =
    league === SimMLB ? mlbOrganization : collegeOrganization;

  // --- Org selector ---
  const [viewedOrgId, setViewedOrgId] = useState<number | null>(null);

  const leagueKey = league === SimMLB ? "mlb" : "college";

  const leagueOrgs = useMemo(() => {
    if (!organizations) return [];
    return organizations
      .filter((o) => o.league === leagueKey)
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev));
  }, [organizations, leagueKey]);

  const viewedOrg = useMemo(() => {
    if (viewedOrgId == null) return userOrg;
    return organizations?.find((o) => o.id === viewedOrgId) ?? userOrg;
  }, [viewedOrgId, organizations, userOrg]);

  const orgOptions: SelectOption[] = useMemo(() => {
    return leagueOrgs.map((org) => {
      const t = league === SimMLB ? org.teams?.["mlb"] : Object.values(org.teams ?? {})[0];
      return { value: String(org.id), label: t?.team_full_name || org.org_abbrev };
    });
  }, [leagueOrgs, league]);

  const selectedOrgOption = useMemo(() => {
    return orgOptions.find((o) => o.value === String(viewedOrg?.id)) ?? null;
  }, [orgOptions, viewedOrg]);

  const handleOrgChange = useCallback(
    (orgId: number) => {
      setViewedOrgId(orgId === userOrg?.id ? null : orgId);
      loadBootstrapForOrg(orgId);
    },
    [userOrg?.id, loadBootstrapForOrg],
  );

  // --- Derived display ---

  const organization = viewedOrg;

  const logo = useMemo(() => {
    if (!organization?.teams) return "";
    if (league === SimMLB) {
      const mlbTeam = organization.teams["mlb"];
      if (mlbTeam)
        return getLogo(SimMLB, mlbTeam.team_id, currentUser?.isRetro);
    }
    if (league === SimCollegeBaseball) {
      const teamEntries = Object.values(organization.teams);
      if (teamEntries.length > 0)
        return getLogo(
          SimCollegeBaseball,
          teamEntries[0].team_id,
          currentUser?.isRetro,
        );
    }
    return "";
  }, [organization, league, currentUser?.isRetro]);

  const pageTitle = useMemo(() => {
    if (!organization) return "";
    const mlbTeam = organization.teams?.["mlb"];
    if (mlbTeam?.team_full_name) return mlbTeam.team_full_name;
    return organization.org_abbrev;
  }, [organization]);

  const seasonLabel = seasonContext
    ? `Season ${seasonContext.league_year}`
    : "";

  if (!organization) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex-col w-[95vw] sm:w-[90vw] md:w-full md:mb-6 px-2">
        {/* Org selector */}
        {orgOptions.length > 1 && (
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="min-w-[280px] max-w-[400px]">
              <SelectDropdown
                options={orgOptions}
                value={selectedOrgOption}
                onChange={(opt) => {
                  if (opt) handleOrgChange(Number((opt as SelectOption).value));
                }}
                isSearchable
                placeholder="Select organization..."
              />
            </div>
          </div>
        )}

        {/* Header */}
        <Border classes="p-4 mb-2">
          <div className="flex items-center gap-4">
            {logo && (
              <img
                src={logo}
                className="w-12 h-12 object-contain"
                alt={organization.org_abbrev}
              />
            )}
            <div>
              <Text variant="h4">{pageTitle} Financials</Text>
              {seasonLabel && (
                <Text
                  variant="small"
                  classes="text-gray-500 dark:text-gray-400"
                >
                  {seasonLabel}
                </Text>
              )}
            </div>
          </div>
        </Border>

        {/* Tabs */}
        <Border classes="p-4">
          <TabGroup classes="mb-4">
            {FINANCIALS_TABS.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                selected={selectedTab === tab}
                setSelected={setSelectedTab}
              />
            ))}
          </TabGroup>

          {/* Overview Tab */}
          {selectedTab === OVERVIEW_TAB && financials && (
            <OverviewTab financials={financials} />
          )}
          {selectedTab === OVERVIEW_TAB && !financials && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Text variant="body" classes="font-semibold">
                  Cash Balance
                </Text>
                <Text variant="h5" classes="font-bold">
                  {formatMoney(organization.cash ?? 0)}
                </Text>
              </div>
              <Text
                variant="body-small"
                classes="text-gray-500 dark:text-gray-400"
              >
                Detailed financial data not yet available.
              </Text>
            </div>
          )}

          {/* Contracts Tab */}
          {selectedTab === CONTRACTS_TAB && (
            <ContractsTab orgId={organization.id} />
          )}

          {/* Service Time Tab */}
          {selectedTab === SERVICE_TIME_TAB && (
            <ServiceTimeTab orgId={organization.id} />
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
