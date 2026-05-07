import React, { useMemo, useState } from 'react';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { Table, TableCell } from '../../../_design/Table';
import { Button, ButtonGroup } from '../../../_design/Buttons';
import { Text } from '../../../_design/Typography';
import { Plus } from '../../../_design/Icons';
import { useTeamColors } from '../../../_hooks/useTeamColors';
import { useBackgroundColor } from '../../../_hooks/useBackgroundColor';
import { CategoryDropdown } from '../../Recruiting/Common/RecruitingCategoryDropdown';
import { FootballPositionOptions, FootballArchetypeOptions, Overview, Contracts } from '../../../_constants/constants';

const MOCK_PLAYERS = [
    { ID: 9901, FirstName: "Speedy", LastName: "McCatch", Position: "WR", Archetype: "Deep Threat", OverallGrade: "B" },
    { ID: 9902, FirstName: "Tank", LastName: "Smash", Position: "RB", Archetype: "Power", OverallGrade: "C+" },
    { ID: 9903, FirstName: "Cannon", LastName: "Arm", Position: "QB", Archetype: "Gunslinger", OverallGrade: "C" },
    { ID: 9904, FirstName: "Brick", LastName: "Wall", Position: "OT", Archetype: "Pass Blocker", OverallGrade: "B-" },
    { ID: 9905, FirstName: "Hit", LastName: "Stick", Position: "MLB", Archetype: "Run Stopper", OverallGrade: "C+" },
    { ID: 9906, FirstName: "Sticky", LastName: "Hands", Position: "CB", Archetype: "Man Coverage", OverallGrade: "B" },
];

export const NFLUDFA_LocalTest = () => {
    const gradeWeight: Record<string, number> = {
        'A+': 13, 'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
        'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'F': 1, '': 0
    };

    const { nflTeam, nflDraftees } = useSimFBAStore();
    const { backgroundColor } = useBackgroundColor();
    const teamColors = useTeamColors(nflTeam?.ColorOne, nflTeam?.ColorTwo);
    
    const [selectedTab, setSelectedTab] = useState(Overview);
    const [localBoard, setLocalBoard] = useState<any[]>([]);
    const [simulationResults, setSimulationResults] = useState<any[] | null>(null);
    const [positions, setPositions] = useState<string[]>([]);
    const [archetypes, setArchetypes] = useState<string[]>([]);

    const pointsRemaining = 20 - localBoard.reduce((sum, p) => sum + p.Points, 0);

    const availableUDFAs = useMemo(() => {
        let players = (nflDraftees && nflDraftees.length > 0) 
            ? nflDraftees.filter((p: any) => p.DraftPickID === 0 || p.DraftedTeamID === 0)
            : MOCK_PLAYERS;
        
        if (players.length === 0) players = MOCK_PLAYERS;
        if (positions.length > 0) players = players.filter(p => positions.includes(p.Position));
        if (archetypes.length > 0) players = players.filter(p => archetypes.includes(p.Archetype));

        // Re-added SORT functionality
        return players.sort((a, b) => (gradeWeight[b.OverallGrade] || 0) - (gradeWeight[a.OverallGrade] || 0));
    }, [nflDraftees, positions, archetypes]);

    const handleAdd = (e: React.MouseEvent, player: any) => {
        e.stopPropagation(); e.preventDefault();
        setLocalBoard(prev => [...prev, { 
            PlayerID: player.ID, 
            PlayerName: `${player.FirstName} ${player.LastName}`, 
            Position: player.Position, Points: 0 
        }]);
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

    if (!nflTeam) return null;

    return (
        <div className="w-full min-h-screen p-4 flex flex-col gap-y-4" style={{ backgroundColor }}>
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter border-l-8 pl-4" style={{ borderColor: teamColors.One }}>LOCAL TEST: NFL UDFA</h1>

            <div className="flex flex-col w-full gap-y-6">
                <div className="flex flex-row items-center justify-between border-2 rounded-xl p-4 w-full shadow-2xl" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <ButtonGroup>
                        <Button variant={selectedTab === Overview ? "success" : "secondary"} onClick={() => setSelectedTab(Overview)}>Overview</Button>
                        <Button variant={selectedTab === Contracts ? "success" : "secondary"} onClick={() => setSelectedTab(Contracts)}>My Bids</Button>
                        {simulationResults && <Button variant={selectedTab === "Results" ? "success" : "secondary"} onClick={() => setSelectedTab("Results")}>Results</Button>}
                    </ButtonGroup>
                    <Text variant="h5" classes="text-yellow-500 font-bold uppercase italic tracking-widest">Sandbox Mode</Text>
                </div>

                {selectedTab === Overview && (
                    <>
                        <div className="flex flex-row flex-wrap gap-x-12 border-2 rounded-xl p-4 w-full" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                            <CategoryDropdown
                                label="Positions" options={FootballPositionOptions} isMulti={true}
                                change={(opts: any) => setPositions(opts ? opts.map((o: any) => o.value) : [])}
                            />
                            <CategoryDropdown
                                label="Archetype" options={FootballArchetypeOptions} isMulti={true}
                                change={(opts: any) => setArchetypes(opts ? opts.map((o: any) => o.value) : [])}
                            />
                        </div>
                        <div className="flex flex-col border-2 rounded-xl p-4 w-full shadow-inner overflow-hidden" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                            <Table
                                team={nflTeam}
                                columns={[{ header: "ID", accessor: "ID" }, { header: "Player", accessor: "FirstName" }, { header: "Pos", accessor: "Position" }, { header: "Overall", accessor: "OverallGrade" }, { header: "Add", accessor: "" }]}
                                data={availableUDFAs}
                                rowRenderer={(player: any, index: number, bg: string) => {
                                    const isOnBoard = localBoard.some(p => p.PlayerID === player.ID);
                                    return (
                                        <div className="table-row border-b border-gray-700" style={{ backgroundColor: bg }} key={player.ID}>
                                            <TableCell classes="text-xs text-gray-500">{player.ID}</TableCell>
                                            <TableCell classes="font-bold">{player.FirstName} {player.LastName}</TableCell>
                                            <TableCell>{player.Position}</TableCell>
                                            <TableCell classes="font-mono">{player.OverallGrade}</TableCell>
                                            <TableCell>
                                                <button 
                                                    onClick={(e) => handleAdd(e, player)}
                                                    disabled={isOnBoard}
                                                    className={`p-1 rounded flex items-center justify-center transition-all ${isOnBoard ? 'bg-gray-600 opacity-50' : 'bg-green-600 hover:scale-110 shadow-lg'}`}
                                                >
                                                    {isOnBoard ? <Text classes="text-xs px-1">Added</Text> : <Plus />}
                                                </button>
                                            </TableCell>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </>
                )}

                {selectedTab === Contracts && (
                    <div className="flex flex-col border-2 rounded-xl p-4 w-full shadow-2xl" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-black bg-opacity-30 border border-gray-700">
                            <Text variant="h5" classes="text-green-400 font-bold">Points Remaining: {pointsRemaining} / 20</Text>
                            <Button variant="success" onClick={runSimulation}>Run Simulation</Button>
                        </div>
                        <Table
                            team={nflTeam}
                            columns={[{ header: "Player", accessor: "PlayerName" }, { header: "Pos", accessor: "Position" }, { header: "Bid", accessor: "Points" }, { header: "Remove", accessor: "" }]}
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
                                            className="w-24 bg-gray-900 text-white border border-gray-600 rounded p-1 text-center font-bold"
                                        />
                                    </TableCell>
                                    <TableCell><Button variant="danger" size="sm" onClick={() => setLocalBoard(prev => prev.filter(p => p.PlayerID !== profile.PlayerID))}>Remove</Button></TableCell>
                                </div>
                            )}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};