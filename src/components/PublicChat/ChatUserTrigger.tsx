import { useState } from "react";
import type { ReactNode } from "react";
import { UserProfileCard } from "../Common/UserProfileCard";

interface ChatUserTriggerProps {
  uid: string;
  username: string;
  logoUrl?: string;
  onNavigate: () => void;
  onReport?: () => void;
  children: ReactNode;
}

type Activation = "idle" | "hover" | "click";

// Mounts the (hook-heavy) profile card lazily so a long message list does not
// fetch every sender's profile up front.
export const ChatUserTrigger = ({
  uid,
  username,
  logoUrl,
  onNavigate,
  onReport,
  children,
}: ChatUserTriggerProps) => {
  const [activation, setActivation] = useState<Activation>("idle");

  if (activation === "idle") {
    return (
      <span
        role="button"
        tabIndex={0}
        className="inline-block cursor-pointer"
        onMouseEnter={() => setActivation("hover")}
        onClick={() => setActivation("click")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setActivation("click");
          }
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <UserProfileCard
      uid={uid}
      username={username}
      logoUrl={logoUrl}
      triggerHover={activation === "hover"}
      openModalOnMount={activation === "click"}
      modalZIndexClass="z-[110]"
      onNavigate={onNavigate}
      extraActions={
        onReport ? (
          <button
            type="button"
            onClick={onReport}
            className="ml-auto rounded px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
          >
            Report
          </button>
        ) : undefined
      }
    >
      {children}
    </UserProfileCard>
  );
};
