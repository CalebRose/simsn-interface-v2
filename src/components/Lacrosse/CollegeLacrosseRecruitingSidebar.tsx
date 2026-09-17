import { Border } from "../../_design/Borders";
import { LaxRecruitingTeamInfo } from "../../_services/lacrosseService";
import { getTextColorBasedOnBg } from "../../_utility/getBorderClass";

export const CollegeLacrosseRecruitingSidebar = ({
  team,
}: {
  team: LaxRecruitingTeamInfo;
}) => (
  <Border
    classes="h-fit p-4 lg:sticky lg:top-3"
    styles={{ borderColor: team.primaryColor }}
  >
    <h2
      className={`rounded px-3 py-2 text-center text-xl font-bold ${getTextColorBasedOnBg(team.primaryColor)}`}
      style={{ backgroundColor: team.primaryColor }}
    >
      {team.schoolName}
    </h2>
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-sm">
      <dt className="font-semibold">Recruiter:</dt>
      <dd>{team.recruiter}</dd>
      <dt className="font-semibold">State:</dt>
      <dd>{team.state}</dd>
      <dt className="font-semibold">Scholarships:</dt>
      <dd>{team.maxScholarships}</dd>
      <dt className="font-semibold">Spots remaining:</dt>
      <dd>{team.spotsRemaining}</dd>
    </dl>
    <h3
      className={`mt-5 rounded px-3 py-2 text-center text-lg font-bold ${getTextColorBasedOnBg(team.primaryColor)}`}
      style={{ backgroundColor: team.primaryColor }}
    >
      Recruiting Needs
    </h3>
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-center text-xs">
        <thead>
          <tr className="border-b border-slate-500">
            <th className="py-2 text-left">Position</th>
            <th>Fr</th>
            <th>So</th>
            <th>Jr</th>
            <th>Sr</th>
            <th>5th</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {team.rosterCounts.map((count) => (
            <tr key={count.position} className="border-b border-slate-700">
              <th className="py-2 text-left font-semibold">{count.position}</th>
              <td>{count.freshman}</td>
              <td>{count.sophomore}</td>
              <td>{count.junior}</td>
              <td>{count.senior}</td>
              <td>{count.fifthYear}</td>
              <td className="font-bold">{count.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Border>
);
