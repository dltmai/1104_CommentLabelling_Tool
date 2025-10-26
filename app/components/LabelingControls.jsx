"use client";

import { useEffect, useState } from "react";

export default function LabelingControls({
  relevance,
  contribution,
  contributionScore,
  onRelevanceChange,
  onContributionChange,
  onContributionScoreChange,
}) {
  /* showScore and gridCols computed from localContribution below (after local state sync)
    so the score field hides immediately when the user switches to Generic. */

  // Local state mirrors props so the select updates immediately in the UI
  // even if parent update is asynchronous. We keep it synced with props.
  const [localContribution, setLocalContribution] = useState(
    contribution !== null && contribution !== undefined
      ? String(contribution)
      : ""
  );
  const [localScore, setLocalScore] = useState(
    contributionScore !== null && contributionScore !== undefined
      ? String(contributionScore)
      : ""
  );
  const [localRelevance, setLocalRelevance] = useState(
    relevance !== null && relevance !== undefined ? String(relevance) : ""
  );

  // sync props -> local state
  useEffect(() => {
    setLocalContribution(
      contribution !== null && contribution !== undefined
        ? String(contribution)
        : ""
    );
  }, [contribution]);
  useEffect(() => {
    setLocalScore(
      contributionScore !== null && contributionScore !== undefined
        ? String(contributionScore)
        : ""
    );
  }, [contributionScore]);
  useEffect(() => {
    setLocalRelevance(
      relevance !== null && relevance !== undefined ? String(relevance) : ""
    );
  }, [relevance]);

  // Decide whether to show the score input based on the local selection so
  // the field hides immediately when the user switches to Generic.
  const showScore = Number(localContribution) === 1;
  const gridCols = showScore ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-6 mb-6`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Relevance
        </label>
        <select
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          value={localRelevance}
          onChange={(e) => {
            const value = e.target.value;
            setLocalRelevance(value);
            onRelevanceChange(value === "" ? null : parseInt(value));
          }}
        >
          <option value="">Select Relevance</option>
          <option value="0">0 - Mapping</option>
          <option value="1">1 - Not Mapping</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contribution
        </label>
        <select
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          value={localContribution}
          onChange={(e) => {
            const value = e.target.value;
            const parsed = value === "" ? null : parseInt(value);
            setLocalContribution(value);
            // Ensure we always send an explicit 0 when the user selected the
            // "0" option, avoid any ambiguity from parsed === null.
            const toSend = value === "0" ? 0 : parsed;
            console.log("LabelingControls:onContributionChange", {
              value,
              parsed,
              toSend,
            });
            onContributionChange(toSend);

            if (parsed === 0) {
              // If user selects Generic (0), explicitly set score to 0 (marker)
              // and keep it hidden. Use 0 to represent generic.
              setLocalScore("0");
              onContributionScoreChange && onContributionScoreChange(0);
            } else if (parsed === 1) {
              // If user selects Constructive (1), clear any previous score
              // (e.g. leftover 0) so user must actively pick a 1-10 value.
              setLocalScore("");
              onContributionScoreChange && onContributionScoreChange(null);
            } else {
              // If empty or unexpected -> clear score
              setLocalScore("");
              onContributionScoreChange && onContributionScoreChange(null);
            }
          }}
        >
          <option value="">Select Contribution</option>
          <option value="0">0 - Generic</option>
          <option value="1">1 - Constructive</option>
        </select>
      </div>

      {showScore && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contribution Score (1-10)
          </label>
          <select
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            value={localScore}
            onChange={(e) => {
              const value = e.target.value;
              setLocalScore(value);
              console.log("LabelingControls:onContributionScoreChange", {
                value,
              });
              onContributionScoreChange(value === "" ? null : parseInt(value));
            }}
          >
            <option value="">Select Score</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
