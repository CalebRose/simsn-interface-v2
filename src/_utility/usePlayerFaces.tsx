import React, { useEffect, useRef } from 'react';
import { display, generate } from 'facesjs';
import { League, SimCFB, SimNFL, SimCBB, SimNBA, SimCHL, SimPHL, SimMLB, SimCollegeBaseball } from '../_constants/constants';
import { FaceDataResponse } from '../models/footballModels';
import { useSimFBAStore } from '../context/SimFBAContext';
import { useSimBBAStore } from '../context/SimBBAContext';
import { useSimHCKStore } from '../context/SimHockeyContext';
import { useSimBaseballStore } from '../context/SimBaseballContext';

interface PlayerPictureProps {
  classes?: string;
  style?: React.CSSProperties | undefined;
  playerID: number;
  team: any;
  league: League;
}

const PlayerPicture: React.FC<PlayerPictureProps> = ({ classes, playerID, team, league }) => {
  const faceContainerRef = useRef<HTMLDivElement>(null);
  const simFBAStore = useSimFBAStore();
  const simBBAStore = useSimBBAStore();
  const simHCKStore = useSimHCKStore();
  const simBaseballStore = useSimBaseballStore();

  const faceData = React.useMemo(() => {
  switch (league) {
    case SimCFB:
    case SimNFL:
    return simFBAStore.playerFaces as { [key: number]: FaceDataResponse };

    case SimCBB:
    case SimNBA:
    return simBBAStore.playerFaces as { [key: number]: FaceDataResponse };

    case SimCHL:
    case SimPHL:
    return simHCKStore.playerFaces as { [key: number]: FaceDataResponse };

    case SimMLB:
    case SimCollegeBaseball:
    return simBaseballStore.playerFaces as { [key: number]: FaceDataResponse };

    default:
    return {};
}
}, [league, simFBAStore, simBBAStore, simHCKStore, simBaseballStore]);

  useEffect(() => {
    const playerFaceData = faceData[playerID];
    if (playerFaceData) {
      const face = getPlayerFace(playerFaceData, team);

      if (faceContainerRef.current) {
        display(faceContainerRef.current, face);

        setTimeout(() => {
          const svg = faceContainerRef.current?.querySelector('svg');
          if (svg) {
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          }
        }, 0);
      }
    }
  }, [faceData, playerID]);

  return <div ref={faceContainerRef} id="face-container" 
              className={`flex justify-center items-center h-full w-full text-center ${classes}`} />;
};

export default PlayerPicture;



const getPlayerFace = (playerFaceData: FaceDataResponse, team: any) => {

    let teamColors: [string, string, string] = [
        "#000000",
        "#FFFFFF",
        "#000000"
      ];

      if (team) {
        teamColors = [
          team.ColorOne || team.color_one || "#000000",
          team.ColorTwo || team.color_two || "#FFFFFF",
          team.ColorThree || team.color_three || "#000000"
        ];
      }

    // head.shave must be a valid rgba() string; default to transparent if missing/invalid
    const shave = playerFaceData.FacialHairShave && playerFaceData.FacialHairShave.startsWith("rgba")
      ? playerFaceData.FacialHairShave
      : "rgba(0,0,0,0)";

    return {
        accessories: { id: playerFaceData.Accessories },
        body: { id: playerFaceData.Body, color: playerFaceData.SkinColor, size: playerFaceData.BodySize },
        ear: { id: playerFaceData.Ear, size: playerFaceData.EarSize },
        eye: { id: playerFaceData.Eye, angle: playerFaceData.EyeAngle },
        eyeLine: { id: playerFaceData.EyeLine },
        eyebrow: { id: playerFaceData.Eyebrow, angle: playerFaceData.EyeBrowAngle },
        facialHair: { id: playerFaceData.FacialHair },
        fatness: playerFaceData.FaceSize,
        glasses: { id: playerFaceData.Glasses },
        hair: { id: playerFaceData.Hair, color: playerFaceData.HairColor, flip: playerFaceData.HairFlip },
        hairBg: { id: playerFaceData.HairBG },
        head: { id: playerFaceData.Head, shave },
        jersey: { id: playerFaceData.Jersey },
        miscLine: { id: playerFaceData.MiscLine },
        mouth: { id: playerFaceData.Mouth, flip: playerFaceData.MouthFlip },
        nose: { id: playerFaceData.Nose, flip: playerFaceData.NoseFlip, size: playerFaceData.NoseSize },
        smileLine: { id: playerFaceData.SmileLine, size: playerFaceData.SmileLineSize },
        teamColors: teamColors,
    };
  };