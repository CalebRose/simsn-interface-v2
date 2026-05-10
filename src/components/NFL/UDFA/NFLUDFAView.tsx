import React, { useMemo, useState } from 'react';
import { useNFLUDFA } from './useNFLUDFA';
import { useSimFBAStore } from '../../../context/SimFBAContext';
import { useAuthStore } from '../../../context/AuthContext'; // Using the hook from AuthContext
import { Table, TableCell } from '../../../_design/Table';
import { Button, ButtonGroup } from '../../../_design/Buttons';
import { Text } from '../../../_design/Typography';
import { Plus } from '../../../_design/Icons';
import { ActionModal } from '../../Common/ActionModal';
import { useModal } from '../../../_hooks/useModal';
import { useTeamColors } from '../../../_hooks/useTeamColors';
import { useBackgroundColor } from '../../../_hooks/useBackgroundColor';
import { usePagination } from '../../../_hooks/usePagination';
import { CategoryDropdown } from '../../Recruiting/Common/RecruitingCategoryDropdown';
import { FreeAgencySidebar } from '../../FreeAgencyPage/Common/FreeAgencySidebar';
import { 
    Overview, 
    Contracts, 
    SimNFL, 
    DrafteeInfoType, 
    FootballPositionOptions, 
    FootballArchetypeOptions 
} from '../../../_constants/constants';

export const NFLUDFAView = () => {
    // 1. Auth & Admin Logic
    const { currentUser } = useAuthStore(); 
    // FIXED: Casting to any to bypass the "Property Role does not exist" TS error
    const isAdmin = (currentUser as any)?.Role === 'Admin' || (currentUser as any)?.role === 'Admin';

    const { nflTeam, nflDraftees, addPlayerToUDFABoard, nflUDFABoard, cfb_Timestamp } = useSimFBAStore();
    const { board, pointsRemaining, handlePointChange, saveBids, removePlayer } = useNFLUDFA();
    const { backgroundColor } = useBackgroundColor();
    const teamColors = useTeamColors(nflTeam?.ColorOne, nflTeam?.ColorTwo);
    
    const [viewCategory, setViewCategory] = useState(Overview);
    const [positions, setPositions] = useState<string[]>([]);
    const [archetypes, setArchetypes] = useState<string[]>([]);
    const pageSize = 50;

    const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
    const [modalPlayer, setModalPlayer] = useState<any>(null);

    // Sorting Weights
    const gradeWeight: Record<string, number> = {
        'A+': 13, 'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
        'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'F': 1, '': 0
    };

    // Filter & RE-ADDED SORT logic
    const filteredUDFAs = useMemo(() => {
        if (!nflDraftees) return [];
        let filtered = nflDraftees.filter((p: any) => p.DraftPickID === 0 || p.DraftedTeamID === 0);
        if (positions.length > 0) filtered = filtered.filter(p => positions.includes(p.Position));
        if (archetypes.length > 0) filtered = filtered.filter(p => archetypes.includes(p.Archetype));
        
        return filtered.sort((a, b) => (gradeWeight[b.OverallGrade] || 0) - (gradeWeight[a.OverallGrade] || 0));
    }, [nflDraftees, positions, archetypes]);

    const { currentPage, totalPages, goToPreviousPage, goToNextPage, setCurrentPage } = usePagination(filteredUDFAs.length, pageSize);

    const pagedUDFAs = useMemo(() => {
        const start = currentPage * pageSize;
        return filteredUDFAs.slice(start, start + pageSize);
    }, [filteredUDFAs, currentPage]);

    const handleOpenPlayerCard = (playerData: any) => {
        let fullPlayer = playerData.PlayerName ? nflDraftees?.find((p: any) => p.ID === playerData.PlayerID) : playerData;
        if (fullPlayer) { setModalPlayer(fullPlayer); handleOpenModal(); }
    };

    if (!nflTeam || !board) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <Text variant="h4" classes="text-white animate-pulse">Loading UDFA Data...</Text>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 flex flex-col bg-gray-900" style={{ backgroundColor }}>
            {modalPlayer && (
                <ActionModal
                    isOpen={isModalOpen} onClose={handleCloseModal}
                    playerID={modalPlayer.ID}
                    playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
                    league={SimNFL} teamID={0} modalAction={DrafteeInfoType} player={modalPlayer}
                />
            )}

            <div className="w-full mb-6 px-2 border-l-8" style={{ borderColor: teamColors.One }}>
                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">NFL UDFA Recruitment</h1>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-[2fr_10fr] gap-4 w-full">
                <div className="w-full">
                    <FreeAgencySidebar 
                        Capsheet={{} as any} AdjCapsheet={{} as any} Team={nflTeam}
                        teamColors={teamColors} league={SimNFL} ts={cfb_Timestamp as any}
                    />
                </div>

                <div className="flex flex-col w-full gap-y-4">
                    {/* WIDENED Navigation Container */}
                    <div className="w-full p-4 flex flex-row items-center justify-between border-2 rounded-xl" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        <ButtonGroup>
                            <Button variant={viewCategory === Overview ? "success" : "secondary"} onClick={() => setViewCategory(Overview)}>Overview</Button>
                            <Button variant={viewCategory === Contracts ? "success" : "secondary"} onClick={() => setViewCategory(Contracts)}>My Bids</Button>
                        </ButtonGroup>
                        
                        <div className="flex gap-x-2">
                            <Button variant="primary" onClick={saveBids}>Save All Bids</Button>
                            {isAdmin && (
                                <Button variant="warning" onClick={() => window.confirm("Run simulation?")}>
                                    RUN LIVE SIMULATION
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* WIDENED Filters Container */}
                    {viewCategory === Overview && (
                        <div className="w-full p-4 flex flex-row flex-wrap gap-x-12 border-2 rounded-xl items-end" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                            <CategoryDropdown
                                label="Positions" options={FootballPositionOptions} isMulti={true}
                                change={(opts: any) => { setPositions(opts ? opts.map((o: any) => o.value) : []); setCurrentPage(0); }}
                            />
                            <CategoryDropdown
                                label="Archetype" options={FootballArchetypeOptions} isMulti={true}
                                change={(opts: any) => { setArchetypes(opts ? opts.map((o: any) => o.value) : []); setCurrentPage(0); }}
                            />
                        </div>
                    )}

                    {/* WIDENED Table Container */}
                    <div className="w-full p-4 border-2 rounded-xl shadow-2xl overflow-hidden" style={{ borderColor: teamColors.One, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                        {viewCategory === Overview ? (
                            <>
                                <Table
                                    team={nflTeam}
                                    columns={[{ header: "ID", accessor: "ID" }, { header: "Name", accessor: "FirstName" }, { header: "Pos", accessor: "Position" }, { header: "Archetype", accessor: "Archetype" }, { header: "Ovr", accessor: "OverallGrade" }, { header: "Action", accessor: "" }]}
                                    data={pagedUDFAs}
                                    rowRenderer={(player: any, index: number, bg: string) => {
                                        const isOnBoard = nflUDFABoard?.Profiles?.some((p: any) => p.PlayerID === player.ID);
                                        return (
                                            <div className="table-row border-b border-gray-700 last:border-0" style={{ backgroundColor: bg }} key={player.ID}>
                                                <TableCell classes="text-gray-500 text-xs">{player.ID}</TableCell>
                                                <TableCell><span className="text-blue-400 hover:underline cursor-pointer font-bold" onClick={() => handleOpenPlayerCard(player)}>{player.FirstName} {player.LastName}</span></TableCell>
                                                <TableCell>{player.Position}</TableCell>
                                                <TableCell>{player.Archetype}</TableCell>
                                                <TableCell classes="font-mono font-bold text-lg">{player.OverallGrade}</TableCell>
                                                <TableCell>
                                                    <button 
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addPlayerToUDFABoard(player); }}
                                                        disabled={isOnBoard} className="p-2 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                                                        style={{ backgroundColor: isOnBoard ? '#4B5563' : teamColors.One }}
                                                    >
                                                        {isOnBoard ? <Text classes="text-xs px-1 text-white">On Board</Text> : <Plus />}
                                                    </button>
                                                </TableCell>
                                            </div>
                                        );
                                    }}
                                />
                                <div className="flex justify-center mt-6">
                                    <ButtonGroup>
                                        <Button onClick={goToPreviousPage} disabled={currentPage === 0}>Prev</Button>
                                        <div className="flex items-center px-6 bg-gray-700 text-white font-bold">{currentPage + 1}</div>
                                        <Button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>Next</Button>
                                    </ButtonGroup>
                                </div>
                            </>
                        ) : (
                            <Table
                                team={nflTeam}
                                columns={[{ header: "Player", accessor: "PlayerName" }, { header: "Pos", accessor: "Position" }, { header: "Bid (1-20)", accessor: "Points" }, { header: "Actions", accessor: "" }]}
                                data={board.Profiles || []}
                                rowRenderer={(profile: any, index: number, bg: string) => (
                                    <div className="table-row border-b border-gray-700 last:border-0" style={{ backgroundColor: bg }} key={profile.ID}>
                                        <TableCell><span className="text-blue-400 hover:underline cursor-pointer font-bold text-lg" onClick={() => handleOpenPlayerCard(profile)}>{profile.PlayerName}</span></TableCell>
                                        <TableCell>{profile.Position}</TableCell>
                                        <TableCell>
                                            <input
                                                type="number" value={profile.Points} min={1} max={20}
                                                onChange={(e: any) => handlePointChange(profile.ID, parseInt(e.target.value) || 0)}
                                                className="w-24 bg-gray-900 text-white border border-gray-600 rounded p-1 text-center font-bold text-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                                            />
                                        </TableCell>
                                        <TableCell><Button variant="danger" size="sm" onClick={() => removePlayer(profile.ID)}>Remove</Button></TableCell>
                                    </div>
                                )}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};