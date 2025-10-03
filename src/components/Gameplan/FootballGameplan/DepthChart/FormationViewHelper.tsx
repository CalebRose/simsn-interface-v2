import { Formation } from '../Constants/GameplanConstants';
import {
  UNDER_CENTER,
  GUN,
  PISTOL,
  SPREAD,
  TIGHT,
  WING,
  EMPTY,
  SINGLEBACK,
  FLEXBONE_GUN,
  SPLIT_BACK_GUN,
  WING_T,
  WING_T_DOUBLE_TIGHT,
  WING_SPLIT_BACK_GUN,
  DOUBLE_WING_SPLIT,
  DOUBLE_WING_TIGHT,
  DOUBLE_WING_SPREAD,
  DOUBLE_WING_STRONG,
  DOUBLE_WING,
  FOUR_THREE_BASE,
  FOUR_THREE_OVER,
  FOUR_THREE_UNDER,
  FOUR_THREE_LIGHT,
  FOUR_THREE_HEAVY,
  THREE_FOUR_BASE,
  THREE_FOUR_OVER,
  THREE_FOUR_UNDER,
  THREE_FOUR_OKIE,
  THREE_FOUR_BRONCO,
  THREE_FOUR_EAGLE,
  THREE_FOUR_FOUR_HEAVY,
  FOUR_FOUR_BASE,
  FOUR_FOUR_OVER,
  FOUR_FOUR_UNDER,
  FOUR_FOUR_JUMBO,
  FOUR_FOUR_HEAVY,
  FOUR_TWO_FIVE_BASE,
  FOUR_TWO_FIVE_NICKEL,
  THREE_THREE_FIVE_BASE,
  THREE_THREE_FIVE_OVER,
  THREE_THREE_FIVE_NICKEL,
  DIME_FOUR_ONE_SIX,
  DIME_THREE_TWO_SIX,
  FOUR_ONE_SIX_DIME,
  FOUR_ONE_SIX_BIG_DIME,
  THREE_TWO_SIX_DIME,
  THREE_TWO_SIX_BIG_PENNY,
  THREE_TWO_SIX_PENNY,
  QUARTER,
  GOAL_LINE,
  POSITION_PREFIXES,
  FORMATION_KEYWORDS,
  GRID_POSITIONS
} from '../Constants/DepthChartConstants';

export type FormationType = 
  | typeof UNDER_CENTER | typeof GUN | typeof PISTOL | typeof SPREAD | typeof TIGHT | typeof WING | typeof EMPTY | typeof WING_T | typeof WING_T_DOUBLE_TIGHT | typeof SPLIT_BACK_GUN
  | typeof FLEXBONE_GUN | typeof WING_SPLIT_BACK_GUN | typeof DOUBLE_WING_SPLIT | typeof DOUBLE_WING_TIGHT | typeof DOUBLE_WING_SPREAD | typeof DOUBLE_WING_STRONG | typeof DOUBLE_WING | typeof SINGLEBACK;

export type DefensiveFormationType = 
  | typeof FOUR_THREE_BASE | typeof FOUR_THREE_OVER | typeof FOUR_THREE_UNDER | typeof FOUR_THREE_LIGHT | typeof FOUR_THREE_HEAVY
  | typeof THREE_FOUR_BASE | typeof THREE_FOUR_OVER | typeof THREE_FOUR_UNDER | typeof THREE_FOUR_OKIE | typeof THREE_FOUR_BRONCO | typeof THREE_FOUR_EAGLE | typeof THREE_FOUR_FOUR_HEAVY
  | typeof FOUR_FOUR_BASE | typeof FOUR_FOUR_OVER | typeof FOUR_FOUR_UNDER | typeof FOUR_FOUR_JUMBO | typeof FOUR_FOUR_HEAVY
  | typeof FOUR_TWO_FIVE_BASE | typeof FOUR_TWO_FIVE_NICKEL | typeof THREE_THREE_FIVE_BASE | typeof THREE_THREE_FIVE_OVER | typeof THREE_THREE_FIVE_NICKEL
  | typeof DIME_FOUR_ONE_SIX | typeof DIME_THREE_TWO_SIX | typeof FOUR_ONE_SIX_DIME | typeof FOUR_ONE_SIX_BIG_DIME | typeof THREE_TWO_SIX_DIME | typeof THREE_TWO_SIX_BIG_PENNY | typeof THREE_TWO_SIX_PENNY
  | typeof QUARTER | typeof GOAL_LINE;

export interface FormationPositionData {
  position: string;
  row: number;
  col: number | string;
  colSpan?: number;
  shouldRender: boolean;
  empty?: boolean;
  showBackup?: boolean;
}

export interface FormationLayout {
  qbRow: number;
  positions: FormationPositionData[];
}

export interface WRPositioning {
  [key: string]: {
    row: number;
    col: number | string;
  };
}

export const getFormationType = (formationName: string, positions: string[] = []): FormationType => {
  const name = formationName.toLowerCase();

  if (name.includes(FORMATION_KEYWORDS.SINGLEBACK) && !name.includes(FORMATION_KEYWORDS.GUN)) {
    return SINGLEBACK;
  }

  if (name.includes(FORMATION_KEYWORDS.WINGT) && name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.TIGHT)) {
    return WING_T_DOUBLE_TIGHT;
  }

  if (name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.WING) && name.includes(FORMATION_KEYWORDS.SPLIT)) {
    return DOUBLE_WING_SPLIT;
  }

  if (name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.WING) && name.includes(FORMATION_KEYWORDS.TIGHT)) {
    return DOUBLE_WING_TIGHT;
  }

  if (name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.WING) && name.includes(FORMATION_KEYWORDS.SPREAD)) {
    return DOUBLE_WING_SPREAD;
  }

  if (name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.WING) && name.includes(FORMATION_KEYWORDS.STRONG)) {
    return DOUBLE_WING_STRONG;
  }

  if (name.includes(FORMATION_KEYWORDS.DOUBLE) && name.includes(FORMATION_KEYWORDS.WING)) {
    return DOUBLE_WING;
  }

  if (name.includes(FORMATION_KEYWORDS.FLEXBONE) && name.includes(FORMATION_KEYWORDS.GUN)) {
    return FLEXBONE_GUN;
  }

  if (name.includes(FORMATION_KEYWORDS.WING) && name.includes(FORMATION_KEYWORDS.SPLIT) && name.includes(FORMATION_KEYWORDS.BACK) && name.includes(FORMATION_KEYWORDS.GUN)) {
    return WING_SPLIT_BACK_GUN;
  }

  if (name.includes(FORMATION_KEYWORDS.SPLIT) && name.includes(FORMATION_KEYWORDS.BACK) && name.includes(FORMATION_KEYWORDS.GUN)) {
    return SPLIT_BACK_GUN;
  }

  if (name.includes(FORMATION_KEYWORDS.WINGT)) {
    return WING_T;
  }
  
  if (name.includes(FORMATION_KEYWORDS.EMPTY) || (positions.filter(p => p.startsWith(POSITION_PREFIXES.WR)).length >= 5)) {
    return EMPTY;
  }
  
  if (name.includes(FORMATION_KEYWORDS.GUN) || name.includes(`${FORMATION_KEYWORDS.SPREAD} ${FORMATION_KEYWORDS.GUN}`)) {
    return GUN;
  }

  if (name.includes(FORMATION_KEYWORDS.PISTOL)) {
    return PISTOL;
  }
  
  if (name.includes(FORMATION_KEYWORDS.SPREAD) || positions.filter(p => p.startsWith(POSITION_PREFIXES.WR)).length >= 3) {
    return SPREAD;
  }

  const teCount = positions.filter(p => p.startsWith(POSITION_PREFIXES.TE)).length;
  const hasFB = positions.some(p => p.startsWith(POSITION_PREFIXES.FB));
  if (name.includes(`${FORMATION_KEYWORDS.DOUBLE} ${FORMATION_KEYWORDS.TIGHT}`) || name.includes(FORMATION_KEYWORDS.HEAVY) || (teCount >= 2) || (teCount >= 1 && hasFB)) {
    return TIGHT;
  }
  
  if (name.includes(FORMATION_KEYWORDS.WING)) {
    return WING;
  }
  
  return UNDER_CENTER;
};

export const getDefensiveFormationType = (formationName: string, positions: string[] = [], defensiveScheme?: string): DefensiveFormationType => {
  const name = formationName.toLowerCase();
  
  if (name === '4-1-6 dime' && defensiveScheme) {
    if (defensiveScheme === 'Speed' && positions.includes(`${POSITION_PREFIXES.SS}2`)) {
      return FOUR_ONE_SIX_DIME;
    } else if (defensiveScheme === '4-Man Front Spread Stopper' && !positions.includes(`${POSITION_PREFIXES.SS}2`)) {
      return FOUR_ONE_SIX_DIME;
    }
  }

  if (name.includes('4-4')) {
    if (name.includes(FORMATION_KEYWORDS.JUMBO)) {
      return FOUR_FOUR_JUMBO;
    }
    if (name.includes(FORMATION_KEYWORDS.HEAVY)) {
      return FOUR_FOUR_HEAVY;
    }
    if (name.includes(FORMATION_KEYWORDS.OVER)) {
      return FOUR_FOUR_OVER;
    }
    if (name.includes(FORMATION_KEYWORDS.UNDER)) {
      return FOUR_FOUR_UNDER;
    }
    return FOUR_FOUR_BASE;
  }

  if (name.includes('3-4')) {
    if (name.includes(FORMATION_KEYWORDS.OKIE)) {
      return THREE_FOUR_OKIE;
    }
    if (name.includes(FORMATION_KEYWORDS.EAGLE)) {
      return THREE_FOUR_EAGLE;
    }
    if (name.includes(FORMATION_KEYWORDS.BRONCO)) {
      return THREE_FOUR_BRONCO;
    }
    if (name.includes(FORMATION_KEYWORDS.OVER)) {
      return THREE_FOUR_OVER;
    }
    if (name.includes(FORMATION_KEYWORDS.UNDER)) {
      return THREE_FOUR_UNDER;
    }
    if (name === '3-4-4 heavy') {
      return THREE_FOUR_FOUR_HEAVY;
    }
    return THREE_FOUR_BASE;
  }

  if (name.includes('4-3')) {
    if (name.includes(FORMATION_KEYWORDS.LIGHT)) {
      return FOUR_THREE_LIGHT;
    }
    if (name.includes(FORMATION_KEYWORDS.HEAVY)) {
      return FOUR_THREE_HEAVY;
    }
    if (name.includes(FORMATION_KEYWORDS.OVER)) {
      return FOUR_THREE_OVER;
    }
    if (name.includes(FORMATION_KEYWORDS.UNDER)) {
      return FOUR_THREE_UNDER;
    }
    return FOUR_THREE_BASE;
  }

  if (name === '3-4-4 heavy') {
    return THREE_FOUR_FOUR_HEAVY;
  }

  if (name.includes(FORMATION_KEYWORDS.DIME) || name.includes('4-1-6') || name.includes('3-2-6')) {
    if (name.includes(`${FORMATION_KEYWORDS.BIG} ${FORMATION_KEYWORDS.DIME}`)) {
      return FOUR_ONE_SIX_BIG_DIME;
    }
    if (name.includes(`${FORMATION_KEYWORDS.BIG} ${FORMATION_KEYWORDS.PENNY}`)) {
      return THREE_TWO_SIX_BIG_PENNY;
    }
    if (name.includes(FORMATION_KEYWORDS.PENNY)) {
      return THREE_TWO_SIX_PENNY;
    }
    if (name === '4-1-6 dime') {
      return FOUR_ONE_SIX_DIME;
    }
    if (name === '3-2-6 dime') {
      return THREE_TWO_SIX_DIME;
    }
    if (name.includes('3-2-6')) {
      return DIME_THREE_TWO_SIX;
    }
    return DIME_FOUR_ONE_SIX;
  }

  if (name.includes(FORMATION_KEYWORDS.NICKEL) || name.includes('4-2-5') || name.includes('3-3-5')) {
    if (name === '4-2-5 base') {
      return FOUR_TWO_FIVE_BASE;
    }
    if (name === '4-2-5 nickel') {
      return FOUR_TWO_FIVE_NICKEL;
    }
    if (name === '3-3-5 base') {
      return THREE_THREE_FIVE_BASE;
    }
    if (name === '3-3-5 over') {
      return THREE_THREE_FIVE_OVER;
    }
    if (name === '3-3-5 nickel') {
      return THREE_THREE_FIVE_NICKEL;
    }
    return FOUR_TWO_FIVE_NICKEL;
  }

  if (name.includes(FORMATION_KEYWORDS.QUARTER) || positions.filter(p => p.startsWith(POSITION_PREFIXES.CB)).length >= 4) {
    return QUARTER;
  }

  if (name.includes(FORMATION_KEYWORDS.GOAL) && name.includes(FORMATION_KEYWORDS.LINE)) {
    return GOAL_LINE;
  }

  return FOUR_THREE_BASE;
};

export const getQBPosition = (formationType: FormationType): number => {
  switch (formationType) {
    case GUN:
    case SPREAD:
    case WING_SPLIT_BACK_GUN:
    case SPLIT_BACK_GUN:
      return GRID_POSITIONS.ROWS[7];
    case PISTOL:
      return GRID_POSITIONS.ROWS[6];
    case EMPTY:
      return GRID_POSITIONS.ROWS[7];
    case FLEXBONE_GUN:
      return GRID_POSITIONS.ROWS[6];
    case UNDER_CENTER:
    case TIGHT:
    case WING:
    case DOUBLE_WING:
    case SINGLEBACK:
    default:
      return GRID_POSITIONS.ROWS[5];
  }
};

export const getWRPositioning = (formationType: FormationType, formationName: string, wrPositions: string[]): WRPositioning => {
  const name = formationName.toLowerCase();
  const positioning: WRPositioning = {};
  let showBackup = false;
  
  switch (formationType) {

    case 'double-wing-split':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 3, col: 12 };
            break;
        }
      });
      break;


    case 'double-wing-spread':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 2, col: 1 };
            break;
          case 1:
            positioning[wr] = { row: 2, col: 13 };
            break;
          case 2:
            positioning[wr] = { row: 3, col: 2 };
            break;
          case 3:
            positioning[wr] = { row: 3, col: 12 };
            break;
        }
      });
      break;

    case 'empty':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 2, col: 1 };
            break;
          case 1:
            positioning[wr] = { row: 2, col: 12 };
            break;
          case 2:
            positioning[wr] = { row: 3, col: 2 };
            break;
          case 3:
            positioning[wr] = { row: 3, col: 11 };
            break;
        }
      });
      break;
      
    case 'spread':
    case 'gun':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 3, col: 1 };
            break;
          case 1:
            positioning[wr] = { row: 3, col: 13 };
            break;
          case 2:
            positioning[wr] = { row: 3, col: 2 };
            break;
          case 3:
            positioning[wr] = { row: 3, col: 12 };
            break;
        }
      });
      break;
      
    case 'tight':
      if (name.includes('double tight') || name.includes('heavy')) {
        wrPositions.forEach((wr, index) => {
          switch (index) {
            case 0:
              positioning[wr] = { row: 3, col: 2 };
              break;
            case 1:
              positioning[wr] = { row: 3, col: 12 };
              break;
          }
        });
      } else {
        wrPositions.forEach((wr, index) => {
          switch (index) {
            case 0:
              positioning[wr] = { row: 2, col: 1 };
              break;
            case 1:
              positioning[wr] = { row: 2, col: 13 };
              break;
          }
        });
      }
      break;
      
    case 'pistol':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 3, col: 1 };
            break;
          case 1:
            positioning[wr] = { row: 3, col: 13 };
            break;
          case 2:
            positioning[wr] = { row: 3, col: 2 };
            break;
          case 3:
            positioning[wr] = { row: 3, col: 11 };
            break;
        }
      });
      break;
      
    case 'wing':
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 2, col: 2 };
            break;
          case 1:
            positioning[wr] = { row: 2, col: 13 };
            break;
        }
      });
      break;
      
    case 'under-center':
    default:
      wrPositions.forEach((wr, index) => {
        switch (index) {
          case 0:
            positioning[wr] = { row: 2, col: 1 };
            break;
          case 1:
            positioning[wr] = { row: 2, col: 13 };
            break;
          case 2:
            positioning[wr] = { row: 4, col: 2 };
            break;
        }
      });
      break;
  }
  
  return positioning;
};

export const getTEPositioning = (_formationType: FormationType, _formationName: string, tePositions: string[]): WRPositioning => {
  const positioning: WRPositioning = {};
  
  tePositions.forEach((te, index) => {
    switch (index) {
      case 0:
        positioning[te] = { row: 2, col: 11 };
        break;
      case 1:
        positioning[te] = { row: 2, col: 4 };
        break;
      case 2:
        positioning[te] = { row: 3, col: 5 };
        break;
    }
  });
  
  return positioning;
};

export const getFormationLayout = (formation: Formation): FormationLayout => {
  const formationType = getFormationType(formation.name, formation.positions);
  const qbRow = getQBPosition(formationType);
  
  const positions: FormationPositionData[] = [
    { position: `${POSITION_PREFIXES.QB}1`, row: qbRow, col: GRID_POSITIONS.COLUMNS[7], shouldRender: true },
    { position: `${POSITION_PREFIXES.LT}1`, row: GRID_POSITIONS.ROWS[3], col: GRID_POSITIONS.COLUMNS[5], shouldRender: true },
    { position: `${POSITION_PREFIXES.LG}1`, row: GRID_POSITIONS.ROWS[3], col: GRID_POSITIONS.COLUMNS[6], shouldRender: true },
    { position: `${POSITION_PREFIXES.C}1`, row: GRID_POSITIONS.ROWS[3], col: GRID_POSITIONS.COLUMNS[7], shouldRender: true },
    { position: `${POSITION_PREFIXES.RG}1`, row: GRID_POSITIONS.ROWS[3], col: GRID_POSITIONS.COLUMNS[8], shouldRender: true },
    { position: `${POSITION_PREFIXES.RT}1`, row: GRID_POSITIONS.ROWS[3], col: GRID_POSITIONS.COLUMNS[9], shouldRender: true },
  ];
  
  const wrPositions = formation.positions.filter(p => p.startsWith(POSITION_PREFIXES.WR));
  const tePositions = formation.positions.filter(p => p.startsWith(POSITION_PREFIXES.TE));
  const rbPositions = formation.positions.filter(p => p.startsWith(POSITION_PREFIXES.RB));
  const fbPositions = formation.positions.filter(p => p.startsWith(POSITION_PREFIXES.FB));
  
  const wrPositioning = getWRPositioning(formationType, formation.name, wrPositions);

  wrPositions.forEach(wr => {
    if (wrPositioning[wr]) {
      positions.push({
        position: wr,
        row: wrPositioning[wr].row,
        col: wrPositioning[wr].col,
        empty: formationType === EMPTY ? true : false,
        shouldRender: true,
        showBackup: wr === `${POSITION_PREFIXES.WR}4` && formationType === EMPTY ? true : false,
      });
    }
  });
  
  const tePositioning = getTEPositioning(formationType, formation.name, tePositions);
  tePositions.forEach(te => {
    if (tePositioning[te]) {
      positions.push({
        position: te,
        row: tePositioning[te].row,
        col: tePositioning[te].col,
        shouldRender: true
      });
    }
  });
  
  rbPositions.forEach((rb, index) => {
    let rbRow: number = GRID_POSITIONS.ROWS[7];
    let rbCol: number = GRID_POSITIONS.COLUMNS[6];
    
    if (formationType === GUN || formationType === SPREAD) {
      rbRow = GRID_POSITIONS.ROWS[6];
    } else if (formationType === PISTOL) {
      rbRow = GRID_POSITIONS.ROWS[7];
    }
    
    if (index === 1) {
      rbCol = GRID_POSITIONS.COLUMNS[8];
    }

    if (index === 0 && formationType === DOUBLE_WING_SPLIT){
      rbCol = GRID_POSITIONS.COLUMNS[2];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 0 && formationType === DOUBLE_WING){
      rbCol = GRID_POSITIONS.COLUMNS[2];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 1 && formationType === DOUBLE_WING){
      rbCol = GRID_POSITIONS.COLUMNS[12];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 1 && formationType === DOUBLE_WING_STRONG){
      rbCol = GRID_POSITIONS.COLUMNS[12];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 1 && formationType === WING_T_DOUBLE_TIGHT){
      rbCol = GRID_POSITIONS.COLUMNS[12];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 1 && formationType === WING_T){
      rbCol = GRID_POSITIONS.COLUMNS[12];
      rbRow = GRID_POSITIONS.ROWS[3];
    }

    if (index === 1 && formationType === FLEXBONE_GUN){
      rbCol = GRID_POSITIONS.COLUMNS[7];
      rbRow = GRID_POSITIONS.ROWS[9];
    }

    if (index === 1 && formationType === WING_SPLIT_BACK_GUN){
      rbCol = GRID_POSITIONS.COLUMNS[12];
      rbRow = GRID_POSITIONS.ROWS[3];
    }
    
    positions.push({
      position: rb,
      row: rbRow,
      col: rbCol,
      shouldRender: true
    });
  });

  fbPositions.forEach(fb => {
    positions.push({
      position: fb,
      row: GRID_POSITIONS.ROWS[7],
      col: GRID_POSITIONS.COLUMNS[8],
      shouldRender: true
    });
  });
  
  return {
    qbRow,
    positions
  };
};

export const getDefensiveFormationLayout = (formation: Formation, defensiveScheme?: string): FormationLayout => {
  const formationType = getDefensiveFormationType(formation.name, formation.positions, defensiveScheme);
  
  const positions: FormationPositionData[] = [];
  const dlPositions = formation.positions.filter(p => [POSITION_PREFIXES.RE, POSITION_PREFIXES.DT, POSITION_PREFIXES.LE, POSITION_PREFIXES.DE].some(pos => p.startsWith(pos)));

  const lbPositions = formation.positions.filter(p => [POSITION_PREFIXES.LOLB, POSITION_PREFIXES.MLB, POSITION_PREFIXES.ROLB, POSITION_PREFIXES.OLB, POSITION_PREFIXES.ILB].some(pos => p.startsWith(pos)));
  const dbPositions = formation.positions.filter(p => [POSITION_PREFIXES.CB, POSITION_PREFIXES.FS, POSITION_PREFIXES.SS].some(pos => p.startsWith(pos)));
  
  switch (formationType) {
    case FOUR_THREE_BASE:
    case FOUR_THREE_OVER:
    case FOUR_THREE_UNDER:
      addLinebackerPositions(positions, lbPositions, formationType, 3, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case FOUR_THREE_LIGHT:
    case FOUR_THREE_HEAVY:
      addLinebackerPositions(positions, lbPositions, formationType, 3, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case THREE_FOUR_BASE:
    case THREE_FOUR_OVER: 
    case THREE_FOUR_UNDER:
    case THREE_FOUR_OKIE:
    case THREE_FOUR_BRONCO:
      addLinebackerPositions(positions, lbPositions, formationType, 4, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case THREE_FOUR_FOUR_HEAVY:
      addLinebackerPositions(positions, lbPositions, formationType, 4, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case FOUR_FOUR_BASE:
    case FOUR_FOUR_OVER:
    case FOUR_FOUR_UNDER:
      addLinebackerPositions(positions, lbPositions, formationType, 4, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case FOUR_FOUR_JUMBO:
    case FOUR_FOUR_HEAVY:
      addLinebackerPositions(positions, lbPositions, formationType, 4, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case FOUR_TWO_FIVE_BASE:
    case FOUR_TWO_FIVE_NICKEL:
    case THREE_FOUR_EAGLE:
      addLinebackerPositions(positions, lbPositions, formationType, 2, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case THREE_THREE_FIVE_BASE:
    case THREE_THREE_FIVE_OVER:
    case THREE_THREE_FIVE_NICKEL:
      addLinebackerPositions(positions, lbPositions, formationType, 3, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case DIME_FOUR_ONE_SIX:
    case FOUR_ONE_SIX_DIME:
    case FOUR_ONE_SIX_BIG_DIME:
      addLinebackerPositions(positions, lbPositions, formationType, 1, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
    case DIME_THREE_TWO_SIX:
    case THREE_TWO_SIX_DIME:
    case THREE_TWO_SIX_BIG_PENNY:
    case THREE_TWO_SIX_PENNY:
      addLinebackerPositions(positions, lbPositions, formationType, 2, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
      
    default:
      addLinebackerPositions(positions, lbPositions, formationType, 3, formation, defensiveScheme);
      addSecondaryPositions(positions, dbPositions, formationType);
      break;
  }
  
  return {
    qbRow: 5,
    positions
  };
};

export const getDefensiveLinePositions = (formation: Formation, defensiveScheme?: string): string[] => {
  const formationType = getDefensiveFormationType(formation.name, formation.positions, defensiveScheme);
  let dlPositions = formation.positions.filter(p => [POSITION_PREFIXES.RE, POSITION_PREFIXES.DT, POSITION_PREFIXES.LE, POSITION_PREFIXES.DE].some(pos => p.startsWith(pos)));
  
  if (formationType === FOUR_FOUR_OVER || formationType === FOUR_THREE_OVER) {
    const lolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.LOLB}1`);
    if (lolbPosition) {
      dlPositions = [lolbPosition, ...dlPositions];
    }
  } else if (formationType === FOUR_FOUR_UNDER) {
    const rolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.ROLB}1`);
    if (rolbPosition) {
      dlPositions = [...dlPositions, rolbPosition];
    }
  } else if (formationType === THREE_FOUR_BRONCO || formationType === THREE_TWO_SIX_DIME) {
    const rolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.ROLB}1`);
    if (rolbPosition) {
      dlPositions = [...dlPositions, rolbPosition];
    }
  } else if (formationType === THREE_THREE_FIVE_NICKEL) {
    const rolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.ROLB}1`);
    if (rolbPosition) {
      if (defensiveScheme === '2-Gap' && !formation.positions.includes(`${POSITION_PREFIXES.DT}1`)) {
        dlPositions = [...dlPositions, rolbPosition];
      } else if (defensiveScheme === 'Multiple' && formation.positions.includes(`${POSITION_PREFIXES.DT}1`)) {
        dlPositions = [...dlPositions, rolbPosition];
      }
    }
  } else if (formationType === THREE_THREE_FIVE_OVER || formationType === THREE_FOUR_EAGLE) {
    const lolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.LOLB}1`);
    const rolbPosition = formation.positions.find(p => p === `${POSITION_PREFIXES.ROLB}1`);
    if (lolbPosition && rolbPosition) {
      dlPositions = [lolbPosition, ...dlPositions, rolbPosition];
    }
  }
  
  if (formationType.includes('3-') && !formationType.includes('4-3')) {
    return dlPositions.sort((a, b) => {
      const order = [`${POSITION_PREFIXES.ROLB}1`, `${POSITION_PREFIXES.RE}1`, `${POSITION_PREFIXES.DT}1`, `${POSITION_PREFIXES.LE}1`, `${POSITION_PREFIXES.LOLB}1`];
      const aIndex = order.findIndex(pos => a === pos);
      const bIndex = order.findIndex(pos => b === pos);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (a.startsWith(POSITION_PREFIXES.RE)) return -1;
      if (b.startsWith(POSITION_PREFIXES.RE)) return 1;
      if (a.startsWith(POSITION_PREFIXES.DT)) return b.startsWith(POSITION_PREFIXES.LE) ? -1 : 0;
      if (b.startsWith(POSITION_PREFIXES.DT)) return a.startsWith(POSITION_PREFIXES.LE) ? 1 : 0;
      return 0;
    });
  } else {
    return dlPositions.sort((a, b) => {
      const order = [`${POSITION_PREFIXES.ROLB}1`, `${POSITION_PREFIXES.RE}1`, `${POSITION_PREFIXES.DT}1`, `${POSITION_PREFIXES.DT}2`, `${POSITION_PREFIXES.LE}1`, `${POSITION_PREFIXES.LOLB}1`];
      const aIndex = order.findIndex(pos => a === pos);
      const bIndex = order.findIndex(pos => b === pos);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (a.startsWith(POSITION_PREFIXES.RE)) return -1;
      if (b.startsWith(POSITION_PREFIXES.RE)) return 1;
      if (a.startsWith(POSITION_PREFIXES.LE)) return 1;
      if (b.startsWith(POSITION_PREFIXES.LE)) return -1;
      if (a.startsWith(POSITION_PREFIXES.DT) && b.startsWith(POSITION_PREFIXES.DT)) {
        const aNum = parseInt(a.match(/\d+$/)?.[0] || '1');
        const bNum = parseInt(b.match(/\d+$/)?.[0] || '1');
        return aNum - bNum;
      }
      return 0;
    });
  }
};

const addLinebackerPositions = (positions: FormationPositionData[], lbPositions: string[], formationType: DefensiveFormationType, expectedCount: number, formation?: Formation, defensiveScheme?: string) => {
  const lbRow = 7;
  
  let filteredLbPositions = lbPositions;
  if (formationType === FOUR_FOUR_OVER || formationType === FOUR_THREE_OVER || formationType === THREE_THREE_FIVE_OVER || formationType === THREE_FOUR_EAGLE) {
    filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.LOLB}1`);
  }
  if (formationType === FOUR_FOUR_UNDER || formationType === THREE_FOUR_BRONCO) {
    filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.ROLB}1`);
  }
  if (formationType === THREE_THREE_FIVE_NICKEL && formation) {
    if (defensiveScheme === '2-Gap' && !formation.positions.includes(`${POSITION_PREFIXES.DT}1`)) {
      filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.ROLB}1`);
    } else if (defensiveScheme === 'Multiple' && formation.positions.includes(`${POSITION_PREFIXES.DT}1`)) {
      filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.ROLB}1` && p !== `${POSITION_PREFIXES.LOLB}1`);
    }
  }
  if (formationType === THREE_TWO_SIX_DIME) {
    filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.ROLB}1`);
  }
  if (formationType === THREE_FOUR_EAGLE) {
    filteredLbPositions = lbPositions.filter(p => p !== `${POSITION_PREFIXES.ROLB}1` && p !== `${POSITION_PREFIXES.LOLB}1`);
  }
  
  switch (expectedCount) {
    case 4:
      filteredLbPositions.forEach((position) => {
        let col;
        
        if (position.startsWith(POSITION_PREFIXES.ROLB)) {
          col = 5;
        } else if (position.startsWith(POSITION_PREFIXES.LOLB)) {
          col = 9;
        } else if (position.startsWith(POSITION_PREFIXES.MLB)) {
          const mlbNumber = parseInt(position.match(/\d+$/)?.[0] || '1');
          col = mlbNumber === 1 ? 7 : 6;
        }
        
        if (col) {
          positions.push({
            position,
            row: lbRow,
            col,
            shouldRender: true,
            showBackup: true
          });
        }
      });
      break;
      
    case 3:
      filteredLbPositions.forEach((position) => {
        let col;
        
        if (position.startsWith(POSITION_PREFIXES.ROLB)) {
          col = 5;
        } else if (position.startsWith(POSITION_PREFIXES.MLB)) {
          const mlbNumber = parseInt(position.match(/\d+$/)?.[0] || '1');
          col = mlbNumber === 1 ? 7 : 6;
        } else if (position.startsWith(POSITION_PREFIXES.LOLB)) {
          col = 9;
        }
        
        if (col) {
          positions.push({
            position,
            row: lbRow,
            col,
            shouldRender: true,
            showBackup: true
          });
        }
      });
      break;
      
    case 2:
      filteredLbPositions.forEach((position) => {
        let col;

        if (position.startsWith(POSITION_PREFIXES.MLB)) {
          const mlbNumber = parseInt(position.match(/\d+$/)?.[0] || '1');
          col = mlbNumber === 1 ? 7 : 6;
        } else if (position.startsWith(POSITION_PREFIXES.ROLB)) {
          col = 5;
        } else if (position.startsWith(POSITION_PREFIXES.LOLB)) {
          col = 9;
        }
        
        if (col) {
          positions.push({
            position,
            row: lbRow,
            col,
            shouldRender: true,
            showBackup: true
          });
        }
      });
      break;
      
    case 1:
      if (lbPositions.length > 0) {
        positions.push({
          position: lbPositions[0],
          row: lbRow,
          col: 7,
          shouldRender: true,
          showBackup: true
        });
      }
      break;
  }
};

const addSecondaryPositions = (positions: FormationPositionData[], dbPositions: string[], formationType: DefensiveFormationType) => {
  const cbPositions = dbPositions.filter(p => p.startsWith(POSITION_PREFIXES.CB));
  const safetyPositions = dbPositions.filter(p => p.startsWith(POSITION_PREFIXES.FS) || p.startsWith(POSITION_PREFIXES.SS));
  
  cbPositions.forEach((position, index) => {
    let row = 5;
    let col;
    
    const cbNumber = parseInt(position.match(/\d+$/)?.[0] || (index + 1).toString());
    
    switch (cbNumber) {
      case 1:
        col = 1;
        row = 7;
        break;
      case 2:
        col = 13;
        row = 7; 
        break;
      case 3:
        row = 5;
        col = 4;
        break;
      case 4:
        row = 5;
        col = 11;
        break;
      case 5:
        row = 3;
        col = 7;
        break;
      default:
        col = index <= 1 ? (index === 0 ? 1 : 13) : 7;
        break;
    }
    
    positions.push({
      position,
      row,
      col,
      shouldRender: true,
      showBackup: true
    });
  });
  
  safetyPositions.forEach((position) => {
    let row = 3;
    let col;
    
    if (formationType === FOUR_THREE_HEAVY && position === `${POSITION_PREFIXES.SS}2`) {
      row = 7;
      col = 3;
    } else if (formationType === FOUR_FOUR_JUMBO && (position === `${POSITION_PREFIXES.SS}1` || position === `${POSITION_PREFIXES.SS}2`)) {
      row = 7;
      col = position === `${POSITION_PREFIXES.SS}1` ? 8 : 9;
    } else if (formationType === FOUR_FOUR_JUMBO && (position === `${POSITION_PREFIXES.FS}1`)) {
      col = 7;
    } else if (formationType === THREE_FOUR_FOUR_HEAVY && position === `${POSITION_PREFIXES.SS}1`) {
      row = 7;
      col = 3;
    } else if (formationType === FOUR_FOUR_HEAVY && position === `${POSITION_PREFIXES.SS}1`) {
      row = 7;
      col = 3;
    } else {
      if (position.startsWith(POSITION_PREFIXES.FS) && formationType !== FOUR_FOUR_JUMBO) {
        col = 5;
      } else if (position.startsWith(POSITION_PREFIXES.SS)) {
        const ssNumber = parseInt(position.match(/\d+$/)?.[0] || '1');
        if (ssNumber === 1) {
          col = 9;
        } else {
          col = 7;
        }
      } else {
        col = 7;
      }
    }
    
    positions.push({
      position,
      row,
      col,
      shouldRender: true,
      showBackup: true
    });
  });
};

export const shouldRenderPosition = (position: string, formation: Formation | null, formationType: string): boolean => {
  if (formationType === 'defense' || formationType === 'specialteams' || !formation) {
    return true; 
  }
  
  const basePosition = position.replace(/\d+$/, '');
  if ([POSITION_PREFIXES.QB, POSITION_PREFIXES.LT, POSITION_PREFIXES.LG, POSITION_PREFIXES.C, POSITION_PREFIXES.RG, POSITION_PREFIXES.RT].includes(basePosition as any)) {
    return true;
  }
  
  return formation.positions.includes(position);
};