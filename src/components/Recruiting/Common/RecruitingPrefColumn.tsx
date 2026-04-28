import React, { useMemo } from "react";
import {
  ProfileAffinity,
  RecruitingTeamProfile,
} from "../../../models/footballModels";

export const CFBRecruitingPrefLabel: React.FC<{
  value: number | string;
  label: string;
  crootValue: number | string;
  teamProfile: RecruitingTeamProfile;
}> = ({ value, crootValue, teamProfile, label }) => {
  const teamValue = useMemo(() => {
    switch (label) {
      case "ProgramPref":
        return teamProfile.ProgramPrestige;
      case "ProfDevPref":
        return teamProfile.ProfessionalPrestige;
      case "TraditionsPref":
        return teamProfile.Traditions;
      case "FacilitiesPref":
        return teamProfile.Facilities;
      case "AtmospherePref":
        return teamProfile.Atmosphere;
      case "AcademicsPref":
        return teamProfile.Academics;
      case "CampusLifePref":
        return teamProfile.CampusLife;
      case "ConferencePref":
        return teamProfile.ConferencePrestige;
      case "CoachPref":
        return teamProfile.CoachRating;
      case "SeasonMomentumPref":
        return teamProfile.SeasonMomentum;
      case "MediaSpotlightPref":
        return teamProfile.MediaSpotlight;
      case "ReligionPref":
        return teamProfile.ReligionAffinity ? 10 : 5;
      case "ServiceAcademyPref":
        return teamProfile.ServiceAcademyAffinity ? 10 : 5;
      case "SmallTownPref":
        return teamProfile.SmallTownAffinity ? 10 : 5;
      case "BigCityPref":
        return teamProfile.BigCityAffinity ? 10 : 5;
    }

    return 0;
  }, [label, teamProfile]);

  const textColor = useMemo(() => {
    if (typeof crootValue === "number" && crootValue > teamValue) {
      return "text-red-500";
    }
    if (typeof crootValue === "number" && crootValue < teamValue) {
      return "text-green-500";
    }
    return "";
  }, [crootValue, teamValue]);
  return <span className={`text-xs ${textColor}`}>{value}</span>;
};
