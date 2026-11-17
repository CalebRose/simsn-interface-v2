import { FC, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import routes from "../../_constants/routes";
import { vbLinkClass, vbLinkProps } from "./VbCommon";

/** The address of a coach's own page. */
export const vbCoachPath = (personId: number) =>
  routes.CVB_COACH_PERSON.replace(":personId", String(personId));

/**
 * A coach's or staff member's name, leading to their page: who they are,
 * where they have coached and every move they have made.
 */
export const VbCoachLink: FC<{
  personId: number | null | undefined;
  name: ReactNode;
  classes?: string;
}> = ({ personId, name, classes = "" }) => {
  const navigate = useNavigate();
  if (!personId) return <>{name}</>;
  return (
    <span
      {...vbLinkProps(() => navigate(vbCoachPath(personId)))}
      className={`${vbLinkClass} ${classes}`}
    >
      {name}
    </span>
  );
};
