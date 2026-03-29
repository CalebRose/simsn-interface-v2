import React from "react";
import { Link } from "react-router-dom";
import { Text } from "../../../_design/Typography";

interface Crumb {
  label: string;
  href?: string;
}

interface ForumBreadcrumbsProps {
  crumbs: Crumb[];
}

export const ForumBreadcrumbs: React.FC<ForumBreadcrumbsProps> = ({
  crumbs,
}) => {
  return (
    <nav className="flex items-center gap-1 text-sm mb-3 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <Text variant="secondary" className="mx-1">
                /
              </Text>
            )}
            {crumb.href && !isLast ? (
              <Link
                to={crumb.href}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <Text variant="secondary">{crumb.label}</Text>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
