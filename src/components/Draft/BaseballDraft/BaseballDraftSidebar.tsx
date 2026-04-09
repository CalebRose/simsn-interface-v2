import React from "react";
import { BaseballDraftTab } from "../../../models/baseball/baseballDraftModels";
import { useResponsive } from "../../../_hooks/useMobile";

interface BaseballDraftSidebarProps {
  activeTab: BaseballDraftTab;
  onTabChange: (tab: BaseballDraftTab) => void;
  isAdmin: boolean;
  showSigning: boolean;
  hasOrg: boolean;
  autoRoundsLocked: boolean;
}

interface TabConfig {
  key: BaseballDraftTab;
  label: string;
  icon: React.ReactNode;
}

const GridIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const ListIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);

const PenIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3.414a2 2 0 01.586-1.414z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const QueueIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const MyPicksIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BaseballDraftSidebar: React.FC<BaseballDraftSidebarProps> = ({
  activeTab,
  onTabChange,
  isAdmin,
  showSigning,
  hasOrg,
  autoRoundsLocked,
}) => {
  const tabs: TabConfig[] = [
    { key: "bigboard", label: "Big Board", icon: <GridIcon /> },
    { key: "eligible", label: "Eligible Players", icon: <ListIcon /> },
    { key: "scouting", label: "Scouting", icon: <SearchIcon /> },
    { key: "warroom", label: "War Room", icon: <BriefcaseIcon /> },
  ];

  if (hasOrg) {
    tabs.push({ key: "preferences", label: "Preferences", icon: <QueueIcon /> });
    tabs.push({ key: "mypicks", label: "My Picks", icon: <MyPicksIcon /> });
  }

  if (showSigning) {
    tabs.push({ key: "signing", label: "Pick Signing", icon: <PenIcon /> });
  }

  if (isAdmin) {
    tabs.push({ key: "admin", label: "Admin", icon: <SettingsIcon /> });
  }

  const { isMobile, isTablet } = useResponsive();
  const isCompact = isMobile || isTablet;

  return (
    <div className={`flex ${isCompact ? "flex-row overflow-x-auto gap-2 py-2" : "flex-col gap-1"} rounded-lg bg-gray-900 p-2`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              flex items-center gap-2 sm:gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors whitespace-nowrap
              ${isCompact ? "shrink-0" : "w-full"}
              ${isActive ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"}
            `}
          >
            {tab.icon}
            {!isMobile && <span>{tab.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default BaseballDraftSidebar;
