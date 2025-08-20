export interface Formation {
  name: string;
  positions: string[];
}

export interface PlayTypeRange {
  Min: number;
  Max: number;
}

export interface SchemeRanges {
  TraditionalRun: PlayTypeRange;
  OptionRun: PlayTypeRange;
  RPO: PlayTypeRange;
  Pass: PlayTypeRange;
}

export interface SchemeData {
  Formations: Formation[];
  SchemeFits: string[];
  BadFits: string[];
  Ranges: SchemeRanges;
  Notes: string;
  Strengths?: string[];
  Weaknesses?: string[];
}

export const FormationMap: Record<string, SchemeData> = {
  'Power Run': {
    Formations: [
      {
        name: 'I Formation',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Singleback',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Double Tight',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'I Formation Heavy',
        positions: ['RB1', 'FB1', 'TE1', 'TE2', 'WR1']
      },
      {
        name: 'Split Back Gun',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      }
    ],
    SchemeFits: [
      'Power RB',
      'Blocking FB',
      'Blocking TE',
      'Red Zone Threat WR',
      'Run Blocking OL'
    ],
    BadFits: [
      'Speed RB',
      'Receiving RB',
      'Receiving FB',
      'Receiving TE',
      'Vertical Threat TE',
      'Pass Blocking OL'
    ],
    Ranges: {
      TraditionalRun: { Min: 40, Max: 80 },
      OptionRun: { Min: 0, Max: 5 },
      RPO: { Min: 0, Max: 10 },
      Pass: { Min: 20, Max: 60 }
    },
    Notes: 'This scheme centers around using the run to set up the pass. Most run-heavy pro scheme, but still a good amount of passing will be available.'
  },
  'Vertical': {
    Formations: [
      {
        name: 'I Formation',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Singleback',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Double Tight',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Spread Gun',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      }
    ],
    SchemeFits: [
      'Pocket QB',
      'Receiving RB',
      'Receiving TE',
      'Vertical Threat TE',
      'Speed WR',
      'Route Runner WR',
      'Pass Blocking OL'
    ],
    BadFits: [
      'Balanced QB',
      'Scrambler QB',
      'Field General QB',
      'Power RB',
      'Blocking FB',
      'Rushing FB',
      'Blocking TE',
      'Red Zone Threat WR',
      'Run Blocking OL'
    ],
    Ranges: {
      TraditionalRun: { Min: 40, Max: 80 },
      OptionRun: { Min: 0, Max: 5 },
      RPO: { Min: 0, Max: 10 },
      Pass: { Min: 20, Max: 60 }
    },
    Notes: 'This scheme centers on the long pass, but still allows for quite a bit of running.'
  },
  'West Coast': {
    Formations: [
      {
        name: 'Near/Far',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Singleback',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Spread',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Split Back Gun',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      }
    ],
    SchemeFits: [
      'Field General QB',
      'Balanced FB',
      'Receiving FB',
      'Receiving TE',
      'Possession WR',
      'Route Runner WR',
      'Line Captain C'
    ],
    BadFits: ['Blocking FB', 'Red Zone Threat WR'],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 60 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 30 },
      Pass: { Min: 40, Max: 80 }
    },
    Notes: 'This scheme centers on the short pass, but still allows for a bit of running.'
  },
  'I Option': {
    Formations: [
      {
        name: 'I Formation',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Singleback',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Double Tight',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Split Back Gun',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      }
    ],
    SchemeFits: [
      'Scrambler QB',
      'Power RB',
      'Rushing FB',
      'Blocking TE',
      'Possession WR'
    ],
    BadFits: [
      'Pocket QB',
      'Speed RB',
      'Receiving RB',
      'Receiving FB',
      'Receiving TE',
      'Vertical TE'
    ],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 80 },
      OptionRun: { Min: 20, Max: 80 },
      RPO: { Min: 0, Max: 10 },
      Pass: { Min: 20, Max: 60 }
    },
    Notes: 'This scheme offers up the ability to run a lot more option-type plays, but still is mainly balanced in run vs. pass.'
  },
  'Run and Shoot': {
    Formations: [
      {
        name: 'Spread',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Singleback',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Spread Gun',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Empty Gun',
        positions: ['WR1', 'WR2', 'WR3', 'WR4', 'WR5']
      }
    ],
    SchemeFits: [
      'Field General QB',
      'Speed RB',
      'Receiving RB',
      'Speed WR',
      'Line Captain C'
    ],
    BadFits: [
      'Balanced RB',
      'Power RB',
      'Blocking FB',
      'Rushing FB',
      'Blocking TE',
      'Possession WR'
    ],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 60 },
      OptionRun: { Min: 0, Max: 5 },
      RPO: { Min: 5, Max: 30 },
      Pass: { Min: 40, Max: 80 }
    },
    Notes: 'This scheme focuses on short passes and passes far more often than it runs.'
  },
  'Air Raid': {
    Formations: [
      {
        name: 'Spread Gun',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Empty Gun',
        positions: ['WR1', 'WR2', 'WR3', 'WR4', 'WR5']
      },
      {
        name: 'Big Spread Gun',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'Pony Spread Gun',
        positions: ['RB1', 'RB2', 'WR1', 'WR2', 'WR3']
      }
    ],
    SchemeFits: [
      'Pocket QB',
      'Receiving RB',
      'Receiving FB',
      'Receiving TE',
      'Vertical Threat TE',
      'Speed WR',
      'Pass Blocking OL'
    ],
    BadFits: [
      'Balanced QB',
      'Scrambler QB',
      'Field General QB',
      'Power RB',
      'Blocking FB',
      'Rushing FB',
      'Blocking TE',
      'Run Blocking OL'
    ],
    Ranges: {
      TraditionalRun: { Min: 5, Max: 40 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 20 },
      Pass: { Min: 40, Max: 80 }
    },
    Notes: 'This scheme focuses on long passes and passes far more often than it runs.'
  },
  'Pistol': {
    Formations: [
      {
        name: 'Pistol',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Power Pistol',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Heavy Power Pistol',
        positions: ['RB1', 'FB1', 'TE1', 'TE2', 'WR1']
      },
      {
        name: 'Big Pistol',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'Spread Pistol',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      }
    ],
    SchemeFits: [
      'Balanced QB',
      'Pocket QB',
      'Balanced RB',
      'Rushing FB',
      'Vertical TE',
      'Route Runner WR',
      'Possession WR'
    ],
    BadFits: ['Balanced FB', 'Line Captain C'],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 60 },
      OptionRun: { Min: 0, Max: 40 },
      RPO: { Min: 0, Max: 40 },
      Pass: { Min: 20, Max: 60 }
    },
    Notes: 'This scheme is the most balanced of the spread offenses and has limited access to option-type plays.'
  },
  'Spread Option': {
    Formations: [
      {
        name: 'Spread Gun',
        positions: ['RB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Singleback Gun',
        positions: ['RB1', 'TE1', 'WR1', 'WR2', 'WR3']
      },
      {
        name: 'Split Back Gun',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Big Spread Gun',
        positions: ['RB1', 'TE1', 'TE2', 'WR1', 'WR2']
      },
      {
        name: 'Pony Spread Gun',
        positions: ['RB1', 'RB2', 'WR1', 'WR2', 'WR3']
      }
    ],
    SchemeFits: [
      'Scrambler QB',
      'Speed RB',
      'Receiving FB',
      'Route Runner WR',
      'Possession WR'
    ],
    BadFits: ['Balanced RB', 'Balanced FB'],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 60 },
      OptionRun: { Min: 10, Max: 60 },
      RPO: { Min: 0, Max: 60 },
      Pass: { Min: 20, Max: 60 }
    },
    Notes: 'This scheme offers up the ability to run a lot more option-type plays, but focuses on pass plays still.'
  },
  'Wing-T': {
    Formations: [
      {
        name: 'Wing-T',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'WR1']
      },
      {
        name: 'T-Split',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Wing-T Double Tight',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'TE2']
      },
      {
        name: 'Split Back Gun',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      },
      {
        name: 'Wing Split Back Gun',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'WR1']
      }
    ],
    SchemeFits: ['Balanced QB', 'Balanced RB', 'Balanced FB', 'Speed WR'],
    BadFits: ['None'],
    Ranges: {
      TraditionalRun: { Min: 40, Max: 80 },
      OptionRun: { Min: 0, Max: 60 },
      RPO: { Min: 0, Max: 10 },
      Pass: { Min: 20, Max: 40 }
    },
    Notes: 'This scheme has the most balanced approach (run vs. pass) of the smashmouth scheme group.'
  },
  'Double Wing': {
    Formations: [
      {
        name: 'Double Wing',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'TE2']
      },
      {
        name: 'Double Wing Strong',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'WR1']
      },
      {
        name: 'Double Wing Wide',
        positions: ['RB1', 'RB2', 'FB1', 'WR1', 'WR2']
      },
      {
        name: 'Double Wing Spread',
        positions: ['FB1', 'WR1', 'WR2', 'WR3', 'WR4']
      },
      {
        name: 'Double Wing Split',
        positions: ['RB1', 'FB1', 'TE1', 'TE2', 'WR1']
      }
    ],
    SchemeFits: [
      'Power RB',
      'Blocking FB',
      'Rushing FB',
      'Blocking TE',
      'Red Zone Threat WR',
      'Run Blocking OL'
    ],
    BadFits: [
      'Pocket QB',
      'Speed RB',
      'Receiving RB',
      'Receiving FB',
      'Receiving TE',
      'Vertical TE',
      'Pass Blocking OL'
    ],
    Ranges: {
      TraditionalRun: { Min: 40, Max: 90 },
      OptionRun: { Min: 10, Max: 40 },
      RPO: { Min: 0, Max: 10 },
      Pass: { Min: 0, Max: 20 }
    },
    Notes: 'This scheme has barely any access to pass plays.'
  },
  'Wishbone': {
    Formations: [
      {
        name: 'Wishbone',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'TE2']
      },
      {
        name: 'Wishbone Strong',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'WR1']
      },
      {
        name: 'Wishbone Wide',
        positions: ['RB1', 'RB2', 'FB1', 'WR1', 'WR2']
      },
      {
        name: 'I Formation Heavy',
        positions: ['RB1', 'FB1', 'TE1', 'TE2', 'WR1']
      },
      {
        name: 'I Formation',
        positions: ['RB1', 'FB1', 'TE1', 'WR1', 'WR2']
      }
    ],
    SchemeFits: [
      'Balanced QB',
      'Field General QB',
      'Balanced RB',
      'Red Zone Threat WR'
    ],
    BadFits: ['Balanced FB', 'Route Runner WR', 'Line Captain C'],
    Ranges: {
      TraditionalRun: { Min: 40, Max: 80 },
      OptionRun: { Min: 20, Max: 60 },
      RPO: { Min: 0, Max: 20 },
      Pass: { Min: 20, Max: 40 }
    },
    Notes: 'This scheme is also fairly balanced (run vs. pass) like the Wing-T, but it does not have access to any shotgun formations.'
  },
  'Flexbone': {
    Formations: [
      {
        name: 'Flexbone',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'TE2']
      },
      {
        name: 'Flexbone Strong',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'WR1']
      },
      {
        name: 'Flexbone Wide',
        positions: ['RB1', 'RB2', 'FB1', 'WR1', 'WR2']
      },
      {
        name: 'Flexbone Gun',
        positions: ['RB1', 'RB2', 'FB1', 'TE1', 'TE2']
      },
      {
        name: 'Flexbone Gun Wide',
        positions: ['RB1', 'RB2', 'FB1', 'WR1', 'WR2']
      }
    ],
    SchemeFits: [
      'Scrambler QB',
      'Speed RB',
      'Balanced FB',
      'Red Zone Threat WR'
    ],
    BadFits: ['Balanced RB', 'Speed WR', 'Possession WR'],
    Ranges: {
      TraditionalRun: { Min: 20, Max: 80 },
      OptionRun: { Min: 20, Max: 80 },
      RPO: { Min: 0, Max: 5 },
      Pass: { Min: 10, Max: 40 }
    },
    Notes: 'This scheme offers up the ability to run a lot more option-type plays, but is almost entirely run-focused.'
  },
  'Old School': {
    Formations: [
      {
        name: '4-4 Base',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1'
        ]
      },
      {
        name: '4-4 Over',
        positions: [
          'LOLB1',
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'MLB2',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1'
        ]
      },
      {
        name: '4-4 Under',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          'ROLB1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'FS1'
        ]
      },
      {
        name: '4-3 Light',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-2-5 Nickel',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      }
    ],
    SchemeFits: [
      'Run Stopper DE',
      'Run Stopper OLB',
      'Field General ILB',
      'Run Stopper ILB'
    ],
    BadFits: ['Nose Tackle DT', 'Coverage OLB', 'Coverage ILB'],
    Strengths: ['Flexbone', 'Wishbone'],
    Weaknesses: ['Vertical', 'West Coast'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'Strong against run-heavy schemes but weak against pass-focused offenses.'
  },
  '2-Gap': {
    Formations: [
      {
        name: '3-4 Okie',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-4 Bronco',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          'ROLB1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-4 Eagle',
        positions: [
          'LOLB1',
          'LE1',
          'DT1',
          'RE1',
          'ROLB1',
          '\n',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-3-5 Nickel',
        positions: [
          'LE1',
          'RE1',
          'ROLB1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-2-6 Dime',
        positions: [
          'LE1',
          'RE1',
          'ROLB1',
          '\n',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'CB4',
          'FS1',
          'SS1'
        ]
      }
    ],
    SchemeFits: [
      'Run Stopper DE',
      'Nose Tackle DT',
      'Pass Rush OLB',
      'Run Stopper OLB',
      'Run Stopper ILB'
    ],
    BadFits: [
      'Speed Rusher DE',
      'Pass Rusher DT',
      'Speed OLB',
      'Speed ILB'
    ],
    Strengths: ['Wing-T', 'Double Wing'],
    Weaknesses: ['Spread Option', 'Pistol'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'Excellent against power run schemes but struggles with spread offenses.'
  },
  '4-Man Front Spread Stopper': {
    Formations: [
      {
        name: '4-2-5 Base',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-1-6 Dime',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'CB4',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-1-6 Big Dime',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          '\n',
          'CB1',
          'CB2',
          'CB4',
          'FS1',
          'SS1',
          'SS2'
        ]
      },
      {
        name: '4-3 Heavy',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'SS2',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-4 Jumbo',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'SS1',
          'SS2',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1'
        ]
      }
    ],
    SchemeFits: [
      'Speed Rusher DE',
      'Pass Rusher DT',
      'Coverage OLB',
      'Coverage ILB'
    ],
    BadFits: [
      'Nose Tackle DT',
      'Run Stopper DE',
      'Run Stopper OLB',
      'Run Stopper ILB',
      'Run Stopper FS',
      'Run Stopper SS'
    ],
    Strengths: ['Air Raid', 'Pistol'],
    Weaknesses: ['Flexbone', 'Wishbone'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'Designed to stop spread offenses but vulnerable to traditional running games.'
  },
  '3-Man Front Spread Stopper': {
    Formations: [
      {
        name: '3-3-5 Base',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-3-5 Over',
        positions: [
          'LOLB1',
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-2-6 Big Penny',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1',
          'SS2'
        ]
      },
      {
        name: '3-2-6 Penny',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'CB4',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-4-4 Heavy',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          '\n',
          'SS1',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1'
        ]
      }
    ],
    SchemeFits: ['Nose Tackle DT', 'Pass Rush OLB', 'Coverage ILB'],
    BadFits: [
      'Run Stopper DE',
      'Run Stopper OLB',
      'Run Stopper ILB',
      'Run Stopper FS',
      'Run Stopper SS',
      'Speed OLB',
      'Speed ILB',
      'Field General ILB'
    ],
    Strengths: ['Run and Shoot', 'Spread Option'],
    Weaknesses: ['Power Run', 'I-Option'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'Specialized to counter spread offenses but vulnerable to traditional power running.'
  },
  'Speed': {
    Formations: [
      {
        name: '4-3 Base',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-3 Over',
        positions: [
          'LOLB1',
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-2-5 Nickel',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-1-6 Dime',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1',
          'SS2'
        ]
      },
      {
        name: '4-4 Heavy',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'SS1',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1'
        ]
      }
    ],
    SchemeFits: [
      'Speed Rusher DE',
      'Pass Rusher DT',
      'Speed OLB',
      'Coverage OLB',
      'Speed ILB'
    ],
    BadFits: [
      'Run Stopper DE',
      'Nose Tackle DT',
      'Pass Rush OLB',
      'Field General ILB'
    ],
    Strengths: ['Vertical', 'West Coast'],
    Weaknesses: ['Wing-T', 'Double Wing'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'High-speed defense that excels against passing attacks but vulnerable to power running.'
  },
  'Multiple': {
    Formations: [
      {
        name: '4-3 Base',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'LOLB1',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-3 Over',
        positions: [
          'LOLB1',
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-4 Bronco',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          'ROLB1',
          '\n',
          'LOLB1',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '3-3-5 Nickel',
        positions: [
          'LE1',
          'DT1',
          'RE1',
          'ROLB1',
          '\n',
          'MLB1',
          'MLB2',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      },
      {
        name: '4-2-5 Nickel',
        positions: [
          'LE1',
          'DT1',
          'DT2',
          'RE1',
          '\n',
          'MLB1',
          'ROLB1',
          '\n',
          'CB1',
          'CB2',
          'CB3',
          'FS1',
          'SS1'
        ]
      }
    ],
    SchemeFits: [
      'Run Stopper DE',
      'Speed OLB',
      'Speed ILB',
      'Field General ILB',
      'Run Stopper DB'
    ],
    BadFits: [
      'Speed Rusher DE',
      'Pass Rusher DT',
      'Coverage OLB',
      'Coverage ILB'
    ],
    Strengths: ['Power Run', 'I-Option'],
    Weaknesses: ['Run and Shoot', 'Air Raid'],
    Ranges: {
      TraditionalRun: { Min: 0, Max: 0 },
      OptionRun: { Min: 0, Max: 0 },
      RPO: { Min: 0, Max: 0 },
      Pass: { Min: 0, Max: 0 }
    },
    Notes: 'Versatile defensive scheme that adapts well to different offensive approaches.'
  }
};

export const OffensiveSchemeOptions = [
  'Power Run',
  'Vertical',
  'West Coast',
  'I Option',
  'Run and Shoot',
  'Air Raid',
  'Pistol',
  'Spread Option',
  'Wing-T',
  'Double Wing',
  'Wishbone',
  'Flexbone'
];

export const DefensiveSchemeOptions = [
  'Old School',
  '2-Gap',
  '4-Man Front Spread Stopper',
  '3-Man Front Spread Stopper',
  'Speed',
  'Multiple'
];

export const RunPlayLabels = [
  'OutsideLeft',
  'OutsideRight',
  'InsideLeft',
  'InsideRight',
  'PowerLeft',
  'PowerRight',
  'DrawLeft',
  'DrawRight'
];

export const OptionPlayLabels = [
  'ReadOptionLeft',
  'ReadOptionRight',
  'SpeedOptionLeft',
  'SpeedOptionRight',
  'InvertedOptionLeft',
  'InvertedOptionRight',
  'TripleOptionLeft',
  'TripleOptionRight'
];

export const PassPlayLabels = [
  'Quick',
  'Short',
  'Long',
  'Screen',
  'PAShort',
  'PALong'
];

export const RPOLabels = [
  'ChoiceOutside',
  'ChoiceInside',
  'ChoicePower',
  'PeekOutside',
  'PeekInside',
  'PeekPower'
];

export const TargetingLabels = [
  'WR1',
  'WR2',
  'WR3',
  'WR4',
  'WR5',
  'TE1',
  'TE2',
  'TE3',
  'RB1',
  'RB2',
  'FB1'
];

export const RunnerDistributionLabels = ['QB', 'RB1', 'RB2', 'RB3', 'FB1', 'FB2', 'WR'];
export const TargetDepthOptions = ['Quick', 'Short', 'Long', 'None'];
export const CoverageOptions = ['Man', 'Zone'];

export const BlitzAggressivenessOptions = [
  'Cautious',
  'Moderate',
  'Aggressive'
];

export const FocusPlayOptions = [
  'Outside Run',
  'Inside Run',
  'Power Run',
  'Draw',
  'Read Option',
  'Speed Option',
  'Inverted Option',
  'Triple Option',
  'RPO Choice',
  'RPO Peek',
  'Quick Pass',
  'Short Pass',
  'Long Pass',
  'Screen Pass',
  'Play Action Short',
  'Play Action Long'
];

export const SchemeDropdownClass = 'btn btn-outline-secondary dropdown-toggle w-full';
export const SpecialTeamsOptions = {
  MaxFieldGoalDistance: { Min: 15, Max: 85, Default: 45 },
  GoFor4AndShort: { Min: 0, Max: 85, Default: 20 },
  GoFor4AndLong: { Min: 0, Max: 85, Default: 5 }
};

export const SpecialTeamsLabels = {
  MaximumFGDistance: 'Maximum Field Goal Distance',
  GoFor4AndShort: 'Go For It on 4th and Short',
  GoFor4AndLong: 'Go For It on 4th and Long'
};

export type GameplanTab = 'Offensive Formations' | 'Offensive Distributions' | 'Defense' | 'Special Teams';

export const GameplanTabs: GameplanTab[] = [
  'Offensive Formations',
  'Offensive Distributions', 
  'Defense',
  'Special Teams'
];