import { ChangeEvent } from "react";
import {
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../../_constants/constants";
import { Border } from "../../_design/Borders";
import { ButtonGroup, PillButton } from "../../_design/Buttons";
import { PageContainer } from "../../_design/Container";
import { ToggleSwitch } from "../../_design/Inputs";
import { SelectDropdown } from "../../_design/Select";
import { Text } from "../../_design/Typography";
import { CurrentUser } from "../../_hooks/useCurrentUser";
import { useAuthStore } from "../../context/AuthContext";
import { useLeagueStore } from "../../context/LeagueContext";
import { updateUserByUsername } from "../../firebase/firestoreHelper";
import { ProfileCHLTeamCard, ProfilePHLTeamCard } from "./ProfileTeamCard";

export const ProfilePage = () => {
  const {
    currentUser,
    setCurrentUser,
    viewMode,
    setViewMode,
    isCHLUser,
    isPHLUser,
  } = useAuthStore();
  const setDefaultLeague = async (league: string) => {
    const updatedCurrentUser = { ...currentUser } as CurrentUser;
    updatedCurrentUser.DefaultLeague = league;
    setCurrentUser(updatedCurrentUser);
    const payload = {
      DefaultLeague: league,
    };
    await updateUserByUsername(currentUser!.username, payload);
  };

  const setRetro = async () => {
    const newRetro = !currentUser?.isRetro;
    const updatedCurrentUser = { ...currentUser } as CurrentUser;
    updatedCurrentUser.isRetro = newRetro;
    const payload = {
      isRetro: newRetro,
    };
    setCurrentUser(updatedCurrentUser);
    await updateUserByUsername(currentUser!.username, payload);
  };

  const setTheme = (selectedOption: any) => {
    const newTheme = selectedOption.value;
    setViewMode(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const themeOptions = [
    { label: "🌙 Dark", value: "dark" },
    { label: "⚫ Steel", value: "steel" },
    { label: "🔘 Grey", value: "grey" },
    { label: "☀️ Light", value: "light" },
    { label: "🟡 Gold", value: "gold" },
    { label: "🔴 Red", value: "red" },
    { label: "🟣 Purple", value: "purple" },
    { label: "🔵 Blue", value: "blue" },
    { label: "🌊 Ocean Blue", value: "oceanblue" },
    { label: "🐚 Teal", value: "teal" },
    { label: "🌿 Deep Sea Green", value: "deepsea" },
    { label: "🍃 Castleton Green", value: "castleton" },
    { label: "🌲 Sage Green", value: "sage" },
  ];

  const selectedTheme =
    themeOptions.find((option) => option.value === viewMode) || themeOptions[0];

  return (
    <>
      <PageContainer direction="col" isLoading={false} title="Profile">
        <div className="flex flex-row">
          <Border classes="w-full px-4">
            <Text variant="h6">
              Default League: {currentUser?.DefaultLeague || SimCFB}
            </Text>
            <ButtonGroup classes="justify-center">
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimCFB}
                onClick={() => setDefaultLeague(SimCFB)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimCFB}
              </PillButton>
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimNFL}
                onClick={() => setDefaultLeague(SimNFL)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimNFL}
              </PillButton>
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimCBB}
                onClick={() => setDefaultLeague(SimCBB)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimCBB}
              </PillButton>
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimNBA}
                onClick={() => setDefaultLeague(SimNBA)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimNBA}
              </PillButton>
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimCHL}
                onClick={() => setDefaultLeague(SimCHL)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimCHL}
              </PillButton>
              <PillButton
                isSelected={currentUser?.DefaultLeague === SimPHL}
                onClick={() => setDefaultLeague(SimPHL)}
                variant="secondary"
                classes="w-[8rem]"
              >
                {SimPHL}
              </PillButton>
            </ButtonGroup>
          </Border>
        </div>
        <Border classes="w-full px-4 py-3">
          <Text variant="h6" classes="mb-2">
            Actions
          </Text>
          <div className="justify-center flex flex-row gap-x-8">
            <div className="flex flex-col">
              <Text variant="body-small" className="text-start">
                Retro
              </Text>
              <ToggleSwitch
                checked={currentUser?.isRetro!!}
                onChange={setRetro}
              />
            </div>
            <div className="flex flex-col">
              <Text variant="body-small" className="text-start mb-2">
                Theme
              </Text>
              <SelectDropdown
                options={themeOptions}
                value={selectedTheme}
                onChange={setTheme}
                isMulti={false}
                className="min-w-[140px]"
              />
            </div>
          </div>
        </Border>
        <Border classes="w-full p-4 mt-2">
          <Text variant="h6">Teams</Text>
          <div className="flex flex-row flex-wrap justify-between pb-2 gap-4 overflow-y-auto max-h-[40vh] lg:max-h-[50vh]">
            {isCHLUser && (
              <>
                <ProfileCHLTeamCard />
              </>
            )}
            {isPHLUser && (
              <>
                <ProfilePHLTeamCard />
              </>
            )}
          </div>
        </Border>
      </PageContainer>
    </>
  );
};
