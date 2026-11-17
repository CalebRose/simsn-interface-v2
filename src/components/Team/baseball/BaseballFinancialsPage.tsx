import { useCallback, useEffect, useMemo, useState } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { PageContainer } from "../../../_design/Container";
import {
  SportBannerAside,
  SportBannerPicker,
  useSportBannerContent,
} from "../../Common/SportBanner";
import { TabGroup, Tab } from "../../../_design/Tabs";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { SimMLB } from "../../../_constants/constants";
import { getLogo } from "../../../_utility/getLogo";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { useAuthStore } from "../../../context/AuthContext";
import { ScoutingDepartmentPanel } from "./BaseballScouting/ScoutingDepartmentPanel";
import { ScoutingBudget } from "../../../models/baseball/baseballScoutingModels";
import { BaseballService } from "../../../_services/baseballService";
import {
  FINANCIALS_TABS,
  OVERVIEW_TAB,
  LEDGER_TAB,
  CONTRACTS_TAB,
} from "./BaseballFinancials/financialConstants";
import { OverviewTab } from "./BaseballFinancials/OverviewTab";
import { LedgerTab } from "./BaseballFinancials/LedgerTab";
import { ContractsTab } from "./BaseballFinancials/ContractsTab";

export const BaseballFinancialsPage = () => {
  const { currentUser } = useAuthStore();
  const {
    organizations,
    mlbOrganization,
    seasonContext,
  } = useSimBaseballStore();

  const [selectedTab, setSelectedTab] = useState(OVERVIEW_TAB);

  const userOrg = mlbOrganization;
  const leagueYearId = seasonContext?.current_league_year_id ?? 0;
  const leagueYear = seasonContext?.league_year ?? 0;

  // --- Org selector ---
  const [viewedOrgId, setViewedOrgId] = useState<number | null>(null);

  const leagueOrgs = useMemo(() => {
    if (!organizations) return [];
    return organizations
      .filter((o) => o.league === "mlb")
      .sort((a, b) => a.org_abbrev.localeCompare(b.org_abbrev));
  }, [organizations]);

  const viewedOrg = useMemo(() => {
    if (viewedOrgId == null) return userOrg;
    return organizations?.find((o) => o.id === viewedOrgId) ?? userOrg;
  }, [viewedOrgId, organizations, userOrg]);

  const orgOptions: SelectOption[] = useMemo(() => {
    return leagueOrgs.map((org) => {
      const t = org.teams?.["mlb"];
      return {
        value: String(org.id),
        label: t?.team_full_name || org.org_abbrev,
      };
    });
  }, [leagueOrgs]);

  const selectedOrgOption = useMemo(() => {
    return orgOptions.find((o) => o.value === String(viewedOrg?.id)) ?? null;
  }, [orgOptions, viewedOrg]);

  const handleOrgChange = useCallback(
    (orgId: number) => {
      setViewedOrgId(orgId === userOrg?.id ? null : orgId);
    },
    [userOrg?.id],
  );

  // --- Scouting department (for department panel) ---
  const [scoutingBudget, setScoutingBudget] = useState<ScoutingBudget | null>(null);
  const [deptEligible, setDeptEligible] = useState(false);
  const viewedOrgIdForBudget = viewedOrg?.id ?? 0;

  const refreshScoutingBudget = useCallback(() => {
    if (viewedOrgIdForBudget && leagueYearId) {
      BaseballService.GetScoutingBudget(viewedOrgIdForBudget, leagueYearId)
        .then(setScoutingBudget)
        .catch(() => {});
    }
  }, [viewedOrgIdForBudget, leagueYearId]);

  useEffect(() => {
    refreshScoutingBudget();
  }, [refreshScoutingBudget]);

  // Check scouting department eligibility
  useEffect(() => {
    if (!viewedOrgIdForBudget || !leagueYearId) {
      setDeptEligible(false);
      return;
    }
    let cancelled = false;
    BaseballService.GetDepartmentStatus(viewedOrgIdForBudget, leagueYearId)
      .then((d) => { if (!cancelled) setDeptEligible(d?.eligible ?? false); })
      .catch(() => { if (!cancelled) setDeptEligible(false); });
    return () => { cancelled = true; };
  }, [viewedOrgIdForBudget, leagueYearId]);

  // --- Derived display ---

  const organization = viewedOrg;

  const logo = useMemo(() => {
    if (!organization?.teams) return "";
    const mlbTeam = organization.teams["mlb"];
    if (mlbTeam)
      return getLogo(SimMLB, mlbTeam.team_id, currentUser?.IsRetro);
    return "";
  }, [organization, currentUser?.IsRetro]);

  const pageTitle = useMemo(() => {
    if (!organization) return "";
    const mlbTeam = organization.teams?.["mlb"];
    if (mlbTeam?.team_full_name) return mlbTeam.team_full_name;
    return organization.org_abbrev;
  }, [organization]);

  // The organisation on screen is the banner's.
  useSportBannerContent(
    organization ? { title: pageTitle, logo: logo || undefined } : null,
  );

  if (!organization) {
    return (
      <PageContainer>
        <Text variant="h4">No organization found.</Text>
      </PageContainer>
    );
  }

  const orgAbbrev = organization.org_abbrev;

  return (
    <PageContainer>
      <div className="flex-col w-full px-2 sm:px-4 md:px-0 md:mb-6">
        {/* On the banner: the organisation picker. */}
        {orgOptions.length > 1 && (
          <SportBannerAside>
            <SportBannerPicker
              options={orgOptions}
              value={selectedOrgOption}
              onChange={(opt) => {
                if (opt) handleOrgChange(Number((opt as SelectOption).value));
              }}
              isSearchable
              placeholder="Select organization..."
            />
          </SportBannerAside>
        )}

        {/* Scouting Department */}
        {deptEligible && viewedOrgIdForBudget > 0 && leagueYearId > 0 && (
          <Border classes="p-4 mb-2">
            <Text variant="h6" classes="font-semibold mb-2">Scouting Department</Text>
            <ScoutingDepartmentPanel
              orgId={viewedOrgIdForBudget}
              leagueYearId={leagueYearId}
              budget={scoutingBudget}
              onPurchased={refreshScoutingBudget}
            />
          </Border>
        )}

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
          {selectedTab === OVERVIEW_TAB && (
            <OverviewTab orgAbbrev={orgAbbrev} leagueYear={leagueYear} />
          )}

          {/* Ledger Tab */}
          {selectedTab === LEDGER_TAB && (
            <LedgerTab orgAbbrev={orgAbbrev} leagueYear={leagueYear} />
          )}

          {/* Contracts Tab */}
          {selectedTab === CONTRACTS_TAB && (
            <ContractsTab orgId={organization.id} leagueYearId={leagueYearId} />
          )}
        </Border>
      </div>
    </PageContainer>
  );
};
