import React from 'react';

interface TeamStatsSidebarProps {
  title: string;
  teamName: string;
  stats: {
    isOffense: boolean;
    formation: string;
    tendency?: string | null;
    lastPlay?: string | null;
    yards?: number;
  } | null;
}

export const TeamStatsSidebar: React.FC<TeamStatsSidebarProps> = ({ title, teamName, stats }) => {
  return (
    <div className="bg-(--bg-secondary) p-4 rounded border border-white/10 h-full flex flex-col justify-between text-left">
      <div>
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
            <h3 className="text-white font-black uppercase text-xs tracking-wider">{title}</h3>
            {stats && (
                <span className={`text-[1vh] font-mono font-bold px-2 py-0.5 rounded ${
                    stats.isOffense ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                    {stats.isOffense ? 'OFFENSE' : 'DEFENSE'}
                </span>
            )}
        </div>
        <div className="text-white font-black text-base truncate">{teamName}</div>
        
        {stats ? (
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-(--text-muted) text-[1.1vh] uppercase font-bold tracking-widest">Current Formation</div>
              <div className="text-white text-sm font-semibold mt-0.5">{stats.formation || "Standard"}</div>
            </div>

            {stats.tendency && (
              <div>
                <div className="text-(--text-muted) text-[1.1vh] uppercase font-bold tracking-widest">Scheme Tendency</div>
                <div className="text-white text-sm font-semibold mt-0.5">{stats.tendency}</div>
              </div>
            )}

            {stats.isOffense && stats.lastPlay && (
              <div>
                <div className="text-(--text-muted) text-[1.1vh] uppercase font-bold tracking-widest">Last Play Call</div>
                <div className="text-white text-sm font-semibold mt-0.5">{stats.lastPlay}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 italic text-xs mt-4">Awaiting strategy data...</div>
        )}
      </div>

      {stats && stats.isOffense && stats.yards !== undefined && (
        <div className="bg-black/30 p-2.5 rounded border border-white/5 mt-auto">
            <div className="text-(--text-muted) text-[1vh] uppercase font-bold tracking-widest">Play Gain</div>
            <div className={`text-lg font-mono font-black ${stats.yards > 0 ? 'text-green-400' : stats.yards < 0 ? 'text-red-400' : 'text-white'}`}>
                {stats.yards > 0 ? `+${stats.yards}` : stats.yards} <span className="text-xs font-sans font-normal text-(--text-muted)">Yds</span>
            </div>
        </div>
      )}
    </div>
  );
};