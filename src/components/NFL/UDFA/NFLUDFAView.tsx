import React, { useEffect, useMemo, useState } from "react";
import { useNFLUDFA } from "./useNFLUDFA";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useAuthStore } from "../../../context/AuthContext";
import { Table, TableCell } from "../../../_design/Table";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { Plus } from "../../../_design/Icons";
import { ActionModal } from "../../Common/ActionModal";
import { useModal } from "../../../_hooks/useModal";
import { useTeamColors } from "../../../_hooks/useTeamColors";
import { useBackgroundColor } from "../../../_hooks/useBackgroundColor";
import { usePagination } from "../../../_hooks/usePagination";
import { CategoryDropdown } from "../../Recruiting/Common/RecruitingCategoryDropdown";
import { FreeAgencySidebar } from "../../FreeAgencyPage/Common/FreeAgencySidebar";
import {
  Overview,
  Contracts,
  SimNFL,
  DrafteeInfoType,
  FootballPositionOptions,
  FootballArchetypeOptions,
  InfoType,
  // Removed AdminRole import
} from "../../../_constants/constants";
import { GetNFLOverall } from "../../Team/TeamPageUtils";

export const NFLUDFAView = () => {
  // Removed the currentUser and isAdmin checks from here

  const {
    nflTeam,
    addPlayerToUDFABoard,
    nflUDFABoard,
    cfb_Timestamp,
    udfas,
    getBootstrapFreeAgencyData,
  } = useSimFBAStore();
  const { board, pointsRemaining, handlePointChange, saveBids, removePlayer } =
    useNFLUDFA();

  const { backgroundColor } = useBackgroundColor();
  const teamColors = useTeamColors(
    nflTeam?.ColorOne || "#1f2937",
    nflTeam?.ColorTwo || "#111827",
  );

  const [viewCategory, setViewCategory] = useState(Overview);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetypes, setArchetypes] = useState<string[]>([]);
  const pageSize = 50;

  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const [modalPlayer, setModalPlayer] = useState<any>(null);

  useEffect(() => {
    getBootstrapFreeAgencyData();
  }, [getBootstrapFreeAgencyData]);

  const gradeWeight: Record<string, number> = {
    "A+": 13,
    A: 12,
    "A-": 11,
    "B+": 10,
    B: 9,
    "B-": 8,
    "C+": 7,
    C: 6,
    "C-": 5,
    "D+": 4,
    D: 3,
    "D-": 2,
    F: 1,
    "": 0,
  };

  const filteredUDFAs = useMemo(() => {
    if (!udfas) return [];
    // Matching the new backend logic:
    let filtered = udfas;
    if (positions.length > 0)
      filtered = filtered.filter((p) => positions.includes(p.Position));
    if (archetypes.length > 0)
      filtered = filtered.filter((p) => archetypes.includes(p.Archetype));
    return filtered.sort((a, b) => {
      const overallB = GetNFLOverall(b.Overall, b.ShowLetterGrade);
      const overallA = GetNFLOverall(a.Overall, a.ShowLetterGrade);
      if (typeof overallB === "number" && typeof overallA !== "number") {
        return -1;
      } else if (typeof overallA === "number" && typeof overallB !== "number") {
        return 1;
      }
      if (
        typeof overallB === "number" &&
        typeof overallA === "number" &&
        overallB !== overallA
      )
        return overallB - overallA;
      return 0;
    });
  }, [udfas, positions, archetypes]);

  const {
    currentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    setCurrentPage,
  } = usePagination(filteredUDFAs.length, pageSize);
  const pagedUDFAs = useMemo(
    () =>
      filteredUDFAs.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    [filteredUDFAs, currentPage],
  );

  const handleOpenPlayerCard = (playerData: any) => {
    let fullPlayer = playerData.PlayerName
      ? udfas?.find((p: any) => p.ID === playerData.PlayerID)
      : playerData;
    if (fullPlayer) {
      setModalPlayer(fullPlayer);
      handleOpenModal();
    }
  };

  return (
    <div
      className="w-full min-h-screen p-4 flex flex-col"
      style={{ backgroundColor }}
    >
      {modalPlayer && (
        <ActionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerID={modalPlayer.ID}
          playerLabel={`${modalPlayer.Position} ${modalPlayer.Archetype} ${modalPlayer.FirstName} ${modalPlayer.LastName}`}
          league={SimNFL}
          teamID={0}
          modalAction={InfoType}
          player={modalPlayer}
        />
      )}

      <div
        className="w-full mb-6 px-2 border-l-8"
        style={{ borderColor: teamColors.One }}
      >
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          NFL UDFA Recruitment
        </h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[2fr_10fr] gap-4 w-full h-full">
        <div className="w-full">
          {nflTeam && nflTeam.Capsheet ? (
            <FreeAgencySidebar
              Capsheet={nflTeam.Capsheet}
              AdjCapsheet={nflTeam.Capsheet}
              Team={nflTeam}
              teamColors={teamColors}
              league={SimNFL}
              ts={cfb_Timestamp as any}
            />
          ) : (
            <div
              className="w-full p-6 border-2 rounded-xl flex flex-col items-center justify-center shadow-lg"
              style={{
                borderColor: teamColors.One,
                backgroundColor: "rgba(0,0,0,0.4)",
                minHeight: "250px",
              }}
            >
              <Text
                variant="h6"
                classes="text-white font-bold uppercase tracking-widest"
              >
                Team Capsheet
              </Text>
              <Text variant="small" classes="text-gray-400 animate-pulse mt-2">
                Loading financial data...
              </Text>
            </div>
          )}
        </div>

        <div className="flex flex-col w-full gap-y-4">
          <div
            className="w-full p-4 flex flex-row items-center justify-between border-2 rounded-xl"
            style={{
              borderColor: teamColors.One,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            <ButtonGroup>
              <Button
                variant={viewCategory === Overview ? "success" : "secondary"}
                onClick={() => setViewCategory(Overview)}
              >
                Overview
              </Button>
              <Button
                variant={viewCategory === Contracts ? "success" : "secondary"}
                onClick={() => setViewCategory(Contracts)}
              >
                My Bids
              </Button>
            </ButtonGroup>
            <div className="flex gap-x-2 items-center">
              <Text
                variant="h5"
                classes={
                  pointsRemaining < 5
                    ? "text-red-500 font-bold"
                    : "text-green-400 font-bold"
                }
              >
                Points Available: {pointsRemaining} / 20
              </Text>
              <Button
                variant="primary"
                onClick={saveBids}
                disabled={pointsRemaining < 0}
              >
                Save All Bids
              </Button>
              {/* REMOVED: The Run Live Simulation button is gone from here */}
            </div>
          </div>

          {viewCategory === Overview && (
            <div
              className="w-full p-4 flex flex-row flex-wrap gap-4 border-2 rounded-xl items-end"
              style={{
                borderColor: teamColors.One,
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <CategoryDropdown
                label="Positions"
                options={FootballPositionOptions}
                isMulti={true}
                change={(opts: any) => {
                  setPositions(opts ? opts.map((o: any) => o.value) : []);
                  setCurrentPage(0);
                }}
              />
              <CategoryDropdown
                label="Archetype"
                options={FootballArchetypeOptions}
                isMulti={true}
                change={(opts: any) => {
                  setArchetypes(opts ? opts.map((o: any) => o.value) : []);
                  setCurrentPage(0);
                }}
              />
            </div>
          )}

          <div
            className="w-full p-4 border-2 rounded-xl shadow-2xl overflow-hidden min-h-100"
            style={{
              borderColor: teamColors.One,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          >
            {viewCategory === Overview ? (
              <>
                <Table
                  team={(nflTeam || {}) as any}
                  columns={[
                    { header: "ID", accessor: "ID" },
                    { header: "Name", accessor: "FirstName" },
                    { header: "Pos", accessor: "Position" },
                    { header: "Archetype", accessor: "Archetype" },
                    { header: "Ovr", accessor: "Overall" },
                    { header: "Action", accessor: "" },
                  ]}
                  data={pagedUDFAs || []}
                  rowRenderer={(player: any, index: number, bg: string) => {
                    const isOnBoard = nflUDFABoard?.Profiles?.some(
                      (p: any) => p.PlayerID === player.ID,
                    );
                    const overallGrade = GetNFLOverall(
                      player.Overall,
                      player.ShowLetterGrade,
                    );
                    return (
                      <div
                        className="table-row border-b border-gray-700 last:border-0 text-start"
                        style={{ backgroundColor: bg }}
                        key={player.ID}
                      >
                        <TableCell classes="text-gray-500 text-xs">
                          {player.ID}
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-blue-400 hover:underline cursor-pointer font-bold"
                            onClick={() => handleOpenPlayerCard(player)}
                          >
                            {player.FirstName} {player.LastName}
                          </span>
                        </TableCell>
                        <TableCell>{player.Position}</TableCell>
                        <TableCell>{player.Archetype}</TableCell>
                        <TableCell classes="font-mono font-bold text-lg">
                          {overallGrade}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addPlayerToUDFABoard(player);
                            }}
                            disabled={isOnBoard}
                            className="p-2 rounded-lg flex items-center justify-center bg-gray-700 hover:scale-110 shadow-lg"
                          >
                            {isOnBoard ? (
                              <Text classes="text-xs px-1 text-white">
                                On Board
                              </Text>
                            ) : (
                              <Plus />
                            )}
                          </button>
                        </TableCell>
                      </div>
                    );
                  }}
                />
                {(!pagedUDFAs || pagedUDFAs.length === 0) && (
                  <div className="w-full p-20 text-center text-gray-500 italic font-bold uppercase tracking-widest animate-pulse">
                    Data is syncing... Please wait.
                  </div>
                )}
              </>
            ) : (
              <Table
                team={(nflTeam || {}) as any}
                columns={[
                  { header: "Player", accessor: "PlayerName" },
                  { header: "Pos", accessor: "Position" },
                  { header: "Bid (1-20)", accessor: "Points" },
                  { header: "Actions", accessor: "" },
                ]}
                data={board?.Profiles || []}
                rowRenderer={(profile: any, index: number, bg: string) => (
                  <div
                    className="table-row border-b border-gray-700 last:border-0 text-start"
                    style={{ backgroundColor: bg }}
                    key={profile.ID}
                  >
                    <TableCell>
                      <span
                        className="text-blue-400 hover:underline cursor-pointer font-bold text-lg"
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
                        min={0}
                        max={20}
                        onChange={(e: any) =>
                          handlePointChange(
                            profile.ID,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-24 bg-gray-900 text-white border border-gray-600 rounded p-1 text-center font-bold text-lg"
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
          </div>
        </div>
      </div>
    </div>
  );
};
