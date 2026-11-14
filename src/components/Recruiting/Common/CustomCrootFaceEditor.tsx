import { useEffect, useMemo, useRef } from "react";
import { display } from "facesjs";
import { Button } from "../../../_design/Buttons";
import { Text } from "../../../_design/Typography";
import {
  CrootEthnicity,
  getEthnicityFaceLists,
  getFaceOptionLists,
} from "../../../_constants/customCrootConstants";
import { League } from "../../../_constants/constants";
import { FaceDataResponse } from "../../../models/footballModels";
import { getPlayerFace } from "../../../_utility/usePlayerFaces";

interface CustomCrootFaceEditorProps {
  face: FaceDataResponse;
  ethnicity: CrootEthnicity;
  league: League;
  team?: any;
  onChange: (face: FaceDataResponse) => void;
  onRandomize: () => void;
}

const controlClass =
  "w-full rounded-md border border-gray-500 bg-black px-2 py-1 text-xs text-white";

export const CustomCrootFaceEditor = ({
  face,
  ethnicity,
  league,
  team,
  onChange,
  onRandomize,
}: CustomCrootFaceEditorProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const FaceOptionLists = useMemo(() => getFaceOptionLists(league), [league]);
  const ethnicityLists = useMemo(
    () => getEthnicityFaceLists(ethnicity, league),
    [ethnicity, league],
  );

  useEffect(() => {
    if (!previewRef.current) return;
    try {
      display(previewRef.current, getPlayerFace(face, undefined, team));
      previewRef.current
        .querySelector("svg")
        ?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    } catch (error) {
      console.error("Unable to render custom croot face:", error);
    }
  }, [face, team]);

  const update = (changes: Partial<FaceDataResponse>) =>
    onChange(
      new FaceDataResponse({
        ...face,
        TeamColors: face.teamColors,
        ...changes,
      }),
    );

  const selectField = (
    label: string,
    field: keyof FaceDataResponse,
    options: string[],
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-300">{label}</span>
      <select
        className={controlClass}
        value={face[field] as string}
        onChange={(e) => update({ [field]: e.target.value })}
      >
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {`${label} ${index + 1}`}
          </option>
        ))}
      </select>
    </label>
  );

  const sliderField = (
    label: string,
    field: keyof FaceDataResponse,
    min: number,
    max: number,
    step: number,
  ) => (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-gray-300">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={face[field] as number}
        onChange={(e) => update({ [field]: Number(e.target.value) })}
      />
    </label>
  );

  const toggleField = (label: string, field: keyof FaceDataResponse) => (
    <label className="flex items-center gap-2 text-xs text-gray-300">
      <input
        type="checkbox"
        checked={face[field] as boolean}
        onChange={(e) => update({ [field]: e.target.checked })}
      />
      {label}
    </label>
  );

  const swatches = (
    label: string,
    field: "SkinColor" | "HairColor",
    colors: string[],
  ) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-300">{label}</span>
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`${label} ${color}`}
            onClick={() => update({ [field]: color })}
            className={`h-6 w-6 rounded-full border-2 ${
              face[field] === color ? "border-blue-400" : "border-gray-600"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-2 sm:w-48">
        <div
          ref={previewRef}
          className="h-48 w-48 rounded-lg border border-gray-600 bg-gray-900"
        />
        <Button type="button" size="sm" onClick={onRandomize}>
          Randomize
        </Button>
        <Text variant="xs" classes="text-center text-gray-400">
          Skin and hair options follow the selected ethnicity.
        </Text>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        {swatches("Skin Tone", "SkinColor", ethnicityLists.skin)}
        {swatches("Hair Color", "HairColor", ethnicityLists.hairColor)}
        <div />
        {selectField("Hair", "Hair", ethnicityLists.hair)}
        {selectField("Facial Hair", "FacialHair", FaceOptionLists.facialHair)}
        {selectField("Head", "Head", FaceOptionLists.head)}
        {selectField("Eyes", "Eye", FaceOptionLists.eye)}
        {selectField("Eyebrows", "Eyebrow", FaceOptionLists.eyebrow)}
        {selectField("Nose", "Nose", FaceOptionLists.nose)}
        {selectField("Mouth", "Mouth", FaceOptionLists.mouth)}
        {selectField("Ears", "Ear", FaceOptionLists.ear)}
        {selectField("Eye Line", "EyeLine", FaceOptionLists.eyeLine)}
        {selectField("Smile Line", "SmileLine", FaceOptionLists.smileLine)}
        {selectField("Face Marks", "MiscLine", FaceOptionLists.miscLine)}
        {selectField("Accessory", "Accessories", FaceOptionLists.accessories)}
        {selectField("Jersey", "Jersey", FaceOptionLists.jersey)}
        {selectField("Body", "Body", FaceOptionLists.body)}
        {sliderField("Face Width", "FaceSize", 0, 1, 0.01)}
        {sliderField("Body Size", "BodySize", 0.8, 1.2, 0.01)}
        {sliderField("Ear Size", "EarSize", 0.5, 1.5, 0.01)}
        {sliderField("Nose Size", "NoseSize", 0.5, 1.25, 0.01)}
        {sliderField("Eye Angle", "EyeAngle", -10, 15, 1)}
        {sliderField("Eyebrow Angle", "EyeBrowAngle", -15, 20, 1)}
        {sliderField("Smile Line Size", "SmileLineSize", 0.25, 2.25, 0.01)}
        <div className="col-span-2 flex flex-wrap gap-4 sm:col-span-3">
          {toggleField("Flip Hair", "HairFlip")}
          {toggleField("Flip Nose", "NoseFlip")}
          {toggleField("Flip Mouth", "MouthFlip")}
        </div>
      </div>
    </div>
  );
};
