import React, { FC, useState, useMemo } from 'react';
import { Border } from '../../../../_design/Borders';
import { Text } from '../../../../_design/Typography';
import { Button } from '../../../../_design/Buttons';
import { NFLDraftee, ScoutingProfile } from '../../../../models/footballModels';
import { SelectDropdown } from '../../../../_design/Select';
import { SelectOption } from '../../../../_hooks/useSelectStyles';
import PlayerPicture from '../../../../_utility/usePlayerFaces';
import { SimCFB } from '../../../../_constants/constants';
import { getScoutableAttributes, getAttributeShowProperty, getScoutingCost } from '../utils/draftHelpers';
import { ScoutingAttributeBox } from './ScoutingAttributeBox';
import { Handshake, Trash } from '../../../../_design/Icons';
import { darkenColor } from '../../../../_utility/getDarkerColor';

interface ScoutingBoardProps {
  scoutProfiles: ScoutingProfile[];
  draftedPlayerIds: Set<number>;
  onRemoveFromBoard: (profile: ScoutingProfile) => void;
  onDraftPlayer?: (player: NFLDraftee) => void;
  onViewDetails: (profile: ScoutingProfile) => void;
  onRevealAttribute: (profileId: number, showAttribute: string, cost: number) => void;
  isUserTurn?: boolean;
  teamColors: {
    primary: string;
    secondary: string;
  };
  backgroundColor: string;
  teamScoutingPoints: number;
  spentPoints: number;
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

export const ScoutingBoard: FC<ScoutingBoardProps> = ({
  scoutProfiles,
  draftedPlayerIds,
  onRemoveFromBoard,
  onDraftPlayer,
  onViewDetails,
  onRevealAttribute,
  isUserTurn = false,
  teamColors,
  backgroundColor,
  teamScoutingPoints,
  spentPoints
}) => {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const getRevealedCount = (profile: ScoutingProfile): number => {
    let count = 0;
    if (profile.ShowAttribute1) count++;
    if (profile.ShowAttribute2) count++;
    if (profile.ShowAttribute3) count++;
    if (profile.ShowAttribute4) count++;
    if (profile.ShowAttribute5) count++;
    if (profile.ShowAttribute6) count++;
    if (profile.ShowAttribute7) count++;
    if (profile.ShowAttribute8) count++;
    if (profile.ShowPotential) count++;
    return count;
  };

  const filteredProfiles = useMemo(() => {
    let filtered = scoutProfiles.filter(profile => {
      if (draftedPlayerIds.has(profile.PlayerID)) return false;
      if (selectedPositions.length > 0 && 
          !selectedPositions.includes(profile.Draftee.Position)) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [scoutProfiles, draftedPlayerIds, selectedPositions]);

  const availablePoints = teamScoutingPoints - spentPoints;


  const handleAttributeClick = (profile: ScoutingProfile, attributeName: string) => {
    const cost = getScoutingCost(attributeName);
    const showProperty = getAttributeShowProperty(attributeName);
    const revealed = (profile as any)[showProperty];
    
    if (!revealed && availablePoints >= cost) {
      onRevealAttribute(profile.ID, showProperty, cost);
    }
  };

  const renderScoutingAttributeBox = (profile: ScoutingProfile, player: NFLDraftee, attributeName: string, isClickable: boolean = true) => {
    const showProperty = getAttributeShowProperty(attributeName);
    const revealed = (profile as any)[showProperty];
    const cost = getScoutingCost(attributeName);
    const canAfford = availablePoints >= cost;

    return (
      <ScoutingAttributeBox
        key={attributeName}
        attributeName={attributeName}
        player={player}
        cost={cost}
        revealed={revealed}
        canAfford={canAfford}
        onClick={() => isClickable ? handleAttributeClick(profile, attributeName) : undefined}
      />
    );
  };

  return (
    <Border 
      classes="p-4 border-2 min-w-[80em]"
      styles={{ borderColor: teamColors.primary, backgroundColor }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text variant="h5" classes="text-white font-semibold">
          Scouting Board
        </Text>
        <Text variant="xs" classes="text-gray-400">
          {filteredProfiles.length} players scouted
        </Text>
      </div>
      <div className="mb-4">
        <SelectDropdown
          options={positions}
          value={positions.filter(p => selectedPositions.includes(p.value))}
          onChange={(selected) => {
            const values = (selected as SelectOption[])?.map(s => s.value) || [];
            setSelectedPositions(values);
          }}
          placeholder="All Positions"
          isMulti
          className="text-sm max-w-xs"
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {filteredProfiles.map((profile, index) => {
          const player = profile.Draftee;
          const revealedCount = getRevealedCount(profile);
          const isDrafted = draftedPlayerIds.has(player.ID);
          const scoutableAttributes = getScoutableAttributes(player.Position, player.Archetype).filter(attr => attr !== 'Potential Grade');

          return (
            <Border 
              key={profile.ID}
              classes={`p-4 rounded-lg ${isDrafted ? 'opacity-50' : ''}`}
              styles={{ backgroundColor: index % 2 === 1 ? backgroundColor : darkenColor(backgroundColor, -5), borderColor: darkenColor(backgroundColor, 5) }}
            >
              <div className="grid grid-cols-5 gap-6">
                <div className="flex flex-col col-span-1 items-center space-y-2">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <PlayerPicture playerID={player.PlayerID} team={player.CollegeID} league={SimCFB} />
                  </div>
                  <div className="text-center">
                    <Text variant="body" classes="text-white font-semibold">
                      {player.FirstName} {player.LastName}
                    </Text>
                    <Text variant="xs" classes="text-gray-400 mt-1">
                      {player.College}
                    </Text>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                        {player.Position}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                        {player.Archetype}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col col-span-1 items-center space-y-3">
                  <div className="text-center">
                    <Text variant="xs" classes="text-gray-500 mb-1">Overall</Text>
                    <ScoutingAttributeBox
                      attributeName="Potential Grade"
                      player={{ ...player, PotentialGrade: player.OverallGrade } as any}
                      cost={0}
                      revealed={true}
                      canAfford={false}
                      onClick={() => {}}
                    />
                  </div>
                  <div className="text-center">
                    <Text variant="xs" classes="text-gray-500 mb-1">Potential</Text>
                    {renderScoutingAttributeBox(profile, player, 'Potential Grade')}
                  </div>

                  <Text variant="xs" classes="text-gray-500">
                    {revealedCount}/{getScoutableAttributes(player.Position, player.Archetype).length} revealed
                  </Text>
                </div>
                <div className="flex flex-col col-span-2">
                  <Text variant="xs" classes="text-gray-500 mb-2">Attributes</Text>
                  <div className="grid grid-cols-3 gap-2">
                    {scoutableAttributes.map(attributeName => 
                      renderScoutingAttributeBox(profile, player, attributeName)
                    )}
                  </div>
                </div>
                <div className="flex flex-col h-full justify-center col-span-1 items-center gap-2">
                {!isDrafted && (
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    onClick={() => onDraftPlayer(player)}
                    className={`min-w-[10em] p-2 flex justify-center gap-2 items-center ${isUserTurn ? 'bg-green-700' : 'bg-red-800'}`}
                    disabled={!isUserTurn}
                  >
                    <Handshake />
                    Draft
                  </Button>
                )}
                  <Button
                    variant="secondaryOutline"
                    size="sm"
                    onClick={() => onRemoveFromBoard(profile)}
                    className="min-w-[10em] p-2 flex justify-center gap-2 items-center"
                  >
                    <Trash />
                    Remove
                  </Button>
                </div>
              </div>
            </Border>
          );
        })}
      </div>
      {filteredProfiles.length === 0 && (
        <div className="text-center py-8">
          <Text variant="body" classes="text-gray-500">
            No players in your scouting board yet.
          </Text>
        </div>
      )}
    </Border>
  );
};