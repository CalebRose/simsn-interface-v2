import { useEffect } from "react";
import { SimCollegeBaseball } from "../../../_constants/constants";
import { useSimBaseballStore } from "../../../context/SimBaseballContext";
import { PageContainer } from "../../../_design/Container";
import { Text } from "../../../_design/Typography";
import { BaseballScheduleView } from "./BaseballScheduleView";

export const CollegeBaseballSchedulePage = () => {
  const { collegeOrganization, seasonContext, bootstrappedOrgId, loadBootstrapForOrg } = useSimBaseballStore();

  useEffect(() => {
    if (collegeOrganization && collegeOrganization.id !== bootstrappedOrgId) {
      loadBootstrapForOrg(collegeOrganization.id);
    }
  }, [collegeOrganization?.id, bootstrappedOrgId, loadBootstrapForOrg]);

  if (!collegeOrganization || !seasonContext) {
    return <PageContainer><Text variant="h4">No college organization found.</Text></PageContainer>;
  }

  return (
    <BaseballScheduleView
      league={SimCollegeBaseball}
      organization={collegeOrganization}
      seasonContext={seasonContext}
    />
  );
};
