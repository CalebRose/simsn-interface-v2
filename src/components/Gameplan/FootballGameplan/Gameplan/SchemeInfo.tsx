import React from 'react';
import { Text } from '../../../../_design/Typography';
import { FormationMap, SchemeData } from '../Constants/GameplanConstants';

export interface SchemeInfoProps {
  scheme: string;
  showRanges?: boolean;
  className?: string;
}

export const SchemeInfo: React.FC<SchemeInfoProps> = ({
  scheme,
  showRanges = false,
  className = ''
}) => {
  const schemeData: SchemeData | undefined = FormationMap[scheme];

  if (!schemeData) {
    return (
      <div className={`bg-gray-800 bg-black/50 rounded-lg p-3 ${className}`}>
        <Text variant="small" classes="text-gray-400">
          No information available for this scheme.
        </Text>
      </div>
    );
  }

  const { SchemeFits, BadFits, Notes, Strengths, Weaknesses, Ranges } = schemeData;

  return (
    <div className={`bg-gray-800 bg-black/50 rounded-lg p-3 space-y-3 ${className}`}>
      <div>
        <Text variant="small" classes="text-green-400 font-semibold mb-1">
          Scheme Fits:
        </Text>
        <Text variant="small" classes="text-gray-300">
          {SchemeFits.join(', ')}
        </Text>
      </div>
      <div>
        <Text variant="small" classes="text-red-400 font-semibold mb-1">
          Bad Fits:
        </Text>
        <Text variant="small" classes="text-gray-300">
          {BadFits.join(', ')}
        </Text>
      </div>
      {Strengths && Strengths.length > 0 && (
        <div>
          <Text variant="small" classes="text-blue-400 font-semibold mb-1">
            Strengths vs:
          </Text>
          <Text variant="small" classes="text-gray-300">
            {Strengths.join(', ')}
          </Text>
        </div>
      )}
      {Weaknesses && Weaknesses.length > 0 && (
        <div>
          <Text variant="small" classes="text-orange-400 font-semibold mb-1">
            Weaknesses vs:
          </Text>
          <Text variant="small" classes="text-gray-300">
            {Weaknesses.join(', ')}
          </Text>
        </div>
      )}
      {showRanges && Ranges && (
        <div>
          <Text variant="small" classes="text-purple-400 font-semibold mb-2">
            Play Type Ranges (0-100):
          </Text>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <Text variant="xs" classes="text-gray-400">
                Traditional Run: {Ranges.TraditionalRun.Min}-{Ranges.TraditionalRun.Max}
              </Text>
            </div>
            <div>
              <Text variant="xs" classes="text-gray-400">
                Option Run: {Ranges.OptionRun.Min}-{Ranges.OptionRun.Max}
              </Text>
            </div>
            <div>
              <Text variant="xs" classes="text-gray-400">
                RPO: {Ranges.RPO.Min}-{Ranges.RPO.Max}
              </Text>
            </div>
            <div>
              <Text variant="xs" classes="text-gray-400">
                Pass: {Ranges.Pass.Min}-{Ranges.Pass.Max}
              </Text>
            </div>
          </div>
        </div>
      )}
      {Notes && (
        <div>
          <Text variant="small" classes="text-yellow-400 font-semibold mb-1">
            Notes:
          </Text>
          <Text variant="small" classes="text-gray-300 italic">
            {Notes}
          </Text>
        </div>
      )}
    </div>
  );
};

export interface FormationInfoProps {
  formations: Array<{ name: string; positions: string[] }>;
  className?: string;
}

export const FormationInfo: React.FC<FormationInfoProps> = ({
  formations,
  className = ''
}) => {
  return (
    <div className={`bg-gray-800 bg-black/50 rounded-lg p-3 ${className}`}>
      <Text variant="small" classes="text-blue-400 font-semibold mb-2">
        Available Formations:
      </Text>
      <div className="space-y-2">
        {formations.map((formation, index) => (
          <div key={index} className="border-l-2 border-gray-600 pl-2">
            <Text variant="small" classes="text-white font-medium">
              {formation.name}
            </Text>
            <Text variant="xs" classes="text-gray-400">
              {formation.positions.join(', ')}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface OpposingSchemeInfoProps {
  opponentScheme: string;
  className?: string;
}

export const OpposingSchemeInfo: React.FC<OpposingSchemeInfoProps> = ({
  opponentScheme,
  className = ''
}) => {
  return (
    <div className={`bg-orange-900 bg-black/30 border border-orange-500 rounded-lg p-3 ${className} w-full`}>
      <Text variant="small" classes="text-orange-400 font-semibold mb-1">
        Opposing Scheme:
      </Text>
      <Text variant="body" classes="text-orange-300 font-bold">
        {opponentScheme}
      </Text>
      <Text variant="xs" classes="text-orange-200 mt-1">
        Adjust your defensive formations to counter this offensive scheme
      </Text>
    </div>
  );
};

export default SchemeInfo;