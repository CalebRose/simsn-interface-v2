import { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";
import { Logo } from "../../_design/Logo";
import { getLaxLogoUrl, LaxTeam } from "../../_services/lacrosseService";

// Spans rather than buttons: the global button styles add a hover box and focus ring.
export const linkProps = (onActivate: () => void) => ({
  role: "link",
  tabIndex: 0,
  onClick: onActivate,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") onActivate();
  },
});

export const LaxTeamLink = ({ team }: { team: LaxTeam }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-2">
      <Logo url={getLaxLogoUrl(team.logoFileName)} variant="tiny" />
      <span {...linkProps(() => navigate(routes.CLAX_TEAM.replace(":teamId?", String(team.id))))} className="cursor-pointer font-semibold transition-colors hover:text-[#fcd53f]">
        {team.abbreviation || team.name}
      </span>
    </div>
  );
};

export const LaxCoachLink = ({ coach }: { coach?: string }) => {
  const navigate = useNavigate();
  if (!coach) return <span>AI</span>;
  return (
    <span {...linkProps(() => navigate(routes.USER.replace(":username", coach)))} className="cursor-pointer transition-colors hover:text-[#fcd53f]">
      {coach}
    </span>
  );
};
