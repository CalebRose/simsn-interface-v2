import { FC, useState, useMemo } from "react";
import { Border } from "../../../_design/Borders";
import { Text } from "../../../_design/Typography";
import { Input } from "../../../_design/Inputs";
import { SelectDropdown } from "../../../_design/Select";
import { Button, ButtonGroup } from "../../../_design/Buttons";
import { Table, TableCell } from "../../../_design/Table";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import { usePagination } from "../../../_hooks/usePagination";
import { ScoutingTooltip } from "./ScoutingTooltip";
import { getGradeColor } from "../../Gameplan/FootballGameplan/Utils/UIUtils";
import {
  CheckCircle,
  CrossCircle,
  DashCircle,
  Medic,
} from "../../../_design/Icons";
import { darkenColor } from "../../../_utility/getDarkerColor";
import {
  DraftLeague,
  Draftee,
  TeamColors,
  getPositionsByLeague,
  formatPlayerHeight,
  getPlayerCollege,
  getLeagueConstant,
  isNFLLeague,
} from "./types";
import { getOverallGrade } from "./draftHelpers";
import { DraftablePlayer } from "../../../models/hockeyModels";
import {
  DrafteeInfoType,
  InfoType,
  TextGreen,
  ModalAction,
} from "../../../_constants/constants";

interface DraftBoardProps {
  draftees: Draftee[];
  draftedPlayerIds: Set<number>;
  scoutedPlayerIds: Set<number>;
  onAddToScoutBoard: (player: Draftee) => void;
  onDraftPlayer?: (player: Draftee) => void;
  isUserTurn?: boolean;
  teamColors: TeamColors;
  backgroundColor: string;
  scoutingPoints: number;
  spentPoints: number;
  league: DraftLeague;
  openModal: (action: ModalAction, player: Draftee | DraftablePlayer) => void;
  offensiveSystemsInformation?: any;
  defensiveSystemsInformation?: any;
}

export const DraftBoard: FC<DraftBoardProps> = ({
  draftees,
  draftedPlayerIds,
  scoutedPlayerIds,
  onAddToScoutBoard,
  onDraftPlayer,
  isUserTurn = false,
  teamColors,
  backgroundColor,
  scoutingPoints,
  spentPoints,
  league,
  openModal,
  offensiveSystemsInformation,
  defensiveSystemsInformation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>("");
  const [selectedCollege, setSelectedCollege] = useState<string>("");

  const positions = useMemo(() => getPositionsByLeague(league), [league]);

  const archetypes = useMemo(() => {
    const uniqueArchetypes = new Set(
      draftees.map((d) => d.Archetype).filter(Boolean),
    );
    return Array.from(uniqueArchetypes).map((a) => ({ value: a, label: a }));
  }, [draftees]);

  const colleges = useMemo(() => {
    const uniqueColleges = new Set(
      draftees.map((d) => getPlayerCollege(d, league)).filter(Boolean),
    );
    return Array.from(uniqueColleges)
      .sort()
      .map((c) => ({ value: c, label: c }));
  }, [draftees, league]);

  const filteredPlayers = useMemo(() => {
    let filtered = draftees.filter((player) => {
      if (draftedPlayerIds.has(player.ID)) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const fullName = `${player.FirstName} ${player.LastName}`.toLowerCase();
        const college = getPlayerCollege(player, league).toLowerCase();
        if (!fullName.includes(search) && !college.includes(search)) {
          return false;
        }
      }

      if (
        selectedPositions.length > 0 &&
        !selectedPositions.includes(player.Position)
      ) {
        return false;
      }

      if (selectedArchetype && player.Archetype !== selectedArchetype) {
        return false;
      }

      const playerCollege = getPlayerCollege(player, league);
      if (selectedCollege && playerCollege !== selectedCollege) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [
    draftees,
    draftedPlayerIds,
    searchTerm,
    selectedPositions,
    selectedArchetype,
    selectedCollege,
    league,
  ]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    goToPreviousPage,
    goToNextPage,
  } = usePagination(filteredPlayers.length, 25);

  const columns = [
    { header: "Rank", accessor: "rank" },
    { header: "Player", accessor: "LastName" },
    { header: "Position", accessor: "Position" },
    { header: "Archetype", accessor: "Archetype" },
    { header: "Type", accessor: "DraftablePlayerType" },
    { header: "College", accessor: "College" },
    { header: "Age", accessor: "Age" },
    { header: "Height", accessor: "Height" },
    { header: "Weight", accessor: "Weight" },
    { header: "Overall", accessor: "Overall" },
    { header: "Offensive Fit", accessor: "OffensiveFit" },
    { header: "Defensive Fit", accessor: "DefensiveFit" },
    { header: "Actions", accessor: "actions" },
  ];

  const rowRenderer = (
    player: Draftee,
    index: number,
    rowBackgroundColor: string,
  ) => {
    const isScouted = scoutedPlayerIds.has(player.ID);
    const overallGrade = getOverallGrade(player);
    const playerCollege = getPlayerCollege(player, league);
    const isGoodOffensiveFit = (() => {
      if (!player || !offensiveSystemsInformation) return false;
      const goodFits = offensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === player.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadOffensiveFit = (() => {
      if (!player || !offensiveSystemsInformation) return false;
      const badFits = offensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex(
        (x: any) => x.archetype === player.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isGoodDefensiveFit = (() => {
      if (!player || !defensiveSystemsInformation) return false;
      const goodFits = defensiveSystemsInformation.GoodFits;
      const idx = goodFits.findIndex(
        (x: any) => x.archetype === player.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const isBadDefensiveFit = (() => {
      if (!player || !defensiveSystemsInformation) return false;
      const badFits = defensiveSystemsInformation.BadFits;
      const idx = badFits.findIndex(
        (x: any) => x.archetype === player.Archetype,
      );
      if (idx > -1) {
        return true;
      }
      return false;
    })();

    const draftPlayerType = (() => {
      const typing = player.DraftablePlayerType;
      if (typing === 0) {
        return "College";
      }
      if (typing === 1) {
        return "Graduate";
      }
      if (typing === 2) {
        return "International";
      }
      if (typing === 3) {
        return "Canadian";
      }
      return "Unknown";
    })();

    player.IsGoodOffensiveFit = isGoodOffensiveFit;
    player.IsGoodDefensiveFit = isGoodDefensiveFit;
    player.IsBadOffensiveFit = isBadOffensiveFit;
    player.IsBadDefensiveFit = isBadDefensiveFit;

    return (
      <div
        className="table-row border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left"
        style={{ backgroundColor: rowBackgroundColor }}
      >
        <TableCell classes="py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-400">
            {(player as any).DraftedPick || index + 1}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-1 sm:px-3">
          <div className="flex items-center space-x-3">
            <span
              className={`cursor-pointer font-semibold`}
              onMouseEnter={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "#fcd53f";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLSpanElement>) => {
                (e.target as HTMLElement).style.color = "";
              }}
              onClick={() => openModal(DrafteeInfoType, player)}
            >
              <Text variant="small" classes="text-white font-medium">
                {player.FirstName} {player.LastName}
              </Text>
            </span>
          </div>
        </TableCell>
        <TableCell classes="py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {player.Position}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {player.Archetype}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {draftPlayerType}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {playerCollege}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {player.Age}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {formatPlayerHeight(player.Height, league)}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <Text variant="small" classes="text-gray-300">
            {player.Weight} lbs
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <Text
            variant="small"
            classes={`font-bold ${getGradeColor(overallGrade)}`}
          >
            {overallGrade}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <>
            {isGoodOffensiveFit && (
              <CheckCircle textColorClass={`w-full text-center ${TextGreen}`} />
            )}
            {isBadOffensiveFit && (
              <CrossCircle textColorClass="w-full text-center text-red-500" />
            )}
            {!isGoodOffensiveFit && !isBadOffensiveFit && (
              <DashCircle textColorClass="w-full text-center text-gray-500" />
            )}
          </>
        </TableCell>
        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <>
            {isGoodDefensiveFit && (
              <CheckCircle textColorClass={`w-full text-center ${TextGreen}`} />
            )}
            {isBadDefensiveFit && (
              <CrossCircle textColorClass="w-full text-center text-red-500" />
            )}
            {!isGoodDefensiveFit && !isBadDefensiveFit && (
              <DashCircle textColorClass="w-full text-center text-gray-500" />
            )}
          </>
        </TableCell>

        <TableCell classes="text-center py-2 px-1 sm:px-3">
          <div className="flex items-center justify-center space-x-2">
            {!isScouted && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onAddToScoutBoard(player)}
                className="text-xs rounded-full p-1"
              >
                <Medic />
              </Button>
            )}
            {isUserTurn && onDraftPlayer && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onDraftPlayer(player)}
                className="text-xs"
              >
                Draft
              </Button>
            )}
            {isScouted && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="text-xs cursor-not-allowed rounded-full p-1"
              >
                <CheckCircle textColorClass="text-green-700" />
              </Button>
            )}
          </div>
        </TableCell>
      </div>
    );
  };

  const leagueConstant = getLeagueConstant(league);

  return (
    <Border
      classes="p-4 border-2 w-full max-h-[50em] overflow-x-auto"
      styles={{ borderColor: teamColors.primary, backgroundColor }}
    >
      <div className="space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Text variant="h5" classes="text-white font-semibold">
              Available Players
            </Text>
            <ScoutingTooltip />
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <Text variant="xs" classes="text-gray-400">
                Points Available
              </Text>
              <Text variant="h6" classes="text-green-400 font-bold">
                {(scoutingPoints || 0) - (spentPoints || 0)}
              </Text>
            </div>
            <div className="text-center">
              <Text variant="xs" classes="text-gray-400">
                Points Spent
              </Text>
              <Text variant="h6" classes="text-white font-bold">
                {spentPoints}
              </Text>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="Search players..."
            className="bg-gray-800 border-gray-700 text-white"
          />
          <SelectDropdown
            options={positions}
            value={positions.filter((p) => selectedPositions.includes(p.value))}
            onChange={(selected) => {
              const values =
                (selected as SelectOption[])?.map((s) => s.value) || [];
              setSelectedPositions(values);
              setCurrentPage(0);
            }}
            placeholder="All Positions"
            isMulti
            className="text-sm"
          />
          <SelectDropdown
            options={archetypes}
            value={archetypes.find((a) => a.value === selectedArchetype)}
            onChange={(selected) => {
              setSelectedArchetype((selected as SelectOption)?.value || "");
              setCurrentPage(0);
            }}
            placeholder="All Archetypes"
            isClearable
            className="text-sm"
          />
          <SelectDropdown
            options={colleges}
            value={colleges.find((c) => c.value === selectedCollege)}
            onChange={(selected) => {
              setSelectedCollege((selected as SelectOption)?.value || "");
              setCurrentPage(0);
            }}
            placeholder={isNFLLeague(league) ? "All Colleges" : "All Teams"}
            isClearable
            className="text-sm"
          />
        </div>
      </div>
      <Table
        columns={columns}
        data={filteredPlayers}
        team={teamColors}
        rowRenderer={rowRenderer}
        rowBgColor={backgroundColor}
        darkerRowBgColor={darkenColor(backgroundColor, -5)}
        league={leagueConstant}
        enablePagination={true}
        currentPage={currentPage}
        page={`${league}DraftPage`}
      />
      <div className="flex flex-row justify-center py-2">
        <ButtonGroup>
          <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
            Prev
          </Button>
          <Text variant="body-small" classes="flex items-center">
            {currentPage + 1}
          </Text>
          <Button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </Border>
  );
};
