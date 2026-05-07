import React, { useMemo, useState } from 'react';
import { useNFLUDFA } from './useNFLUDFA';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { Table, TableCell } from '../../../_design/Table';
import { NumberInput } from '../../../_design/Inputs';
import { PrimaryButton, SecondaryButton } from '../../../_design/Buttons';
import { Section } from '../../../_design/Section';
import { Text } from '../../../_design/Typography';
import { PageContainer } from '../../../_design/Container';
import { TabGroup, Tab } from '../../../_design/Tabs';
import { Plus } from '../../../_design/Icons';

export const NFLUDFAView = () => {
    const { nflDraftees, addPlayerToUDFABoard, nflUDFABoard } = useSimFBAStore();
    const { board, pointsRemaining, handlePointChange, saveBids, removePlayer } = useNFLUDFA();
    
    // Tab State
    const [selectedTab, setSelectedTab] = useState("Available UDFAs");

    // Filter the Draft class to ONLY show players who weren't drafted
    const availableUDFAs = useMemo(() => {
        if (!nflDraftees) return [];
        return nflDraftees.filter((player: any) => player.DraftPickID === 0 || player.DraftedTeamID === 0);
    }, [nflDraftees]);

    if (!board) return <PageContainer isLoading={true} children={null} />;

    return (
        <PageContainer title="NFL UDFA Recruitment">
            
            {/* Tabs for Navigation */}
            <div className="flex justify-center mb-4 mt-2">
                <TabGroup>
                    <Tab 
                        label="Available UDFAs" 
                        selected={selectedTab === "Available UDFAs"} 
                        setSelected={setSelectedTab} 
                    />
                    <Tab 
                        label="My Bidding Board" 
                        selected={selectedTab === "My Bidding Board"} 
                        setSelected={setSelectedTab} 
                    />
                </TabGroup>
            </div>

            <div className="flex flex-col gap-y-4 p-4">
                
                {/* VIEW 1: AVAILABLE UDFAs */}
                {selectedTab === "Available UDFAs" && (
                    <Section title={`Available Undrafted Players (${availableUDFAs.length})`}>
                        <Text variant="body-small" className="text-gray-400 mb-4">
                            Browse the list of undrafted players and add them to your board to place a point bid.
                        </Text>
                        <Table
                            columns={[
                                { header: "Name", accessor: "FirstName" },
                                { header: "Pos", accessor: "Position" },
                                { header: "Archetype", accessor: "Archetype" },
                                { header: "Overall", accessor: "OverallGrade" },
                                { header: "Action", accessor: "" }
                            ]}
                            data={availableUDFAs}
                            rowRenderer={(player: any, index: number, bg: string) => {
                                // Check if player is already on the user's board
                                const isOnBoard = nflUDFABoard?.Profiles?.some((p: any) => p.PlayerID === player.ID);

                                return (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={player.ID}>
                                        <TableCell>{player.FirstName} {player.LastName}</TableCell>
                                        <TableCell>{player.Position}</TableCell>
                                        <TableCell>{player.Archetype}</TableCell>
                                        <TableCell>{player.OverallGrade}</TableCell>
                                        <TableCell>
                                            <SecondaryButton 
                                                size="xs" 
                                                onClick={() => addPlayerToUDFABoard(player)}
                                                disabled={isOnBoard}
                                            >
                                                {isOnBoard ? "On Board" : <div className="flex items-center gap-1"><Plus /> Add</div>}
                                            </SecondaryButton>
                                        </TableCell>
                                    </div>
                                );
                            }}
                        />
                    </Section>
                )}

                {/* VIEW 2: BIDDING BOARD */}
                {selectedTab === "My Bidding Board" && (
                    <Section title="My Bidding Board">
                        <div className="flex justify-between items-center mb-6 bg-gray-800 p-4 rounded-lg border border-gray-600">
                            <div>
                                <Text variant="h6" className={pointsRemaining < 5 ? "text-red-500" : "text-green-400"}>
                                    Points Available: {pointsRemaining} / 20
                                </Text>
                                <Text variant="small" className="text-gray-400">
                                    Assign 1-20 points per player. Top bid signs the player.
                                </Text>
                            </div>
                            <PrimaryButton onClick={saveBids}>Save All Bids</PrimaryButton>
                        </div>

                        {board.Profiles?.length === 0 ? (
                            <Text variant="body" className="text-center p-8 text-gray-500">
                                Your board is empty. Go to the 'Available UDFAs' tab to add players.
                            </Text>
                        ) : (
                            <Table
                                columns={[
                                    { header: "Player", accessor: "PlayerName" },
                                    { header: "Pos", accessor: "Position" },
                                    { header: "Bid (1-20)", accessor: "Points" },
                                    { header: "Actions", accessor: "" }
                                ]}
                                data={board.Profiles || []}
                                rowRenderer={(profile: any, index: number, bg: string) => (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={profile.ID}>
                                        <TableCell>{profile.PlayerName}</TableCell>
                                        <TableCell>{profile.Position}</TableCell>
                                        <TableCell>
                                            <NumberInput
                                                value={profile.Points}
                                                min={1} max={20}
                                                onChange={(e: any) => handlePointChange(profile.ID, parseInt(e.target.value))}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <SecondaryButton 
                                                variant="danger" 
                                                size="xs" 
                                                onClick={() => removePlayer(profile.ID)}
                                            >
                                                Remove
                                            </SecondaryButton>
                                        </TableCell>
                                    </div>
                                )}
                            />
                        )}
                    </Section>
                )}
            </div>
        </PageContainer>
    );
};