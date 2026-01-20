// import { useState, useEffect, FC } from "react";
// import {
//   NFLDraftPick,
//   NFLDraftee,
//   NFLTeam,
//   ScoutingProfile,
//   NFLWarRoom
// } from "../../../models/footballModels";
// import { Button, ButtonGroup } from "../../../_design/Buttons";
// import { League } from "../../../_constants/constants";
// import { Text } from "../../../_design/Typography";
// import { useTeamColors } from "../../../_hooks/useTeamColors";
// import { useSimFBAStore } from "../../../context/SimFBAContext";
// import { DraftService } from "../../../_services/draftService";
// import { DraftClock } from '../common/DraftClock';
// import { DraftTicker } from '../common/DraftTicker';
// import { UpcomingPicks } from '../common/UpcomingPicks';
// import { DraftBoard } from '../common/DraftBoard';
// import { ScoutingBoard } from '../common/ScoutingBoard';
// import { 
//   getCurrentPickFromState, 
//   getUpcomingPicks, 
//   getRecentPicks,
//   getDraftedPlayerIds,
//   getTimeForPick
// } from './utils/draftHelpers';

// interface NFLDraftPageProps {
//   league: League;
//   team: NFLTeam;
// }

// export const NFLDraftPage: FC<NFLDraftPageProps> = ({ team }) => {

//   const fbStore = useSimFBAStore();
//   const {
//     nflDraftees
//   } = fbStore;

//   const [draftState, setDraftState] = useState({
//     currentPick: 1,
//     currentRound: 1,
//     isPaused: true,
//     timeLeft: 300,
//     allDraftPicks: [] as NFLDraftPick[],
//     exportComplete: false
//   });

//   const [draftees] = useState<NFLDraftee[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'board' | 'warroom' | 'scout'>('board');
//   const [scoutedPlayerIds, setScoutedPlayerIds] = useState<Set<number>>(new Set());
//   const [warRoom, setWarRoom] = useState<NFLWarRoom | null>(null);
//   const [scoutProfiles, setScoutProfiles] = useState<ScoutingProfile[]>([]);
//   const [selectedScoutProfile, setSelectedScoutProfile] = useState<ScoutingProfile | null>(null);
//   const [isScoutingModalOpen, setIsScoutingModalOpen] = useState(false);
//   const [nflTeams, setNflTeams] = useState<NFLTeam[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const rawTeamColors = useTeamColors(team?.ColorOne, team?.ColorTwo);
//   const teamColors = {
//     primary: rawTeamColors.One,
//     secondary: rawTeamColors.Two
//   };
//   const backgroundColor = "#1f2937";

//   useEffect(() => {
//     const loadDraftData = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const response = await DraftService.GetDraftPageData(team.ID);
//         console.log(response)
//         if (!response) {
//           throw new Error('No data received from API');
//         }
        
//         const allPicks: NFLDraftPick[] = [];
//         if (response.AllDraftPicks && Array.isArray(response.AllDraftPicks)) {
//           response.AllDraftPicks.forEach((roundPicks: any[]) => {
//             roundPicks.forEach((pickData: any) => {
//               const draftPick = new NFLDraftPick();
//               Object.assign(draftPick, pickData);
//               allPicks.push(draftPick);
//             });
//           });
//         }
        
//         let warRoomData = null;
//         if (response.WarRoom) {
//           warRoomData = new NFLWarRoom({
//             ID: response.WarRoom.ID,
//             TeamID: response.WarRoom.TeamID,
//             Team: response.WarRoom.Team,
//             ScoutingPoints: response.WarRoom.ScoutingPoints || 0,
//             SpentPoints: response.WarRoom.SpentPoints || 0,
//             DraftPicks: response.WarRoom.DraftPicks || [],
//             ScoutProfiles: response.WarRoom.ScoutProfiles || []
//           });
//         }

//         const profiles: ScoutingProfile[] = [];
//         const scoutedIds = new Set<number>();
//         if (warRoomData?.ScoutProfiles) {
//           warRoomData.ScoutProfiles.forEach((profileData: any) => {
//             const profile = new ScoutingProfile(profileData);
//             profiles.push(profile);
//             if (profile.PlayerID) {
//               scoutedIds.add(profile.PlayerID);
//             }
//           });
//         }
        
//         const teams: NFLTeam[] = [];
//         if (response.NFLTeams && Array.isArray(response.NFLTeams)) {
//           response.NFLTeams.forEach((teamData: any) => {
//             const nflTeam = new NFLTeam();
//             Object.assign(nflTeam, teamData);
//             teams.push(nflTeam);
//           });
//         }
        
//         const currentPick = allPicks.find(pick => pick.SelectedPlayerID === 0);
//         setDraftState(prev => ({
//           ...prev,
//           allDraftPicks: allPicks, // Store flat array of all picks
//           currentPick: currentPick?.DraftNumber || 1,
//           currentRound: currentPick?.DraftRound || 1,
//           timeLeft: getTimeForPick(currentPick?.DraftNumber || 1)
//         }));
//         setWarRoom(warRoomData);
//         setScoutProfiles(profiles);
//         setScoutedPlayerIds(scoutedIds);
//         setNflTeams(teams);
        
//       } catch (error) {
//         console.error('Failed to load draft data:', error);
//         setError(error instanceof Error ? error.message : 'Failed to load draft data');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadDraftData();
//   }, [team]);

//   useEffect(() => {
//     if (!isLoading) {
//       const refreshData = async () => {
//         try {
//           const response = await DraftService.GetDraftPageData(team.ID);
//           if (response?.AllDraftPicks) {
//             const allPicks: NFLDraftPick[] = [];
//             response.AllDraftPicks.forEach((roundPicks: any[]) => {
//               roundPicks.forEach((pickData: any) => {
//                 const draftPick = new NFLDraftPick();
//                 Object.assign(draftPick, pickData);
//                 allPicks.push(draftPick);
//               });
//             });
            
//             const currentPick = allPicks.find(pick => pick.SelectedPlayerID === 0);
            
//             setDraftState(prev => ({
//               ...prev,
//               allDraftPicks: allPicks,
//               currentPick: currentPick?.DraftNumber || prev.currentPick,
//               currentRound: currentPick?.DraftRound || prev.currentRound,
//               timeLeft: getTimeForPick(currentPick?.DraftNumber || prev.currentPick)
//             }));
//           }
//         } catch (error) {
//           console.error('Failed to refresh draft data:', error);
//         }
//       };
      
//       refreshData();
//     }
//   }, [activeTab, team.ID, isLoading]);

//   useEffect(() => {
//     if (draftState.isPaused || draftState.timeLeft <= 0) return;

//     const interval = setInterval(() => {
//       setDraftState(prev => ({
//         ...prev,
//         timeLeft: Math.max(0, prev.timeLeft - 1)
//       }));
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [draftState.isPaused, draftState.timeLeft]);

//   const currentPick = draftState.allDraftPicks.find(pick => pick.DraftNumber === draftState.currentPick) || null;
//   const upcomingPicks = draftState.allDraftPicks
//     .filter(pick => pick.DraftNumber >= draftState.currentPick)
//     .slice(0, 15);

//   const recentPicks = draftState.allDraftPicks
//     .filter(pick => pick.DraftNumber < draftState.currentPick && pick.SelectedPlayerID > 0)
//     .sort((a, b) => b.DraftNumber - a.DraftNumber)
//     .slice(0, 20);

//   const draftedPlayerIds = new Set(
//     draftState.allDraftPicks
//       .filter(pick => pick.SelectedPlayerID > 0)
//       .map(pick => pick.SelectedPlayerID)
//   );

//   const handleAddToScoutBoard = async (player: NFLDraftee) => {
//     const dto = { PlayerID: player.ID, TeamID: team.ID };
    
//     try {
//       const response = await DraftService.CreateNFLScoutingProfile(dto);
      
//       if (response) {
//         const newProfile = new ScoutingProfile({
//           ...response,
//           Draftee: player
//         });
        
//         setScoutProfiles(prev => [...prev, newProfile]);
//         setScoutedPlayerIds(prev => new Set(prev).add(player.ID));
//       }
//     } catch (error) {
//       console.error('Failed to add player to scouting board:', error);
//       alert(`Failed to add ${player.FirstName} ${player.LastName} to scouting board`);
//     }
//   };
  
//   const handleRemoveFromScoutBoard = async (profile: ScoutingProfile) => {
//     try {
//       await DraftService.RemoveNFLPlayerFromBoard(profile.ID);
//       setScoutProfiles(prev => prev.filter(p => p.ID !== profile.ID));
//       setScoutedPlayerIds(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(profile.PlayerID);
//         return newSet;
//       });
//     } catch (error) {
//       console.error('Failed to remove player from scouting board:', error);
//       alert(`Failed to remove ${profile.Draftee?.FirstName} ${profile.Draftee?.LastName} from scouting board`);
//     }
//   };

//   const handleRevealAttribute = async (attribute: string, points: number) => {
//     if (!selectedScoutProfile || !warRoom) return;
    
//     const dto = {
//       ScoutProfileID: selectedScoutProfile.ID,
//       Attribute: attribute,
//       Points: points,
//       TeamID: team.ID
//     };
    
//     try {
//       const response = await DraftService.RevealNFLAttribute(dto);
      
//       if (response) {
//         const updatedProfile = new ScoutingProfile({
//           ...selectedScoutProfile,
//           [attribute]: true,
//           ShowCount: selectedScoutProfile.ShowCount + 1
//         });
//         const updatedWarRoom = new NFLWarRoom({
//           ...warRoom,
//           SpentPoints: warRoom.SpentPoints + points
//         });
        
//         setScoutProfiles(prev => prev.map(p => 
//           p.ID === selectedScoutProfile.ID ? updatedProfile : p
//         ));
//         setSelectedScoutProfile(updatedProfile);
//         setWarRoom(updatedWarRoom);
//       }
//     } catch (error) {
//       console.error('Failed to reveal attribute:', error);
//       alert(`Failed to reveal ${attribute} for ${selectedScoutProfile.Draftee?.FirstName} ${selectedScoutProfile.Draftee?.LastName}`);
//     }
//   };

//   const handleRevealAttributeFromBoard = async (profileId: number, attribute: string, points: number) => {
//     if (!warRoom) return;
    
//     const dto = {
//       ScoutProfileID: profileId,
//       Attribute: attribute,
//       Points: points,
//       TeamID: team.ID
//     };
    
//     try {
//       const response = await DraftService.RevealNFLAttribute(dto);
      
//       if (response) {
//         const updatedWarRoom = new NFLWarRoom({
//           ...warRoom,
//           SpentPoints: warRoom.SpentPoints + points
//         });
        
//         setScoutProfiles(prev => prev.map(p => {
//           if (p.ID === profileId) {
//             return new ScoutingProfile({
//               ...p,
//               [attribute]: true,
//               ShowCount: p.ShowCount + 1
//             });
//           }
//           return p;
//         }));
//         setWarRoom(updatedWarRoom);
//       }
//     } catch (error) {
//       console.error('Failed to reveal attribute:', error);
//       const profile = scoutProfiles.find(p => p.ID === profileId);
//       alert(`Failed to reveal ${attribute} for ${profile?.Draftee?.FirstName} ${profile?.Draftee?.LastName}`);
//     }
//   };

//   const handleViewScoutDetails = (profile: ScoutingProfile) => {
//     setSelectedScoutProfile(profile);
//     setIsScoutingModalOpen(true);
//   };

//   const handleDraftPlayer = async (player: NFLDraftee) => {
//     if (!currentPick || currentPick.TeamID !== team.ID) return;
//     const updatedPicks = { ...draftState.allDraftPicks };
//     const roundPicks = updatedPicks[draftState.currentRound];
//     const pickIndex = roundPicks.findIndex(p => p.DraftNumber === draftState.currentPick);
    
//     if (pickIndex >= 0) {
//       const updatedPick = new NFLDraftPick(roundPicks[pickIndex]);
//       updatedPick.SelectedPlayerID = player.ID;
//       updatedPick.SelectedPlayerName = `${player.FirstName} ${player.LastName}`;
//       updatedPick.SelectedPlayerPosition = player.Position;
//       roundPicks[pickIndex] = updatedPick;
//     }

//     let nextPick = draftState.currentPick + 1;
//     let nextRound = draftState.currentRound;
    
//     if (nextPick > draftState.currentRound * 32) {
//       nextRound++;
//     }

//     setDraftState(prev => ({
//       ...prev,
//       currentPick: nextPick,
//       currentRound: nextRound,
//       timeLeft: getTimeForPick(nextPick),
//       allDraftPicks: updatedPicks
//     }));
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
//           <Text variant="h3" classes="text-white">Loading Draft Room...</Text>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <Text variant="h3" classes="text-white mb-2">Error Loading Draft Room</Text>
//           <Text variant="body" classes="text-gray-400 mb-4">{error}</Text>
//           <button 
//             onClick={() => window.location.reload()} 
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <div className="mb-6 space-y-4 w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
//           <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
//             <div className="flex-1">
//               <DraftClock
//                 currentPick={currentPick}
//                 currentRound={draftState.currentRound}
//                 pickNumber={draftState.currentPick}
//                 timeLeft={draftState.timeLeft}
//                 isPaused={draftState.isPaused}
//                 teamColors={teamColors}
//               />
//             </div>
//             <div className="flex-1">
//               <DraftTicker
//                 recentPicks={recentPicks.map(pick => ({ pick }))}
//                 teamColors={teamColors}
//                 backgroundColor={backgroundColor}
//               />
//             </div>
//           </div>
//           <div className="h-full">
//             <UpcomingPicks
//               upcomingPicks={upcomingPicks.slice(0, 5)}
//               currentPick={currentPick}
//               userTeamId={team.ID}
//               teamColors={teamColors}
//               backgroundColor={backgroundColor}
//             />
//           </div>
//         </div>
//       </div>
//       <div className="mb-4">
//         <ButtonGroup>
//           <Button
//             variant={activeTab === 'board' ? 'primary' : 'secondary'}
//             onClick={() => setActiveTab('board')}
//           >
//             Draft Board
//           </Button>
//           <Button
//             variant={activeTab === 'scout' ? 'primary' : 'secondary'}
//             onClick={() => setActiveTab('scout')}
//           >
//             Scouting Board
//           </Button>
//         </ButtonGroup>
//       </div>
//       <div>
//         {activeTab === 'board' && (
//           <DraftBoard
//             draftees={nflDraftees}
//             draftedPlayerIds={draftedPlayerIds}
//             scoutedPlayerIds={scoutedPlayerIds}
//             onAddToScoutBoard={handleAddToScoutBoard}
//             onDraftPlayer={currentPick?.TeamID === team.ID ? handleDraftPlayer : undefined}
//             isUserTurn={currentPick?.TeamID === team.ID}
//             teamColors={teamColors}
//             backgroundColor={backgroundColor}
//             scoutingPoints={warRoom?.ScoutingPoints}
//             spentPoints={warRoom?.SpentPoints}
//           />
//         )}
//         {activeTab === 'scout' && (
//           <ScoutingBoard
//             scoutProfiles={scoutProfiles}
//             draftedPlayerIds={draftedPlayerIds}
//             onRemoveFromBoard={handleRemoveFromScoutBoard}
//             onDraftPlayer={currentPick?.TeamID === team.ID ? handleDraftPlayer : undefined}
//             onViewDetails={handleViewScoutDetails}
//             onRevealAttribute={handleRevealAttributeFromBoard}
//             isUserTurn={currentPick?.TeamID === team.ID}
//             teamColors={teamColors}
//             backgroundColor={backgroundColor}
//             teamScoutingPoints={warRoom?.ScoutingPoints || 0}
//             spentPoints={warRoom?.SpentPoints || 0}
//           />
//         )}
//       </div>
//     </div>
//   );
// };