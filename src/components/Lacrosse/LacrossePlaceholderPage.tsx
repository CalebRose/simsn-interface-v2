import { Border } from "../../_design/Borders";
import { PageContainer } from "../../_design/Container";
import { Text } from "../../_design/Typography";

type LacrosseLeague = "college" | "professional";
type LacrossePage = "home" | "teams" | "lineups";

interface LacrossePlaceholderPageProps {
  league: LacrosseLeague;
  page: LacrossePage;
}

export const LacrossePlaceholderPage = ({
  league,
  page,
}: LacrossePlaceholderPageProps) => {
  const leagueName =
    league === "college" ? "College Lacrosse" : "Professional Lacrosse";
  const pageName = page === "teams" ? "Teams" : page === "lineups" ? "Lineups" : "League Home";

  return (
    <PageContainer direction="col" title={`${leagueName} — ${pageName}`}>
      <Border classes="p-6 max-w-3xl">
        <Text variant="h5" classes="mb-2">
          SimLAX is coming to SimSN
        </Text>
        <Text variant="body-small">
          This {leagueName.toLowerCase()} page is ready for future integration.
          League data and team features will be added in a later milestone.
        </Text>
      </Border>
    </PageContainer>
  );
};
