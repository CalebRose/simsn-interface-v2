import React from 'react';

interface TeamStatsSidebarProps {
  title: string;
  teamName: string;
  stats: any;
}

// Make absolutely sure 'export' is at the very beginning of the line
export const TeamStatsSidebar: React.FC<TeamStatsSidebarProps> = ({ title, teamName, stats }) => {
  return (
    <div className="bg-(--bg-secondary) p-4 rounded-lg border border-white/10 h-full">
      <h3 className="text-white font-black mb-2">{title}</h3>
      <div className="text-(--text-muted) text-sm">{teamName}</div>
      <div className="mt-4">
        {stats ? (
          <div className="text-white">Stats loaded...</div>
        ) : (
          <div className="text-gray-500 italic">No stats available yet.</div>
        )}
      </div>
    </div>
  );
};