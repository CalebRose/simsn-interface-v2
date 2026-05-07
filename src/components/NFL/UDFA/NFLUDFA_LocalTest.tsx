import React, { useMemo, useState } from 'react';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { Table, TableCell } from '../../../_design/Table';
import { Button } from '../../../_design/Buttons';
import { Border } from '../../../_design/Borders';
import { Text } from '../../../_design/Typography';
import { PageContainer } from '../../../_design/Container';
import { TabGroup, Tab } from '../../../_design/Tabs';
import { Plus } from '../../../_design/Icons';

// --- FAKE PLAYERS FOR TESTING ---
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
    
    // --- LOCAL TEST STATE ---
    const [selectedTab, setSelectedTab] = useState("Available UDFAs");
    const [localBoard, setLocalBoard] = useState<any[]>([]);
    const [simulationResults, setSimulationResults] = useState<any[] | null>(null);

    // Calculate Points
    const pointsSpent = localBoard.reduce((sum, p) => sum + p.Points, 0);
    const pointsRemaining = 20 - pointsSpent;

    // Filter the Draft class, or inject Mock Players if empty!
    const availableUDFAs = useMemo(() => {
        if (nflDraftees && nflDraftees.length > 0) {
            const undrafted = nflDraftees.filter((player: any) => player.DraftPickID === 0 || player.DraftedTeamID === 0);
            if (undrafted.length > 0) return undrafted;
        }
        // If we get here, the real DB is empty, so use the fake guys:
        return MOCK_PLAYERS;
    }, [nflDraftees]);

    // --- LOCAL TEST FUNCTIONS ---
    const addPlayer = (player: any) => {
        setLocalBoard([...localBoard, { 
            PlayerID: player.ID, 
            PlayerName: `${player.FirstName} ${player.LastName}`, 
            Position: player.Position, 
            Points: 0 
        }]);
    };

    const removePlayer = (playerID: number) => {
        setLocalBoard(localBoard.filter(p => p.PlayerID !== playerID));
    };

    const handlePointChange = (playerID: number, val: number) => {
        if (isNaN(val)) val = 0;
        
        const updatedBoard = localBoard.map(p => {
            if (p.PlayerID === playerID) return { ...p, Points: val };
            return p;
        });
        
        const total = updatedBoard.reduce((sum, p) => sum + p.Points, 0);
        if (total > 20) {
            alert("You cannot spend more than 20 points!");
            return;
        }
        setLocalBoard(updatedBoard);
    };

    // --- THE MAGIC: MOCK SIMULATOR ---
    const runSimulation = () => {
        if (localBoard.length === 0) {
            alert("Add some players and bids first!");
            return;
        }

        const results = localBoard.map(bid => {
            // Generate a fake competing bid between 0 and 20
            const aiBid = Math.floor(Math.random() * 21);
            
            let won = false;
            let tied = false;

            if (bid.Points > aiBid) {
                won = true;
            } else if (bid.Points === aiBid) {
                tied = true;
                // 50/50 coin flip for ties
                won = Math.random() > 0.5;
            }

            return { ...bid, aiBid, won, tied };
        });

        setSimulationResults(results);
        setSelectedTab("Results");
    };

    const resetTest = () => {
        setLocalBoard([]);
        setSimulationResults(null);
        setSelectedTab("Available UDFAs");
    };

    if (!nflTeam) return <PageContainer isLoading={true} children={null} />;

    const isUsingMockData = availableUDFAs === MOCK_PLAYERS;

    return (
        <PageContainer title="LOCAL TEST: NFL UDFA">
            
            <div className="flex justify-center mb-4 mt-2">
                <TabGroup>
                    <Tab label="Available UDFAs" selected={selectedTab === "Available UDFAs"} setSelected={setSelectedTab} />
                    <Tab label="My Bidding Board" selected={selectedTab === "My Bidding Board"} setSelected={setSelectedTab} />
                    {simulationResults && (
                        <Tab label="Results" selected={selectedTab === "Results"} setSelected={setSelectedTab} />
                    )}
                </TabGroup>
            </div>

            <div className="flex flex-col gap-y-4 p-4 w-full max-w-7xl mx-auto">
                
                {/* VIEW 1: AVAILABLE UDFAs */}
                {selectedTab === "Available UDFAs" && (
                    <Border classes="p-4 w-full border-dashed border-yellow-500">
                        <Text variant="h5" classes="mb-2 text-yellow-500">LOCAL TEST MODE - No Data will be saved</Text>
                        {isUsingMockData && (
                            <Text variant="small" classes="text-gray-400 mb-4 block italic">
                                * Your real UDFA list was empty, so we spawned some fake players for you to test with!
                            </Text>
                        )}
                        
                        <Table
                            team={nflTeam}
                            columns={[
                                { header: "Name", accessor: "PlayerName" },
                                { header: "Pos", accessor: "Position" },
                                { header: "Archetype", accessor: "Archetype" },
                                { header: "Overall", accessor: "OverallGrade" },
                                { header: "Action", accessor: "" }
                            ]}
                            data={availableUDFAs}
                            rowRenderer={(player: any, index: number, bg: string) => {
                                const isOnBoard = localBoard.some(p => p.PlayerID === player.ID);

                                return (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={player.ID}>
                                        <TableCell>{player.FirstName} {player.LastName}</TableCell>
                                        <TableCell>{player.Position}</TableCell>
                                        <TableCell>{player.Archetype}</TableCell>
                                        <TableCell>{player.OverallGrade}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="secondary" size="sm" 
                                                onClick={() => addPlayer(player)} disabled={isOnBoard}
                                            >
                                                {isOnBoard ? "On Board" : <div className="flex items-center gap-1"><Plus /> Add</div>}
                                            </Button>
                                        </TableCell>
                                    </div>
                                );
                            }}
                        />
                    </Border>
                )}

                {/* VIEW 2: BIDDING BOARD */}
                {selectedTab === "My Bidding Board" && (
                    <Border classes="p-4 w-full border-dashed border-yellow-500">
                        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-black bg-opacity-20">
                            <div>
                                <Text variant="h5" classes={pointsRemaining < 5 ? "text-red-500" : "text-green-400"}>
                                    Points Available: {pointsRemaining} / 20
                                </Text>
                            </div>
                            <Button variant="success" onClick={runSimulation}>RUN MOCK SIMULATION</Button>
                        </div>

                        {localBoard.length === 0 ? (
                            <Text variant="body" classes="text-center p-8 text-gray-500">
                                Your board is empty. Go add some dummy players!
                            </Text>
                        ) : (
                            <Table
                                team={nflTeam}
                                columns={[
                                    { header: "Player", accessor: "PlayerName" },
                                    { header: "Pos", accessor: "Position" },
                                    { header: "Bid (1-20)", accessor: "Points" },
                                    { header: "Actions", accessor: "" }
                                ]}
                                data={localBoard}
                                rowRenderer={(profile: any, index: number, bg: string) => (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={profile.PlayerID}>
                                        <TableCell>{profile.PlayerName}</TableCell>
                                        <TableCell>{profile.Position}</TableCell>
                                        <TableCell>
                                            <input
                                                type="number" 
                                                value={profile.Points} 
                                                min={1} 
                                                max={20}
                                                onChange={(e: any) => handlePointChange(profile.PlayerID || profile.ID, parseInt(e.target.value) || 0)}
                                                className="w-24 min-w-[5rem] px-2 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-center"
                                                />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="danger" size="sm" onClick={() => removePlayer(profile.PlayerID)}>Remove</Button>
                                        </TableCell>
                                    </div>
                                )}
                            />
                        )}
                    </Border>
                )}

                {/* VIEW 3: SIMULATION RESULTS */}
                {selectedTab === "Results" && simulationResults && (
                    <Border classes="p-4 w-full border-dashed border-green-500">
                        <div className="flex justify-between items-center mb-6">
                            <Text variant="h4">Simulation Results</Text>
                            <Button onClick={resetTest}>Reset & Try Again</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {simulationResults.map((res: any) => (
                                <div key={res.PlayerID} className={`p-4 rounded-lg border-2 ${res.won ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-red-500 bg-red-900 bg-opacity-20'}`}>
                                    <Text variant="h5" classes="mb-2">{res.PlayerName} ({res.Position})</Text>
                                    <Text variant="body" classes="mb-1">Your Bid: <strong>{res.Points}</strong></Text>
                                    <Text variant="body" classes="mb-3 text-gray-400">Highest Competing AI Bid: <strong>{res.aiBid}</strong></Text>
                                    
                                    {res.tied && <Text variant="small" classes="text-yellow-500 block mb-2">TIE BREAKER INITIATED...</Text>}
                                    
                                    {res.won ? (
                                        <Text variant="h6" classes="text-green-400 font-bold">🎉 PLAYER SIGNED!</Text>
                                    ) : (
                                        <Text variant="h6" classes="text-red-400 font-bold">❌ OUTBID</Text>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Border>
                )}
            </div>
        </PageContainer>
    );
};