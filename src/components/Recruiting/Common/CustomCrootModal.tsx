import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../_design/Modal";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import { SelectDropdown } from "../../../_design/Select";
import { SelectOption } from "../../../_hooks/useSelectStyles";
import {
  League,
  SimCHL,
  SimCFB,
  SimCBB,
} from "../../../_constants/constants";
import {
  applyEthnicityToFace,
  CrootEthnicity,
  CUSTOM_CROOT_MAX_BIO_LENGTH,
  CUSTOM_CROOT_MAX_PREFERENCES,
  CustomCrootConfigs,
  EthnicityOptions,
  generateCustomCrootFace,
} from "../../../_constants/customCrootConstants";
import { FaceDataResponse } from "../../../models/footballModels";
import { CustomCrootFaceEditor } from "./CustomCrootFaceEditor";
import { Field } from "../../../_design/Field";
import { useSimFBAStore } from "../../../context/SimFBAContext";
import { useSimBBAStore } from "../../../context/SimBBAContext";
import { useSimHCKStore } from "../../../context/SimHockeyContext";

export interface CustomCrootSubmission {
  FirstName: string;
  LastName: string;
  Position: string;
  Archetype: string;
  Height: number;
  Weight: number;
  City: string;
  HighSchool: string;
  State: string;
  Country: string;
  PreferenceOne: string;
  PreferenceTwo: string;
  ExistingRelative: number;
  Ethnicity: CrootEthnicity;
  Bio: string;
  CustomCrootFor: string;
  FaceData: FaceDataResponse;
}

interface CustomCrootModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  team?: any;
  league: League;
  onSubmit: (submission: CustomCrootSubmission) => Promise<void>;
}

const NAME_PATTERN = /^[A-Za-z][A-Za-z'.\- ]{0,29}$/;
const DEFAULT_ETHNICITY: CrootEthnicity = "Caucasian";
const USA = "USA";

const toOptions = (values: string[]): SelectOption[] =>
  values.map((value) => ({ label: value, value }));
const formatInches = (inches: number) =>
  `${Math.floor(inches / 12)}'${inches % 12}"`;

const inputClass =
  "w-full rounded-md border border-gray-500 bg-black px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500";

export const CustomCrootModal = ({
  isOpen,
  onClose,
  username,
  team,
  league,
  onSubmit,
}: CustomCrootModalProps) => {
  const config = CustomCrootConfigs[league] ?? CustomCrootConfigs[SimCFB]!;
  const defaultWeight = config.defaultWeight;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [archetype, setArchetype] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weight, setWeight] = useState("");
  const [city, setCity] = useState("");
  const [highSchool, setHighSchool] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState(USA);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [relative, setRelative] = useState("");
  const [ethnicity, setEthnicity] = useState<CrootEthnicity>(DEFAULT_ETHNICITY);
  const [bio, setBio] = useState("");
  const [face, setFace] = useState<FaceDataResponse>(() =>
    generateCustomCrootFace(DEFAULT_ETHNICITY, defaultWeight, league),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { cfbPlayerMap } = useSimFBAStore();
  const { cbbPlayerMap } = useSimBBAStore();
  const { chlPlayerMap } = useSimHCKStore();

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPosition("");
    setArchetype("");
    setFeet("");
    setInches("");
    setWeight("");
    setCity("");
    setHighSchool("");
    setState("");
    setCountry(USA);
    setPreferences([]);
    setRelative("");
    setEthnicity(DEFAULT_ETHNICITY);
    setBio("");
    setFace(generateCustomCrootFace(DEFAULT_ETHNICITY, defaultWeight, league));
    setShowErrors(false);
    setSubmitError("");
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const existingRelativeList = useMemo((): SelectOption[] => {
    const toRelativeOptions = (
      players: Record<
        string | number,
        { ID: number; FirstName: string; LastName: string }
      >,
    ): SelectOption[] =>
      Object.values(players).map((player) => ({
        label: `${player.ID} ${player.FirstName} ${player.LastName}`,
        value: String(player.ID),
      }));
    switch (league) {
      case SimCFB:
        return toRelativeOptions(cfbPlayerMap);
      case SimCBB:
        return toRelativeOptions(cbbPlayerMap);
      case SimCHL:
        return toRelativeOptions(chlPlayerMap);
      default:
        return [{ label: "No existing relatives", value: "" }];
    }
  }, [league, cfbPlayerMap, cbbPlayerMap, chlPlayerMap]);

  const archetypeOptions = useMemo(
    () => toOptions(config.archetypesByPosition[position] ?? []),
    [config, position],
  );

  const totalHeight = Number(feet) * 12 + Number(inches || 0);
  const weightValue = Number(weight);
  const countryOptions = config.countryOptions;
  const stateOptions = useMemo(
    () => config.getRegionOptions(country),
    [config, country],
  );
  const needsState = stateOptions.length > 0;
  const stateLabel = country === "Canada" ? "Province" : "State";

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!NAME_PATTERN.test(firstName.trim()))
      e.firstName = "Enter a first name.";
    if (!NAME_PATTERN.test(lastName.trim())) e.lastName = "Enter a last name.";
    if (!position) e.position = "Select a position.";
    if (!archetype) e.archetype = "Select an archetype.";
    if (
      !Number.isInteger(totalHeight) ||
      totalHeight < config.minHeight ||
      totalHeight > config.maxHeight
    ) {
      e.height = `Height must be between ${formatInches(config.minHeight)} and ${formatInches(config.maxHeight)}.`;
    }
    if (
      !Number.isInteger(weightValue) ||
      weightValue < config.minWeight ||
      weightValue > config.maxWeight
    ) {
      e.weight = `Weight must be between ${config.minWeight} and ${config.maxWeight} lbs.`;
    }
    if (!city.trim()) e.city = "Enter a city.";
    if (!highSchool.trim()) e.highSchool = "Enter a high school.";
    if (countryOptions && !country) e.country = "Select a country.";
    if (needsState && !state) e.state = `Select a ${stateLabel.toLowerCase()}.`;
    return e;
  }, [
    config,
    firstName,
    lastName,
    position,
    archetype,
    totalHeight,
    weightValue,
    city,
    highSchool,
    state,
    country,
    needsState,
  ]);

  const changeEthnicity = (next: CrootEthnicity) => {
    setEthnicity(next);
    setFace((previous) => applyEthnicityToFace(previous, next, league));
  };

  const handleSubmit = async () => {
    setShowErrors(true);
    setSubmitError("");
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        FirstName: firstName.trim(),
        LastName: lastName.trim(),
        Position: position,
        Archetype: archetype,
        Height: totalHeight,
        Weight: weightValue,
        City: city.trim(),
        HighSchool: highSchool.trim(),
        State: needsState ? state : "",
        Country: countryOptions ? country : "",
        PreferenceOne: preferences[0] ?? "",
        PreferenceTwo: preferences[1] ?? "",
        ExistingRelative: relative ? Number(relative) : 0,
        Ethnicity: ethnicity,
        Bio: bio.trim(),
        CustomCrootFor: username,
        FaceData: face,
      });
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to submit custom croot. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const err = (key: string) => (showErrors ? errors[key] : undefined);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Create a Custom ${league} Recruit`}
      maxWidth="max-w-4xl"
      actions={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Recruit"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 pr-1">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="First Name" error={err("firstName")}>
            <input
              className={inputClass}
              value={firstName}
              maxLength={30}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Field>
          <Field label="Last Name" error={err("lastName")}>
            <input
              className={inputClass}
              value={lastName}
              maxLength={30}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Field>
          <Field label="Position" error={err("position")}>
            <SelectDropdown
              options={config.positionOptions}
              value={
                config.positionOptions.find((o) => o.value === position) ??
                null
              }
              placeholder="Select position"
              onChange={(option) => {
                setPosition(option?.value ?? "");
                setArchetype("");
              }}
            />
          </Field>
          <Field
            label="Archetype"
            error={err("archetype")}
            hint={position ? undefined : "Choose a position first."}
          >
            <SelectDropdown
              options={archetypeOptions}
              value={
                archetypeOptions.find((o) => o.value === archetype) ?? null
              }
              isDisabled={!position}
              placeholder="Select archetype"
              onChange={(option) => setArchetype(option?.value ?? "")}
            />
          </Field>
          <Field label="Height" error={err("height")}>
            <div className="flex items-center gap-2">
              <input
                className={inputClass}
                type="number"
                min={Math.floor(config.minHeight / 12)}
                max={Math.floor(config.maxHeight / 12)}
                placeholder="ft"
                value={feet}
                onChange={(e) => setFeet(e.target.value)}
              />
              <input
                className={inputClass}
                type="number"
                min={0}
                max={11}
                placeholder="in"
                value={inches}
                onChange={(e) => setInches(e.target.value)}
              />
            </div>
          </Field>
          <Field label="Weight (lbs)" error={err("weight")}>
            <input
              className={inputClass}
              type="number"
              placeholder="lbs"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Field>
          <Field label="City" error={err("city")}>
            <input
              className={inputClass}
              value={city}
              maxLength={50}
              onChange={(e) => setCity(e.target.value)}
            />
          </Field>
          <Field label="High School" error={err("highSchool")}>
            <input
              className={inputClass}
              value={highSchool}
              maxLength={60}
              onChange={(e) => setHighSchool(e.target.value)}
            />
          </Field>
          {countryOptions && (
            <Field label="Country" error={err("country")}>
              <SelectDropdown
                options={countryOptions}
                value={countryOptions.find((o) => o.value === country) ?? null}
                placeholder="Select country"
                onChange={(option) => {
                  setCountry(option?.value ?? "");
                  setState("");
                }}
              />
            </Field>
          )}
          {needsState && (
            <Field label={stateLabel} error={err("state")}>
              <SelectDropdown
                options={stateOptions}
                value={stateOptions.find((o) => o.value === state) ?? null}
                placeholder={`Select ${stateLabel.toLowerCase()}`}
                onChange={(option) => setState(option?.value ?? "")}
              />
            </Field>
          )}
          <Field label="Ethnicity">
            <SelectDropdown
              options={EthnicityOptions}
              value={EthnicityOptions.find((o) => o.value === ethnicity)}
              onChange={(option) =>
                option && changeEthnicity(option.value as CrootEthnicity)
              }
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Player Preferences"
            hint={`Choose up to ${CUSTOM_CROOT_MAX_PREFERENCES} categories this player strongly prefers. Each is set to a value of 1.`}
          >
            <SelectDropdown
              isMulti
              options={config.preferenceOptions}
              value={config.preferenceOptions.filter((o) =>
                preferences.includes(o.value),
              )}
              isOptionDisabled={(option) =>
                preferences.length >= CUSTOM_CROOT_MAX_PREFERENCES &&
                !preferences.includes(option.value)
              }
              placeholder="Select preferences"
              onChange={(options) =>
                setPreferences(
                  (options ?? [])
                    .map((o) => o.value)
                    .slice(0, CUSTOM_CROOT_MAX_PREFERENCES),
                )
              }
            />
          </Field>
          <Field
            label="Existing Relative"
            hint="Select an active college player from the list. For the full list, head to the Roster Page first."
          >
            <SelectDropdown
              options={existingRelativeList}
              value={
                relative
                  ? (existingRelativeList.find((o) => o.value === relative) ??
                    null)
                  : null
              }
              placeholder="Select existing relative"
              onChange={(option) => setRelative(option?.value ?? "")}
            />
          </Field>
        </div>

        <Field
          label="Bio (optional)"
          hint="Give us a backstory for this custom croot. Write as much as you want."
        >
          <textarea
            className={inputClass}
            rows={4}
            maxLength={CUSTOM_CROOT_MAX_BIO_LENGTH}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-2">
          <Text variant="body" classes="font-semibold text-white">
            Design Your Recruit&apos;s Face
          </Text>
          <CustomCrootFaceEditor
            face={face}
            ethnicity={ethnicity}
            league={league}
            team={team}
            onChange={setFace}
            onRandomize={() =>
              setFace(
                generateCustomCrootFace(
                  ethnicity,
                  Number.isFinite(weightValue) && weightValue > 0
                    ? weightValue
                    : defaultWeight,
                  league,
                ),
              )
            }
          />
        </div>

        {submitError && (
          <Text variant="small" classes="text-red-400">
            {submitError}
          </Text>
        )}
      </div>
    </Modal>
  );
};
