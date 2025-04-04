interface Attribute {
    mean: number;
    stddev: number;
  }
  
 export interface PositionAttributes {
    [position: string]: Attribute;
  }
  
  export interface Attributes {
    Speed: PositionAttributes;
    FootballIQ: PositionAttributes;
    Agility: PositionAttributes;
    Carrying: PositionAttributes;
    Catching: PositionAttributes;
    RouteRunning: PositionAttributes;
    ZoneCoverage: PositionAttributes;
    ManCoverage: PositionAttributes;
    Strength: PositionAttributes;
    Tackle: PositionAttributes;
    PassBlock: PositionAttributes;
    RunBlock: PositionAttributes;
    PassRush: PositionAttributes;
    RunDefense: PositionAttributes;
    ThrowPower: PositionAttributes;
    ThrowAccuracy: PositionAttributes;
    KickAccuracy: PositionAttributes;
    KickPower: PositionAttributes;
    PuntAccuracy: PositionAttributes;
    PuntPower: PositionAttributes;
    Stamina: PositionAttributes;
    Injury: PositionAttributes;
  }
  
  export const attributeAverages: Attributes = {
    Speed: {
        C: { mean: 21, stddev: 3 },
        CB: { mean: 50, stddev: 7.43 },
        DE: { mean: 42, stddev: 7.12 },
        DT: { mean: 29, stddev: 5.89 },
        FB: { mean: 40, stddev: 8.95 },
        FS: { mean: 50, stddev: 7.32 },
        ILB: { mean: 47, stddev: 8.17 },
        K: { mean: 13, stddev: 5.13 },
        OG: { mean: 21, stddev: 3 },
        OLB: { mean: 47, stddev: 10.68 },
        OT: { mean: 21, stddev: 3 },
        P: { mean: 13, stddev: 5.43 },
        QB: { mean: 47, stddev: 16.98 },
        RB: { mean: 61, stddev: 7.54 },
        SS: { mean: 50, stddev: 7.23 },
        TE: { mean: 47, stddev: 9.49 },
        WR: { mean: 55, stddev: 10.04 },
        ATH: { mean: 40, stddev: 10 }
      },
      FootballIQ: {
        C: { mean: 27, stddev: 10.93 },
        CB: { mean: 24, stddev: 6.65 },
        DE: { mean: 25, stddev: 6.25 },
        DT: { mean: 24, stddev: 6.63 },
        FB: { mean: 24, stddev: 6.11 },
        FS: { mean: 26, stddev: 7.45 },
        ILB: { mean: 29, stddev: 9.94 },
        K: { mean: 23, stddev: 6.22 },
        OG: { mean: 24, stddev: 6.37 },
        OLB: { mean: 24, stddev: 6.53 },
        OT: { mean: 25, stddev: 6.34 },
        P: { mean: 23, stddev: 6.38 },
        QB: { mean: 30, stddev: 9.77 },
        RB: { mean: 25, stddev: 6.01 },
        SS: { mean: 27, stddev: 8.0 },
        TE: { mean: 24, stddev: 6.48 },
        WR: { mean: 24, stddev: 7.08 },
        ATH: { mean: 30, stddev: 8 }
      },
      Agility: {
        C: { mean: 18, stddev: 6.83 },
        CB: { mean: 39, stddev: 7.17 },
        DE: { mean: 34, stddev: 7.87 },
        DT: { mean: 29, stddev: 7.86 },
        FB: { mean: 27, stddev: 8.48 },
        FS: { mean: 39, stddev: 7.02 },
        ILB: { mean: 34, stddev: 7.82 },
        K: { mean: 14, stddev: 5.19 },
        OG: { mean: 18, stddev: 6.54 },
        OLB: { mean: 35, stddev: 7.91 },
        OT: { mean: 19, stddev: 6.89 },
        P: { mean: 14, stddev: 5.19 },
        QB: { mean: 23, stddev: 9.84 },
        RB: { mean: 33, stddev: 8.14 },
        SS: { mean: 33, stddev: 6.44 },
        TE: { mean: 33, stddev: 7.31 },
        WR: { mean: 35, stddev: 7.87 },
        ATH: { mean: 35, stddev: 8 }
      },
      Carrying: {
        C: { mean: 13, stddev: 5.19 },
        CB: { mean: 14, stddev: 5.02 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 19, stddev: 6.82 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 20, stddev: 9.55 },
        RB: { mean: 26, stddev: 7.5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 23, stddev: 6.38 },
        WR: { mean: 23, stddev: 7.14 },
        ATH: { mean: 25, stddev: 7 }
      },
      Catching: {
        C: { mean: 15, stddev: 5 },
        CB: { mean: 18, stddev: 10.07 },
        DE: { mean: 15, stddev: 5 },
        DT: { mean: 15, stddev: 5 },
        FB: { mean: 22, stddev: 8.06 },
        FS: { mean: 19, stddev: 10.39 },
        ILB: { mean: 16, stddev: 6.08 },
        K: { mean: 15, stddev: 5 },
        OG: { mean: 15, stddev: 5 },
        OLB: { mean: 15, stddev: 5.47 },
        OT: { mean: 15, stddev: 5 },
        P: { mean: 15, stddev: 5 },
        QB: { mean: 14, stddev: 4.77 },
        RB: { mean: 26, stddev: 9.62 },
        SS: { mean: 18, stddev: 10.2 },
        TE: { mean: 33, stddev: 7.45 },
        WR: { mean: 38, stddev: 9.06 },
        ATH: { mean: 20, stddev: 7 }
      },
      RouteRunning: {
        C: { mean: 15, stddev: 5 },
        CB: { mean: 10, stddev: 5.91 },
        DE: { mean: 15, stddev: 5 },
        DT: { mean: 15, stddev: 5 },
        FB: { mean: 8, stddev: 5.6 },
        FS: { mean: 15, stddev: 5 },
        ILB: { mean: 15, stddev: 5 },
        K: { mean: 15, stddev: 5 },
        OG: { mean: 15, stddev: 5 },
        OLB: { mean: 15, stddev: 5 },
        OT: { mean: 15, stddev: 5 },
        P: { mean: 15, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 12, stddev: 4.89 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 21, stddev: 7.7 },
        WR: { mean: 31, stddev: 8 },
        ATH: { mean: 20, stddev: 6 }
    },
    ZoneCoverage: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 39, stddev: 10.33 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 38, stddev: 10.27 },
        ILB: { mean: 36, stddev: 8.5 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 30, stddev: 9.41 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 37, stddev: 9.99 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    ManCoverage: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 39, stddev: 10.86 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 35, stddev: 9.07 },
        ILB: { mean: 33, stddev: 8.32 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 30, stddev: 9.28 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 35, stddev: 9.35 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    Strength: {
        C: { mean: 49, stddev: 7.54 },
        CB: { mean: 14, stddev: 5.2 },
        DE: { mean: 36, stddev: 7.28 },
        DT: { mean: 39, stddev: 9.09 },
        FB: { mean: 44, stddev: 7.04 },
        FS: { mean: 17, stddev: 8.05 },
        ILB: { mean: 36, stddev: 8.59 },
        K: { mean: 6, stddev: 3.44 },
        OG: { mean: 50, stddev: 7.07 },
        OLB: { mean: 34, stddev: 9.05 },
        OT: { mean: 50, stddev: 7.06 },
        P: { mean: 6, stddev: 3.45 },
        QB: { mean: 23, stddev: 7.59 },
        RB: { mean: 24, stddev: 6.85 },
        SS: { mean: 18, stddev: 7.9 },
        TE: { mean: 44, stddev: 7.92 },
        WR: { mean: 23, stddev: 9.46 },
        ATH: { mean: 30, stddev: 8 }
    },
    Tackle: {
        C: { mean: 12, stddev: 5 },
        CB: { mean: 17, stddev: 5.32 },
        DE: { mean: 37, stddev: 7.09 },
        DT: { mean: 39, stddev: 7.2 },
        FB: { mean: 13, stddev: 6 },
        FS: { mean: 25, stddev: 8.36 },
        ILB: { mean: 36, stddev: 7.78 },
        K: { mean: 6, stddev: 3 },
        OG: { mean: 12, stddev: 5 },
        OLB: { mean: 39, stddev: 6.99 },
        OT: { mean: 12, stddev: 5 },
        P: { mean: 6, stddev: 3 },
        QB: { mean: 13, stddev: 5 },
        RB: { mean: 13, stddev: 5 },
        SS: { mean: 25, stddev: 8.03 },
        TE: { mean: 11, stddev: 5 },
        WR: { mean: 6, stddev: 3 },
        ATH: { mean: 20, stddev: 6 }
    },
    PassBlock: {
        C: { mean: 34, stddev: 9.58 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 42, stddev: 7.1 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 36, stddev: 9.73 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 37, stddev: 9.66 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 26, stddev: 5.9 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 33, stddev: 7.67 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    RunBlock: {
        C: { mean: 34, stddev: 10.14 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 42, stddev: 7.33 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 34, stddev: 9.55 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 35, stddev: 9.74 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 35, stddev: 7.07 },
        WR: { mean: 18, stddev: 8.99 },
        ATH: { mean: 20, stddev: 6 }
    },
    PassRush: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 35, stddev: 8 },
        DT: { mean: 29, stddev: 7.9 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 6, stddev: 3.55 },
        ILB: { mean: 18, stddev: 5.2 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 28, stddev: 13.97 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 6, stddev: 3.52 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    RunDefense: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 11, stddev: 3.28 },
        DE: { mean: 34, stddev: 8.17 },
        DT: { mean: 32, stddev: 7.9 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 24, stddev: 7.02 },
        ILB: { mean: 38, stddev: 8.39 },
        K: { mean: 10, stddev: 5 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 34, stddev: 9.18 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 10, stddev: 5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 30, stddev: 7.24 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    ThrowPower: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 12, stddev: 5.21 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 12, stddev: 5.04 },
        QB: { mean: 38, stddev: 8.46 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    ThrowAccuracy: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 12, stddev: 4.99 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 12, stddev: 5.07 },
        QB: { mean: 39, stddev: 8.15 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 20, stddev: 6 }
    },
    KickAccuracy: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 34, stddev: 12 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 13, stddev: 5.61 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 10, stddev: 5 }
    },
    KickPower: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 32, stddev: 11.85 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 13, stddev: 5.5 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 10, stddev: 5 }
    },
    PuntAccuracy: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 13, stddev: 4.97 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 29, stddev: 10.05 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 10, stddev: 5 }
    },
    PuntPower: {
        C: { mean: 10, stddev: 5 },
        CB: { mean: 10, stddev: 5 },
        DE: { mean: 10, stddev: 5 },
        DT: { mean: 10, stddev: 5 },
        FB: { mean: 10, stddev: 5 },
        FS: { mean: 10, stddev: 5 },
        ILB: { mean: 10, stddev: 5 },
        K: { mean: 13, stddev: 5.14 },
        OG: { mean: 10, stddev: 5 },
        OLB: { mean: 10, stddev: 5 },
        OT: { mean: 10, stddev: 5 },
        P: { mean: 30, stddev: 11.06 },
        QB: { mean: 10, stddev: 5 },
        RB: { mean: 10, stddev: 5 },
        SS: { mean: 10, stddev: 5 },
        TE: { mean: 10, stddev: 5 },
        WR: { mean: 10, stddev: 5 },
        ATH: { mean: 10, stddev: 5 }
    },
    Stamina: {
        C: { mean: 50, stddev: 15 },
        CB: { mean: 50, stddev: 15 },
        DE: { mean: 50, stddev: 15 },
        DT: { mean: 50, stddev: 15 },
        FB: { mean: 50, stddev: 15 },
        FS: { mean: 50, stddev: 15 },
        ILB: { mean: 50, stddev: 15 },
        K: { mean: 50, stddev: 5.15 },
        OG: { mean: 50, stddev: 15 },
        OLB: { mean: 50, stddev: 15 },
        OT: { mean: 50, stddev: 15 },
        P: { mean: 50, stddev: 15 },
        QB: { mean: 50, stddev: 15 },
        RB: { mean: 50, stddev: 15 },
        SS: { mean: 50, stddev: 15 },
        TE: { mean: 50, stddev: 15 },
        WR: { mean: 50, stddev: 15 },
        ATH: { mean: 50, stddev: 15 }
    },
    Injury: {
        C: { mean: 50, stddev: 15 },
        CB: { mean: 50, stddev: 15 },
        DE: { mean: 50, stddev: 15 },
        DT: { mean: 50, stddev: 15 },
        FB: { mean: 50, stddev: 15 },
        FS: { mean: 50, stddev: 15 },
        ILB: { mean: 50, stddev: 15 },
        K: { mean: 50, stddev: 15 },
        OG: { mean: 50, stddev: 15 },
        OLB: { mean: 50, stddev: 15 },
        OT: { mean: 50, stddev: 15 },
        P: { mean: 50, stddev: 15 },
        QB: { mean: 50, stddev: 15 },
        RB: { mean: 50, stddev: 15 },
        SS: { mean: 50, stddev: 15 },
        TE: { mean: 50, stddev: 15 },
        WR: { mean: 50, stddev: 15 },
        ATH: { mean: 50, stddev: 15 }
    }
};