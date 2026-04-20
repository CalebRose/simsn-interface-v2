import { FC, memo } from "react";
import { Text } from "../../../../../_design/Typography";
import { Border } from "../../../../../_design/Borders";
import { formatEffectsSummary } from "../utils/playerModalUtils";
import type { PlayerInjuryHistoryEvent } from "../../../../../models/baseball/baseballStatsModels";

interface InjuriesTabProps {
  injuryHistory: PlayerInjuryHistoryEvent[];
  injuryLoading: boolean;
}

export const InjuriesTab: FC<InjuriesTabProps> = memo(
  ({ injuryHistory, injuryLoading }) => {
    if (injuryLoading) {
      return (
        <Border classes="p-3">
          <Text variant="small" classes="text-gray-400 py-4 text-center">
            Loading injury history...
          </Text>
        </Border>
      );
    }

    if (injuryHistory.length === 0) {
      return (
        <Border classes="p-3">
          <Text variant="small" classes="text-gray-400 py-4 text-center">
            No injury history found.
          </Text>
        </Border>
      );
    }

    return (
      <Border classes="p-3">
        <div className="baseball-table-wrapper overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                <th className="px-2 py-1 text-left">Injury</th>
                <th className="px-2 py-1 text-center">Source</th>
                <th className="px-2 py-1 text-center">Wk</th>
                <th className="px-2 py-1 text-center">Duration</th>
                <th className="px-2 py-1 text-center">Status</th>
                <th className="px-2 py-1 text-left">Effects</th>
                <th className="px-2 py-1 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {injuryHistory.map((evt) => (
                <tr
                  key={evt.event_id}
                  className="border-b border-gray-100 dark:border-gray-700"
                >
                  <td className="px-2 py-1.5">{evt.injury_name}</td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        evt.source === "pregame"
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {evt.source === "pregame" ? "Pre" : "In"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center text-gray-500">
                    {evt.season_week}
                    {evt.season_subweek ?? ""}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {evt.weeks_remaining > 0
                      ? `${evt.weeks_remaining}/${evt.weeks_assigned}w`
                      : `${evt.weeks_assigned}w`}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span
                      className={
                        evt.status === "active"
                          ? "text-red-600 dark:text-red-400 font-semibold"
                          : "text-green-600 dark:text-green-400"
                      }
                    >
                      {evt.status === "active" ? "Active" : "Healed"}
                    </span>
                  </td>
                  <td
                    className="px-2 py-1.5 text-gray-500 max-w-[140px] truncate"
                    title={formatEffectsSummary(evt.effects)}
                  >
                    {formatEffectsSummary(evt.effects) || "—"}
                  </td>
                  <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">
                    {evt.created_at?.split("T")[0] ?? evt.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Border>
    );
  },
);
