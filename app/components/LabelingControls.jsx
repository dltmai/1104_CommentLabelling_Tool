"use client";

export default function LabelingControls({
  relevance,
  contribution,
  contributionScore,
  onRelevanceChange,
  onContributionChange,
  onContributionScoreChange,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Relevance
        </label>
        <select
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          value={relevance !== null && relevance !== undefined ? relevance : ""}
          onChange={(e) => {
            const value = e.target.value;
            onRelevanceChange(value === "" ? null : parseInt(value));
          }}
        >
          <option value="">Select Relevance</option>
          <option value={0}>0 - Mapping</option>
          <option value={1}>1 - Not Mapping</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contribution
        </label>
        <select
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          value={
            contribution !== null && contribution !== undefined
              ? contribution
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;
            onContributionChange(value === "" ? null : parseInt(value));
          }}
        >
          <option value="">Select Contribution</option>
          <option value={0}>0 - Generic</option>
          <option value={1}>1 - Constructive</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Contribution Score (1-10)
        </label>
        <select
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          value={
            contributionScore !== null && contributionScore !== undefined
              ? contributionScore
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;
            onContributionScoreChange(value === "" ? null : parseInt(value));
          }}
        >
          <option value="">Select Score</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
