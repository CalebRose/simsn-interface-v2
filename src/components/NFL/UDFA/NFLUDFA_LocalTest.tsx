import React, { useMemo, useState } from 'react';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { Table, TableCell } from '../../../_design/Table';
import { Button, ButtonGroup } from '../../../_design/Buttons';
import { Text } from '../../../_design/Typography';
import { TabGroup, Tab } from '../../../_design/Tabs';
import { Plus } from '../../../_design/Icons';
import { useTeamColors } from '../../../_hooks/useTeamColors';
import { useBackgroundColor } from '../../../_hooks/useBackgroundColor';

const MOCK_PLAYERS = [
    { ID: 9901, FirstName: "Speedy", LastName: "McCatch", Position: "WR", Archetype: "Deep Threat", OverallGrade: "B" },
    { ID: 9902, FirstName: "Tank", LastName: "Smash", Position: "RB", Archetype: "Power", OverallGrade: "C+" },
    { ID: 9903, FirstName: "Cannon", LastName: "Arm", Position: "QB", Archetype: "Gunslinger", OverallGrade: "C" },
    { ID: 9904, FirstName: "Brick", LastName: "Wall", Position: "OT", Archetype: "Pass Blocker", OverallGrade: "B-" },
    { ID: 9905, FirstName: "Hit", LastName: "Stick", Position: "MLB", Archetype: "Run Stopper", OverallGrade: "C+" },
    { ID: 9906, FirstName: "Sticky", LastName: "Hands", Position: "CB", Archetype: "Man Coverage", OverallGrade: "B" },
];

export const NFLUDFA_LocalTest = () => {
    const { nflTeam, nflDraftees } = useSimFBAStore();
    const { backgroundColor } = useBackgroundColor();
    const teamColors = useTeamColors(nflTeam?.ColorOne || "#1f2937", nflTeam?.ColorTwo || "#111827");
    
    const [selectedTab, setSelectedTab] = useState("Available UDFAs");
    const [localBoard, setLocalBoard] = useState<any[]>([]);
    const [simulationResults, setSimulationResults] = useState<any[] | null>(null);

    const pointsRemaining = 20 - localBoard.reduce((sum, p) => sum + p.Points, 0);

    const availableUDFAs = useMemo(() => {
        if (nflDraftees && nflDraftees.length > 0) {
            const undrafted = nflDraftees.filter((player: any) => player.DraftPickID === 0 || player.DraftedTeamID === 0);
            if (undrafted.length > 0) return undrafted;
        }
        return MOCK_PLAYERS;
    }, [nflDraftees]);

    const addPlayer = (e: React.MouseEvent, player: any) => {
        e.stopPropagation(); e.preventDefault();
        setLocalBoard([...localBoard, { PlayerID: player.ID, PlayerName: `${player.FirstName} ${player.LastName}`, Position: player.Position, Points: 0 }]);
    };

    const runSimulation = () => {
        const results = localBoard.map(bid => {
            const aiBid = Math.floor(Math.random() * 21);
            let won = bid.Points > aiBid;
            let tied = bid.Points === aiBid;
            if (tied) won = Math.random() > 0.5;
            return { ...bid, aiBid, won, tied };
        });
        setSimulationResults(results);
        setSelectedTab("Results");
    };

    // FIXED: REMOVED THE RETURN NULL GATE
    return (
        <div className="w-full min-h-screen p-4 flex flex-col gap-y-4 bg-gray-900" style={{ backgroundColor }}>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter border-l-8 pl-4 mb-2" style={{ borderColor: teamColors.One }}>LOCAL TEST: NFL UDFA</h1>

            <div className="flex justify-center w-full mb-2">
                <TabGroup>
                    <Tab label="Available UDFAs" selected={selectedTab === "Available UDFAs"} setSelected={setSelectedTab} />
                    <Tab label="My Bidding Board" selected={selectedTab === "My Bidding Board"} setSelected={setSelectedTab} />
                    {simulationResults && <Tab label="Results" selected={selectedTab === "Results"} setSelected={setSelectedTab} />}
                </TabGroup>
            </div>

            <div className="w-full flex flex-col">
                {selectedTab === "Available UDFAs" && (
                    <div className="flex flex-col border-2 rounded-xl p-6 w-full shadow-2xl" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <Text variant="h5" classes="text-yellow-500 font-bold mb-4 uppercase italic">Sandbox Mode</Text>
                        <Table
                            team={nflTeam || ({} as any)}
                            columns={[{ header: "Name", accessor: "PlayerName" }, { header: "Pos", accessor: "Position" }, { header: "Archetype", accessor: "Archetype" }, { header: "Overall", accessor: "OverallGrade" }, { header: "Action", accessor: "" }]}
                            data={availableUDFAs}
                            rowRenderer={(player: any, index: number, bg: string) => {
                                const isOnBoard = localBoard.some(p => p.PlayerID === player.ID);
                                return (
                                    <div className="table-row border-b border-gray-700" style={{ backgroundColor: bg }} key={player.ID}>
                                        <TableCell classes="font-bold text-lg">{player.FirstName} {player.LastName}</TableCell>
                                        <TableCell>{player.Position}</TableCell>
                                        <TableCell>{player.Archetype}</TableCell>
                                        <TableCell classes="font-mono font-bold text-lg">{player.OverallGrade}</TableCell>
                                        <TableCell>
                                            <button onClick={(e) => addPlayer(e, player)} disabled={isOnBoard} className={`p-1 rounded flex items-center justify-center transition-all ${isOnBoard ? 'bg-gray-600 opacity-50' : 'bg-green-600 hover:scale-110 shadow-lg'}`}>
                                                {isOnBoard ? <Text classes="text-xs px-1 text-white">Added</Text> : <Plus />}
                                            </button>
                                        </TableCell>
                                    </div>
                                );
                            }}
                        />
                    </div>
                )}

                {selectedTab === "My Bidding Board" && (
                    <div className="flex flex-col border-2 rounded-xl p-6 w-full shadow-2xl" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-black bg-opacity-30 border border-gray-700">
                            <Text variant="h5" classes={pointsRemaining < 5 ? "text-red-500 font-bold" : "text-green-400 font-bold"}>Points Available: {pointsRemaining} / 20</Text>
                            <Button variant="success" onClick={runSimulation}>RUN MOCK SIMULATION</Button>
                        </div>
                        <Table
                            team={nflTeam}
                            columns={[{ header: "Player", accessor: "PlayerName" }, { header: "Pos", accessor: "Position" }, { header: "Bid (1-20)", accessor: "Points" }, { header: "Actions", accessor: "" }]}
                            data={localBoard}
                            rowRenderer={(profile: any, index: number, bg: string) => (
                                <div className="table-row border-b border-gray-700" style={{ backgroundColor: bg }} key={profile.PlayerID}>
                                    <TableCell classes="font-bold">{profile.PlayerName}</TableCell>
                                    <TableCell>{profile.Position}</TableCell>
                                    <TableCell>
                                        <input
                                            type="number" value={profile.Points}
                                            onChange={(e: any) => {
                                                const v = parseInt(e.target.value) || 0;
                                                setLocalBoard(prev => prev.map(p => p.PlayerID === profile.PlayerID ? { ...p, Points: v } : p));
                                            }}
                                            className="w-24 bg-gray-900 text-white border border-gray-600 rounded p-1 text-center font-bold text-lg"
                                        />
                                    </TableCell>
                                    <TableCell><Button variant="danger" size="sm" onClick={() => setLocalBoard(prev => prev.filter(p => p.PlayerID !== profile.PlayerID))}>Remove</Button></TableCell>
                                </div>
                            )}
                        />
                    </div>
                )}

                {selectedTab === "Results" && simulationResults && (
                    <div className="flex flex-col border-2 rounded-xl p-6 w-full shadow-2xl" style={{ borderColor: '#10b981', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                            <Text variant="h4" classes="text-green-400 uppercase font-black italic">Final Results</Text>
                            <Button onClick={() => { setLocalBoard([]); setSimulationResults(null); setSelectedTab("Available UDFAs"); }}>Reset Sandbox</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {simulationResults.map((res: any) => (
                                <div key={res.PlayerID} className={`p-6 rounded-xl border-2 transition-all shadow-lg ${res.won ? 'border-green-500 bg-green-900 bg-opacity-30' : 'border-red-500 bg-red-900 bg-opacity-30 opacity-70'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div><Text variant="h6" classes="font-bold text-white">{res.PlayerName}</Text><Text variant="body" classes="text-gray-400 uppercase tracking-widest">{res.Position}</Text></div>
                                        <div className={`px-3 py-1 rounded font-black text-sm ${res.won ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>{res.won ? 'SIGNED' : 'OUTBID'}</div>
                                    </div>
                                    <div className="flex gap-8 border-t border-gray-700 pt-4">
                                        <div><p className="text-xs text-gray-500 uppercase font-bold">Your Bid</p><p className="text-2xl font-black text-white">{res.Points}</p></div>
                                        <div><p className="text-xs text-gray-500 uppercase font-bold">AI Bid</p><p className="text-2xl font-black text-white">{res.aiBid}</p></div>
                                    </div>
                                    {res.tied && <p className="text-[10px] text-yellow-500 mt-4 italic font-bold">Won via tie-breaker flip</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};