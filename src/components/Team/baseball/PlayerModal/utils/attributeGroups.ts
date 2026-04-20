// ── Attribute display names ──
export const BATTING_ATTRS = [
  { key: "contact", label: "Contact" },
  { key: "power", label: "Power" },
  { key: "eye", label: "Eye" },
  { key: "discipline", label: "Discipline" },
];
export const RUNNING_ATTRS = [
  { key: "speed", label: "Speed" },
  { key: "baserunning", label: "Baserunning" },
  { key: "basereaction", label: "Base React" },
];
export const FIELDING_ATTRS = [
  { key: "fieldcatch", label: "Catch" },
  { key: "fieldreact", label: "React" },
  { key: "fieldspot", label: "Spot" },
  { key: "throwpower", label: "Throw Pow" },
  { key: "throwacc", label: "Throw Acc" },
];
export const CATCHER_ATTRS = [
  { key: "catchframe", label: "Framing" },
  { key: "catchsequence", label: "Sequence" },
];
export const PITCHING_ATTRS = [
  { key: "pendurance", label: "Endurance" },
  { key: "pgencontrol", label: "Control" },
  { key: "pthrowpower", label: "Velocity" },
  { key: "psequencing", label: "Sequencing" },
  { key: "pickoff", label: "Pickoff" },
];

// Pitch sub-ability labels
export const PITCH_SUB_LABELS: Record<string, string> = {
  pacc: "Accuracy",
  pcntrl: "Control",
  pbrk: "Break",
  consist: "Consistency",
};

// ── Potential display groups by player type ──
// These are used for the primary role groups (non-pitch potentials)
export const POS_PRIMARY_POTENTIAL_GROUPS = [
  {
    title: "Batting",
    keys: [
      { key: "contact_pot", label: "Contact" },
      { key: "power_pot", label: "Power" },
      { key: "eye_pot", label: "Eye" },
      { key: "discipline_pot", label: "Discipline" },
    ],
  },
  {
    title: "Speed / Base",
    keys: [
      { key: "speed_pot", label: "Speed" },
      { key: "baserunning_pot", label: "Baserunning" },
      { key: "basereaction_pot", label: "Base React" },
    ],
  },
];

export const POS_FIELDING_POTENTIAL_GROUP = {
  title: "Fielding",
  keys: [
    { key: "fieldcatch_pot", label: "Catch" },
    { key: "fieldreact_pot", label: "React" },
    { key: "fieldspot_pot", label: "Spot" },
    { key: "throwpower_pot", label: "Throw Pow" },
    { key: "throwacc_pot", label: "Throw Acc" },
  ],
};

export const POS_CATCHING_POTENTIAL_GROUP = {
  title: "Catching",
  keys: [
    { key: "catchframe_pot", label: "Framing" },
    { key: "catchsequence_pot", label: "Sequence" },
  ],
};

export const PITCH_PRIMARY_POTENTIAL_GROUPS = [
  {
    title: "Pitching",
    keys: [
      { key: "pendurance_pot", label: "Endurance" },
      { key: "pgencontrol_pot", label: "Control" },
      { key: "pthrowpower_pot", label: "Velocity" },
      { key: "psequencing_pot", label: "Sequencing" },
      { key: "pickoff_pot", label: "Pickoff" },
    ],
  },
];

export const PITCH_SECONDARY_POTENTIAL_GROUPS = [
  {
    title: "Batting",
    keys: [
      { key: "contact_pot", label: "Contact" },
      { key: "power_pot", label: "Power" },
      { key: "eye_pot", label: "Eye" },
      { key: "discipline_pot", label: "Discipline" },
    ],
  },
  {
    title: "Speed / Base",
    keys: [
      { key: "speed_pot", label: "Speed" },
      { key: "baserunning_pot", label: "Baserunning" },
      { key: "basereaction_pot", label: "Base React" },
    ],
  },
];

export const POS_SECONDARY_POTENTIAL_GROUPS = [
  {
    title: "Pitching",
    keys: [
      { key: "pendurance_pot", label: "Endurance" },
      { key: "pgencontrol_pot", label: "Control" },
      { key: "pthrowpower_pot", label: "Velocity" },
      { key: "psequencing_pot", label: "Sequencing" },
      { key: "pickoff_pot", label: "Pickoff" },
    ],
  },
];

// Legacy exports for backwards compatibility
export const POS_POTENTIAL_GROUPS = [
  ...POS_PRIMARY_POTENTIAL_GROUPS,
  POS_FIELDING_POTENTIAL_GROUP,
  POS_CATCHING_POTENTIAL_GROUP,
];

export const PITCH_POTENTIAL_GROUPS = [
  ...PITCH_PRIMARY_POTENTIAL_GROUPS,
  {
    title: "Athletic",
    keys: [
      { key: "speed_pot", label: "Speed" },
      { key: "baserunning_pot", label: "Baserunning" },
    ],
  },
];

// Peer comparison disclaimer
export const PEER_COMPARISON_NOTE =
  "Grades are relative to peer players, not the league as a whole.";
