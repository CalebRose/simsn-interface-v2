import { useEffect } from "react";
import { SimMLB } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { PageContainer } from "../../../_design/Container";
import { Text } from "../../../_design/Typography";
import { BaseballScheduleView } from "./BaseballScheduleView";

export const MLBSchedulePage = () => {
  const { mlbOrganization, seasonContext, bootstrappedOrgId, loadBootstrapForOrg } = useSimBaseballStore();

  useEffect(() => {
    if (mlbOrganization && mlbOrganization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(mlbOrganization.id);
    }
  }, [mlbOrganization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  if (!mlbOrganization || !seasonContext) {
    return <PageContainer><Text variant="h4">No MLB organization found.</Text></PageContainer>;
  }

  return (
    <BaseballScheduleView
      league={SimMLB}
      organization={mlbOrganization}
      seasonContext={seasonContext}
    />
  );
};
