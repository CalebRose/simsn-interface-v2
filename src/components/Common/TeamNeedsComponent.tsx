import React from "react";
import { Text } from "../../_design/Typography";
export const TeamNeeds = ({
  rosterByPositionAndYear,
}: {
  rosterByPositionAndYear: Record<string, Record<string, any[]>>;
}) => {
  return (
    <>
      <div className="grid grid-cols-6 border-b border-slate-500">
        <Text variant="xs">Pos.</Text>
        <Text variant="xs">Fr.</Text>
        <Text variant="xs">So.</Text>
        <Text variant="xs">Jr.</Text>
        <Text variant="xs">Sr.</Text>
        <Text variant="xs">5th</Text>
      </div>
      {Object.entries(rosterByPositionAndYear).map(([position, years]) => (
        <div
          key={position}
          className="grid grid-cols-6 border-b border-slate-700"
        >
          <Text variant="xs">{position}</Text>
          <Text variant="xs">{years["1"]?.length || 0}</Text>
          <Text variant="xs">{years["2"]?.length || 0}</Text>
          <Text variant="xs">{years["3"]?.length || 0}</Text>
          <Text variant="xs">{years["4"]?.length || 0}</Text>
          <Text variant="xs">{years["5"]?.length || 0}</Text>
        </div>
      ))}
    </>
  );
};
