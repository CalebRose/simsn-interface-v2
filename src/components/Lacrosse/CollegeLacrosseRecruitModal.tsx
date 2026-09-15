import { useEffect, useRef } from "react";
import { display } from "facesjs";
import { Button } from "../../_design/Buttons";
import { Logo } from "../../_design/Logo";
import { getLaxLogoUrl, LaxRecruit } from "../../_services/lacrosseService";
import { ProfileTeamCardModal } from "../Profile/ProfileTeamCardModal";

const RecruitFace = ({ recruit }: { recruit:LaxRecruit }) => {
  const faceRef=useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!faceRef.current)return;
    faceRef.current.innerHTML="";
    try{
      display(faceRef.current,{...recruit.faceData,teamColors:["#1f2937","#ffffff","#94a3b8"],jersey:{id:"hockey"}} as any);
      faceRef.current.querySelector("svg")?.setAttribute("preserveAspectRatio","xMidYMid meet");
    }catch{faceRef.current.innerHTML="";}
  },[recruit]);
  return <div ref={faceRef} className="h-32 w-32 shrink-0 overflow-hidden rounded border bg-white [&_svg]:h-full [&_svg]:w-full"/>;
};

export const CollegeLacrosseRecruitModal=({recruit,onClose}:{recruit:LaxRecruit|null;onClose:()=>void}) => <ProfileTeamCardModal
  isOpen={Boolean(recruit)} onClose={onClose}
  title={recruit?`${recruit.id} ${recruit.position} ${recruit.archetype} ${recruit.firstName} ${recruit.lastName}`:"Recruit Profile"}
  maxWidth="max-w-2xl" actions={<Button onClick={onClose}>Close</Button>}
>
  {recruit&&<div className="space-y-5">
    <div className="grid gap-5 sm:grid-cols-[150px_1fr]">
      <div className="flex justify-center"><RecruitFace recruit={recruit}/></div>
      <div className="grid grid-cols-2 gap-5 text-center sm:grid-cols-4">
        <div className="col-span-2"><strong className="block">Origin</strong>{recruit.state?`${recruit.state}, ${recruit.country}`:recruit.country}</div>
        <div><strong className="block">Overall</strong>{recruit.overall}</div>
        <div><strong className="block">Potential</strong>{recruit.potential}</div>
        <div className="col-span-2"><strong className="block">Signing Expectation</strong>{recruit.signingExpectation}</div>
        <div className="col-span-2 sm:col-start-2"><strong className="block">Stars</strong><span className="text-yellow-400">{"★".repeat(recruit.stars)}</span></div>
      </div>
    </div>
    <div className="border-t pt-3">
      <h3 className="mb-2 text-center text-lg font-bold">Leading Teams</h3>
      <div className="max-h-56 overflow-y-auto">
        <div className="grid grid-cols-[1fr_110px_150px] gap-3 border-b pb-2 text-center font-bold"><span>Team</span><span>Scholarship</span><span>Prediction</span></div>
        {recruit.leaders.length?recruit.leaders.map((leader)=><div key={leader.teamId} className="grid grid-cols-[1fr_110px_150px] items-center gap-3 border-b border-slate-600 py-2 text-center">
          <div className="flex items-center justify-center gap-2"><Logo url={getLaxLogoUrl(leader.logoFileName)} variant="tiny"/><span className="font-semibold">{leader.abbreviation}</span></div><span>{leader.scholarship?"Yes":"No"}</span><span>{leader.prediction}</span>
        </div>):<div className="py-6 text-center opacity-60">No leading teams</div>}
      </div>
    </div>
  </div>}
</ProfileTeamCardModal>;
