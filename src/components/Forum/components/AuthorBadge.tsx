import React from "react";
import { ForumRole } from "../../../models/forumModels";

interface AuthorBadgeProps {
  role?: ForumRole;
  league?: string;
}

const ROLE_BADGES: Partial<Record<ForumRole, { label: string; cls: string }>> =
  {
    admin: {
      label: "Admin",
      cls: "bg-(--accent-error)/20 text-(--accent-error)",
    },
    commissioner: {
      label: "Commish",
      cls: "bg-(--accent-warning)/20 text-(--accent-warning)",
    },
    subscriber: {
      label: "Subscriber",
      cls: "bg-(--accent-success)/20 text-(--accent-success)",
    },
  };

const pill = "rounded-sm px-1.5 text-[11px] font-medium leading-5";

/** Role and league flair shown beside a username. Renders nothing for plain members. */
export const AuthorBadge: React.FC<AuthorBadgeProps> = ({ role, league }) => {
  const roleBadge = role ? ROLE_BADGES[role] : undefined;
  if (!roleBadge && !league) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {roleBadge && (
        <span className={`${pill} ${roleBadge.cls}`}>{roleBadge.label}</span>
      )}
      {league && (
        <span
          className={`${pill} bg-(--text-primary)/10 text-(--text-secondary)`}
        >
          {league}
        </span>
      )}
    </span>
  );
};
