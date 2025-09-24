import { useState } from "react";
import { useSimHCKStore } from "../../../context/SimHockeyContext";
import {
  Attributes,
  Overview,
  RecruitingCategory,
} from "../../../_constants/constants";

export const useHCKTransferPortal = () => {
  const hkStore = useSimHCKStore();
  const {
    portalPlayers,
    teamProfileMap,
    chlTeam,
    transferPortalProfiles,
    chlTeams,
    chlTeamMap,
    hck_Timestamp,
  } = hkStore;
  const [recruitingCategory, setRecruitingCategory] =
    useState<RecruitingCategory>(Overview);
  const [tableViewType, setTableViewType] = useState<string>(Attributes);
  const [country, setCountry] = useState<string>("");
  const [stars, setStars] = useState<number[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [archetype, setArchetype] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  return {
    recruitingCategory,
  };
};
