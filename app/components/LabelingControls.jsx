"use client";

import { useState, useEffect } from "react";

export default function LabelingControls({
  relevance,
  contribution,
  contributionScore,
  onRelevanceChange,
  onContributionChange,
  onContributionScoreChange,
}) {
  // Helper: normalize incoming numeric-like values to integer string (or "")
  const normalizeToIntString = (v) => {
    if (v === null || v === undefined) return "";
    // handle numbers
    if (typeof v === "number") return String(Math.trunc(v));
    // handle strings: trim and parseInt
    if (typeof v === "string") {
      const t = v.trim();
      if (t === "") return "";
      const n = parseInt(t, 10);
      return Number.isNaN(n) ? "" : String(n);
    }
    return "";
  };

  // Local state so the UI responds instantly and avoids value-type hiccups
  const [localRelevance, setLocalRelevance] = useState(
    normalizeToIntString(relevance)
  );
  const [localContribution, setLocalContribution] = useState(
    normalizeToIntString(contribution)
  );
  const [localScore, setLocalScore] = useState(
    normalizeToIntString(contributionScore)
  );

  useEffect(() => {
    setLocalRelevance(normalizeToIntString(relevance));
  }, [relevance]);

  useEffect(() => {
    setLocalContribution(normalizeToIntString(contribution));
  }, [contribution]);

  useEffect(() => {
    setLocalScore(normalizeToIntString(contributionScore));
  }, [contributionScore]);

  // Show the score selector when Contribution is Constructive (1).
  // If Contribution is Generic but there's an existing non-zero imported score,
  // show it as read-only text instead of a select control.
  const showScoreSelect = localContribution === "1";
  const showScoreReadOnly =
    localContribution !== "1" && localScore !== "" && localScore !== "0";

  // Debug: trace props (remove once fixed)
  // console.log("LabelingControls props:", { relevance, contribution, contributionScore });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
            const parsed = value === "" ? null : parseInt(value);
            onRelevanceChange(parsed);
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
            setLocalContribution(value);
            const parsed = value === "" ? null : parseInt(value);
            console.log("LabelingControls:onContributionChange", {
              value,
              parsed,
            });
            onContributionChange(parsed);
            // if switched back to Generic, reset the score to 0 and hide the score
            // selector so the UI matches the Generic state.
            if (parsed === 0) {
              setLocalScore("0");
              onContributionScoreChange && onContributionScoreChange(0);
            }
            // if switched to Constructive and score is empty, keep score empty until user selects
          }}
        >
          <option value="">Select Contribution</option>
          <option value="0">0 - Generic</option>
          <option value="1">1 - Constructive</option>
        </select>
      </div>

      {showScoreSelect && (
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
      {showScoreReadOnly && (
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
            Contribution Score
          </label>
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
            {localScore}
          </div>
        </div>
      )}
    </div>
  );
}
