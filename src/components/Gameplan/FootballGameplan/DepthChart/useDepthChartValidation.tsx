import { useMemo } from 'react';
import { CollegePlayer, NFLPlayer } from '../../../../models/footballModels';
import { SimCFB, SimNFL } from '../../../../_constants/constants';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface UseDepthChartValidationProps {
  depthChart: any;
  players: (CollegePlayer | NFLPlayer)[];
  league: typeof SimCFB | typeof SimNFL;
  canModify: boolean;
}

export const useDepthChartValidation = ({
  depthChart,
  players,
  league,
  canModify
}: UseDepthChartValidationProps): ValidationResult => {
  
  return useMemo(() => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!depthChart?.DepthChartPlayers || !canModify) {
      if (!canModify) {
        errors.push({
          field: 'permissions',
          message: 'You do not have permission to modify this depth chart.',
          severity: 'error'
        });
      }
      return { isValid: false, errors, warnings };
    }
    const playerMap = new Map();
    players.forEach(player => {
      const playerId = (player as any).PlayerID || (player as any).ID;
      playerMap.set(playerId, player);
    });

    depthChart.DepthChartPlayers.forEach((dcPlayer: any) => {
      const player = playerMap.get(dcPlayer.PlayerID);
      if (!player) {
        errors.push({
          field: dcPlayer.Position,
          message: `${dcPlayer.OriginalPosition} ${dcPlayer.FirstName} ${dcPlayer.LastName} is no longer on the team. Please remove them from their ${dcPlayer.Position} position.`,
          severity: 'error'
        });
        return;
      }

      const playerName = `${player.FirstName} ${player.LastName}`;

      if (league === SimCFB) {
        const cfbPlayer = player as CollegePlayer;
        

      } else {
        const nflPlayer = player as NFLPlayer;
        
        if (nflPlayer.IsPracticeSquad) {
          errors.push({
            field: dcPlayer.Position,
            message: `${playerName} is on the practice squad but is listed in the depth chart. Please swap them from their ${dcPlayer.Position} position level.`,
            severity: 'error'
          });
        }
      }

      const isInjured = league === SimCFB 
        ? (player as CollegePlayer).IsInjured 
        : (player as NFLPlayer).IsInjured;
      
      if (isInjured) {
        const injuryType = league === SimCFB 
          ? (player as CollegePlayer).InjuryType 
          : (player as NFLPlayer).InjuryType;
        const weeksOfRecovery = league === SimCFB 
          ? (player as CollegePlayer).WeeksOfRecovery 
          : (player as NFLPlayer).WeeksOfRecovery;
        
        errors.push({
          field: dcPlayer.Position,
          message: `${playerName} is injured with ${injuryType || 'unknown injury'}. They are unable to play for ${weeksOfRecovery || 'unknown'} weeks. Please swap them from their ${dcPlayer.Position} position level.`,
          severity: 'error'
        });
      }
    });

    const specialTeamsPositions = ['P', 'K', 'PR', 'KR', 'FG', 'STU'];
    const positionGroups = {
      'OLine': ['LT', 'LG', 'C', 'RG', 'RT'],
      'DLine': ['DT', 'LE', 'RE'],
      'LB': ['LOLB', 'MLB', 'ROLB'],
      'DB': ['CB', 'FS', 'SS']
    };
    const depthChartMap = new Map();
    depthChart.DepthChartPlayers.forEach((dcPlayer: any) => {
      if (!depthChartMap.has(dcPlayer.PlayerID)) {
        depthChartMap.set(dcPlayer.PlayerID, []);
      }
      depthChartMap.get(dcPlayer.PlayerID).push({
        position: dcPlayer.Position,
        level: parseInt(dcPlayer.PositionLevel)
      });
    });

    depthChartMap.forEach((positions, playerId) => {
      const player = playerMap.get(playerId);
      if (!player) return;

      const playerName = `${player.FirstName} ${player.LastName}`;
      const firstStringPositions = positions.filter((pos: any) => 
        pos.level === 1 && !specialTeamsPositions.includes(pos.position)
      );

      if (firstStringPositions.length > 1) {
        const positionNames = firstStringPositions.map((pos: any) => pos.position).join(', ');
        errors.push({
          field: 'multiple-positions',
          message: `${playerName} is assigned as first string to multiple positions: ${positionNames}. A player can only be first string at one position.`,
          severity: 'error'
        });
      }

      if (firstStringPositions.length > 1) {
        for (const [groupName, groupPositions] of Object.entries(positionGroups)) {
          const groupFirstStringCount = firstStringPositions.filter((pos: any) => 
            groupPositions.includes(pos.position)
          ).length;

          if (groupFirstStringCount > 1) {
            const groupDisplayName = {
              'OLine': 'offensive line',
              'DLine': 'defensive line', 
              'LB': 'linebacker',
              'DB': 'defensive back'
            }[groupName];

            errors.push({
              field: groupName,
              message: `You have ${playerName} set at First String for multiple ${groupDisplayName} positions. Please resolve this issue.`,
              severity: 'error'
            });
          }
        }
      }
    });

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings
    };

  }, [depthChart, players, league, canModify]);
};