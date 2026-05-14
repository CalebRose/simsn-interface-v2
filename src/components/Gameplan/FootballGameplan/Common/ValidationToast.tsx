import React, { useState } from 'react';
import { Text } from '../../../../_design/Typography';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationToastProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  isValid: boolean;
  contextName?: string;
}

const ValidationToast: React.FC<ValidationToastProps> = ({
  errors,
  warnings,
  isValid,
  contextName = 'Validation'
}) => {
  const [expandedErrors, setExpandedErrors] = useState(false);
  const [expandedWarnings, setExpandedWarnings] = useState(false);

  if (isValid && errors.length === 0 && warnings.length === 0) {
    return (
      <div className="fixed sm:top-4 top-5 right-20 sm:right-24 z-50 max-w-sm">
        <div className="bg-green-900 bg-black/90 border border-green-500 rounded-lg p-3 shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full shrink-0" />
            <Text variant="xs" classes="text-green-300 font-semibold">
              ✓ {contextName} Valid
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (errors.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {errors.length > 0 && (
        <div className="bg-red-900 bg-black/90 border border-red-500 rounded-lg p-3 shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
            <Text variant="small" classes="text-red-300 font-semibold">
              {errors.length} {contextName} Issue{errors.length > 1 ? 's' : ''}
            </Text>
          </div>
          <div className={`overflow-y-auto transition-all duration-200 ${expandedErrors ? 'max-h-96' : 'max-h-32'}`}>
            {expandedErrors || errors.length <= 3 ? (
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                    <Text variant="xs" classes="text-red-200 leading-relaxed">
                      {error.message}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text variant="xs" classes="text-red-200 leading-relaxed">
                {errors.slice(0, 2).map(e => e.message).join(', ')} and {errors.length - 2} more...
              </Text>
            )}
          </div>
          {errors.length > 3 && (
            <button
              onClick={() => setExpandedErrors(!expandedErrors)}
              className="mt-2 text-red-400 hover:text-red-300 transition-colors duration-200"
            >
              <Text variant="xs" classes="underline">
                {expandedErrors ? 'Show less' : `Show all ${errors.length} issues`}
              </Text>
            </button>
          )}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="bg-yellow-900 bg-black/90 border border-yellow-500 rounded-lg p-3 shadow-lg backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full shrink-0" />
            <Text variant="small" classes="text-yellow-300 font-semibold">
              {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
            </Text>
          </div>
          <div className={`overflow-y-auto transition-all duration-200 ${expandedWarnings ? 'max-h-96' : 'max-h-32'}`}>
            {expandedWarnings || warnings.length <= 3 ? (
              <div className="space-y-1">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1.5 shrink-0" />
                    <Text variant="xs" classes="text-yellow-200 leading-relaxed">
                      {warning.message}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text variant="xs" classes="text-yellow-200 leading-relaxed">
                {warnings.slice(0, 2).map(w => w.message).join(', ')} and {warnings.length - 2} more...
              </Text>
            )}
          </div>
          {warnings.length > 3 && (
            <button
              onClick={() => setExpandedWarnings(!expandedWarnings)}
              className="mt-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
            >
              <Text variant="xs" classes="underline">
                {expandedWarnings ? 'Show less' : `Show all ${warnings.length} warnings`}
              </Text>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidationToast;