import React, { useMemo, useState } from 'react';
import { useNFLUDFA } from './useNFLUDFA';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { Table, TableCell } from '../../../_design/Table';
import { Button } from '../../../_design/Buttons';
import { Border } from '../../../_design/Borders';
import { Text } from '../../../_design/Typography';
import { PageContainer } from '../../../_design/Container';
import { TabGroup, Tab } from '../../../_design/Tabs';
import { Plus } from '../../../_design/Icons';
import { ActionModal } from '../../Common/ActionModal';
import { useModal } from '../../../_hooks/useModal';
import { DrafteeInfoType, SimNFL } from '../../../_constants/constants';

export const NFLUDFAView = () => {
    const { nflTeam, nflDraftees, addPlayerToUDFABoard, nflUDFABoard } = useSimFBAStore();
    const { board, pointsRemaining, handlePointChange, saveBids, removePlayer } = useNFLUDFA();
    
    // Tab State
    const [selectedTab, setSelectedTab] = useState("Available UDFAs");

    // Modal State
    const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
    const [modalPlayer, setModalPlayer] = useState<any>(null);

    // Filter the Draft class to ONLY show players who weren't drafted
    const availableUDFAs = useMemo(() => {
        if (!nflDraftees) return [];
        return nflDraftees.filter((player: any) => player.DraftPickID === 0 || player.DraftedTeamID === 0);
    }, [nflDraftees]);

    // ---------------------------------------------------------
    // Helper function to open the Player Card Modal
    // ---------------------------------------------------------
    const handleOpenPlayerCard = (playerData: any) => {
        let fullPlayer = playerData;
        
        // If they clicked from the Bidding Board, we only have the profile.
        // We need to find the full draftee object in the nflDraftees array.
        if (playerData.PlayerName) { 
            fullPlayer = nflDraftees?.find((p: any) => p.ID === playerData.PlayerID);
        }

        if (fullPlayer) {
            setModalPlayer(fullPlayer);
            handleOpenModal();
        }
    };

    if (!board || !nflTeam) return <PageContainer isLoading={true} children={null} />;

    return (
        <PageContainer title="NFL UDFA Recruitment">
            
            {/* The actual Player Card Modal */}
            {modalPlayer && (
                <ActionModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    playerID={modalPlayer.ID}
                    playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
                    league={SimNFL}
                    teamID={0} // UDFAs don't have a team yet
                    modalAction={DrafteeInfoType}
                    player={modalPlayer}
                />
            )}

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

            <div className="flex flex-col gap-y-4 p-4 w-full max-w-7xl mx-auto">
                
                {/* VIEW 1: AVAILABLE UDFAs */}
                {selectedTab === "Available UDFAs" && (
                    <Border classes="p-4 w-full">
                        <Text variant="h5" classes="mb-2">Available Undrafted Players ({availableUDFAs.length})</Text>
                        <Text variant="small" classes="text-gray-400 mb-6 block">
                            Browse the list of undrafted players and add them to your board to place a point bid.
                        </Text>
                        
                        <Table
                            team={nflTeam}
                            columns={[
                                { header: "Name", accessor: "FirstName" },
                                { header: "Pos", accessor: "Position" },
                                { header: "Archetype", accessor: "Archetype" },
                                { header: "Overall", accessor: "OverallGrade" },
                                { header: "Action", accessor: "" }
                            ]}
                            data={availableUDFAs}
                            rowRenderer={(player: any, index: number, bg: string) => {
                                const isOnBoard = nflUDFABoard?.Profiles?.some((p: any) => p.PlayerID === player.ID);

                                return (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={player.ID}>
                                        <TableCell>
                                            <span 
                                                className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold transition-colors"
                                                onClick={() => handleOpenPlayerCard(player)}
                                            >
                                                {player.FirstName} {player.LastName}
                                            </span>
                                        </TableCell>
                                        <TableCell>{player.Position}</TableCell>
                                        <TableCell>{player.Archetype}</TableCell>
                                        <TableCell>{player.OverallGrade}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="secondary"
                                                size="sm" 
                                                onClick={() => addPlayerToUDFABoard(player)}
                                                disabled={isOnBoard}
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
                    <Border classes="p-4 w-full">
                        <div className="flex justify-between items-center mb-6 p-4 rounded-lg bg-black bg-opacity-20">
                            <div>
                                <Text variant="h5" classes={pointsRemaining < 5 ? "text-red-500" : "text-green-400"}>
                                    Points Available: {pointsRemaining} / 20
                                </Text>
                                <Text variant="small" classes="text-gray-400">
                                    Assign 1-20 points per player. Top bid signs the player.
                                </Text>
                            </div>
                            <Button onClick={saveBids}>Save All Bids</Button>
                        </div>

                        {board.Profiles?.length === 0 ? (
                            <Text variant="body" classes="text-center p-8 text-gray-500">
                                Your board is empty. Go to the 'Available UDFAs' tab to add players.
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
                                data={board.Profiles || []}
                                rowRenderer={(profile: any, index: number, bg: string) => (
                                    <div className="table-row" style={{ backgroundColor: bg }} key={profile.ID}>
                                        <TableCell>
                                            <span 
                                                className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold transition-colors"
                                                onClick={() => handleOpenPlayerCard(profile)}
                                            >
                                                {profile.PlayerName}
                                            </span>
                                        </TableCell>
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
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => removePlayer(profile.ID)}
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </div>
                                )}
                            />
                        )}
                    </Border>
                )}
            </div>
        </PageContainer>
    );
};