import { FC, useState, useMemo } from 'react';
import { Border } from '../../../../_design/Borders';
import { Text } from '../../../../_design/Typography';
import { Input } from '../../../../_design/Inputs';
import { SelectDropdown } from '../../../../_design/Select';
import { Button, ButtonGroup } from '../../../../_design/Buttons';
import { Table, TableCell } from '../../../../_design/Table';
import { NFLDraftee } from '../../../../models/footballModels';
import { SelectOption } from '../../../../_hooks/useSelectStyles';
import { usePagination } from '../../../../_hooks/usePagination';
import { ScoutingTooltip } from './ScoutingTooltip';
import { getGradeColor } from '../../../Gameplan/FootballGameplan/Utils/UIUtils';
import PlayerPicture from '../../../../_utility/usePlayerFaces';
import { SimCFB, SimNFL } from '../../../../_constants/constants';
import { CheckCircle, Medic } from '../../../../_design/Icons';
import { darkenColor } from '../../../../_utility/getDarkerColor';

interface DraftBoardProps {
  draftees: NFLDraftee[];
  draftedPlayerIds: Set<number>;
  scoutedPlayerIds: Set<number>;
  onAddToScoutBoard: (player: NFLDraftee) => void;
  onDraftPlayer?: (player: NFLDraftee) => void;
  isUserTurn?: boolean;
  teamColors: {
    primary: string;
    secondary: string;
  };
  backgroundColor: string;
  scoutingPoints: any;
  spentPoints: any;
}

const positions = [
  { value: 'QB', label: 'Quarterback' },
  { value: 'RB', label: 'Running Back' },
  { value: 'WR', label: 'Wide Receiver' },
  { value: 'TE', label: 'Tight End' },
  { value: 'OT', label: 'Offensive Tackle' },
  { value: 'OG', label: 'Offensive Guard' },
  { value: 'C', label: 'Center' },
  { value: 'DE', label: 'Defensive End' },
  { value: 'DT', label: 'Defensive Tackle' },
  { value: 'ILB', label: 'Inside Linebacker' },
  { value: 'OLB', label: 'Outside Linebacker' },
  { value: 'CB', label: 'Cornerback' },
  { value: 'S', label: 'Safety' },
  { value: 'K', label: 'Kicker' },
  { value: 'P', label: 'Punter' },
];

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
  spentPoints
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<string>('');

  const archetypes = useMemo(() => {
    const uniqueArchetypes = new Set(draftees.map(d => d.Archetype).filter(Boolean));
    return Array.from(uniqueArchetypes).map(a => ({ value: a, label: a }));
  }, [draftees]);

  const colleges = useMemo(() => {
    const uniqueColleges = new Set(draftees.map(d => d.College).filter(Boolean));
    return Array.from(uniqueColleges).sort().map(c => ({ value: c, label: c }));
  }, [draftees]);

  const filteredPlayers = useMemo(() => {
    let filtered = draftees.filter(player => {
      if (draftedPlayerIds.has(player.ID)) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const fullName = `${player.FirstName} ${player.LastName}`.toLowerCase();
        if (!fullName.includes(search) && 
            !player.College?.toLowerCase().includes(search)) {
          return false;
        }
      }

      if (selectedPositions.length > 0 && !selectedPositions.includes(player.Position)) {
        return false;
      }

      if (selectedArchetype && player.Archetype !== selectedArchetype) {
        return false;
      }

      if (selectedCollege && player.College !== selectedCollege) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [draftees, draftedPlayerIds, searchTerm, selectedPositions, selectedArchetype, selectedCollege]);

  const { 
    currentPage, 
    setCurrentPage, 
    totalPages, 
    goToPreviousPage, 
    goToNextPage 
  } = usePagination(filteredPlayers.length, 25);

  const columns = [
    { header: 'Rank', accessor: 'rank' },
    { header: 'Player', accessor: 'player' },
    { header: 'Position', accessor: 'Position' },
    { header: 'Archetype', accessor: 'Archetype' },
    { header: 'College', accessor: 'College' },
    { header: 'Age', accessor: 'Age' },
    { header: 'Height', accessor: 'height' },
    { header: 'Weight', accessor: 'Weight' },
    { header: 'Overall', accessor: 'OverallGrade' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const rowRenderer = (player: NFLDraftee, index: number, rowBackgroundColor: string) => {
    const isScouted = scoutedPlayerIds.has(player.ID);
    
    return (
      <div className="table-row border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left" style={{ backgroundColor: rowBackgroundColor }}>
        <TableCell classes="py-2 px-3">
          <Text variant="body" classes="text-gray-400">
            {player.DraftedPick || index + 1}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-3">
          <div className="flex items-center space-x-3">
            <div>
              <Text variant="body" classes="text-white font-medium">
                {player.FirstName} {player.LastName}
              </Text>
            </div>
          </div>
        </TableCell>
        <TableCell classes="py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {player.Position}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {player.Archetype}
          </Text>
        </TableCell>
        <TableCell classes="py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {player.College}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {player.Age}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {Math.floor(player.Height / 12)}'{player.Height % 12}"
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-3">
          <Text variant="body" classes="text-gray-300">
            {player.Weight} lbs
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-3">
          <Text variant="body" classes={`font-bold ${getGradeColor(player.OverallGrade)}`}>
            {player.OverallGrade}
          </Text>
        </TableCell>
        <TableCell classes="text-center py-2 px-3">
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


  return (
    <Border 
      classes="p-4 border-2 min-w-[80em] max-h-[50em]"
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
              <Text variant="xs" classes="text-gray-400">Points Available</Text>
              <Text variant="h6" classes="text-green-400 font-bold">
                {(scoutingPoints || 0) - (spentPoints || 0)}
              </Text>
            </div>
            <div className="text-center">
              <Text variant="xs" classes="text-gray-400">Points Spent</Text>
              <Text variant="h6" classes="text-white font-bold">{spentPoints}</Text>
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
            value={positions.filter(p => selectedPositions.includes(p.value))}
            onChange={(selected) => {
              const values = (selected as SelectOption[])?.map(s => s.value) || [];
              setSelectedPositions(values);
              setCurrentPage(0);
            }}
            placeholder="All Positions"
            isMulti
            className="text-sm"
          />
          <SelectDropdown
            options={archetypes}
            value={archetypes.find(a => a.value === selectedArchetype)}
            onChange={(selected) => {
              setSelectedArchetype((selected as SelectOption)?.value || '');
              setCurrentPage(0);
            }}
            placeholder="All Archetypes"
            isClearable
            className="text-sm"
          />
          <SelectDropdown
            options={colleges}
            value={colleges.find(c => c.value === selectedCollege)}
            onChange={(selected) => {
              setSelectedCollege((selected as SelectOption)?.value || '');
              setCurrentPage(0);
            }}
            placeholder="All Colleges"
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
        league={SimNFL}
        enablePagination={true}
        currentPage={currentPage}
        pageSize={150}
      />
      <div className="flex flex-row justify-center py-2">
        <ButtonGroup>
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
          >
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