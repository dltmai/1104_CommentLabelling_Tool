"use client";

import { useState, useEffect } from "react";
import ExpandableSection from "./ExpandableSection";
import LabelingControls from "./LabelingControls";
import NavigationControls from "./NavigationControls";

export default function DataDisplay({
  data,
  currentIndex,
  onUpdateRow,
  onFindNext,
  onExport,
  onPrevious,
  onNext,
}) {
  const [expandedSections, setExpandedSections] = useState({
    summary: false,
  });

  const currentRow = data[currentIndex];
  if (!currentRow) return null;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Collapse summary when currentIndex changes (navigation happened)
  useEffect(() => {
    setExpandedSections((prev) => ({ ...prev, summary: false }));
  }, [currentIndex]);

  const collapseSummary = () => {
    setExpandedSections((prev) => ({ ...prev, summary: false }));
  };

  // Wrap navigation callbacks so summary auto-collapses when user navigates
  const handleFindNextInternal = () => {
    collapseSummary();
    if (onFindNext) onFindNext();
  };

  const handlePreviousInternal = () => {
    collapseSummary();
    if (onPrevious) onPrevious();
  };

  const handleNextInternal = () => {
    collapseSummary();
    if (onNext) onNext();
  };

  const handleLabelUpdate = (field, value) => {
    const updatedRow = { ...currentRow, [field]: value };
    onUpdateRow(currentIndex, updatedRow);
  };

  // Debug: Log current row values
  console.log("Current row:", {
    Relevance: currentRow.Relevance,
    Contribution: currentRow.Contribution,
    RelevanceType: typeof currentRow.Relevance,
    ContributionType: typeof currentRow.Contribution,
  });

  const isCurrentRowLabeled =
    currentRow.Relevance !== null &&
    currentRow.Relevance !== undefined &&
    currentRow.Contribution !== null &&
    currentRow.Contribution !== undefined;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              onClick={handleFindNextInternal}
            >
              <span>🔍</span>
              Find Next Unlabeled
            </button>
            <button
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              onClick={onExport}
            >
              <span>📊</span>
              Export Excel
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Row {currentIndex + 1} of {data.length}
              </h3>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isCurrentRowLabeled
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                }`}
              >
                {isCurrentRowLabeled ? "✓ Labeled" : "⚠️ Needs Labeling"}
              </div>
            </div>

            {/* Removed Summary File and Similarity Score fields per UI update request */}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[80px]">
                <p className="text-gray-900 dark:text-white">
                  {currentRow.Comment || "No comment"}
                </p>
              </div>
            </div>
          </div>

          <ExpandableSection
            title="Summary"
            isExpanded={expandedSections.summary}
            onToggle={() => toggleSection("summary")}
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 whitespace-pre-wrap">
              {currentRow.Summary || "No summary available"}
            </div>
          </ExpandableSection>

          <LabelingControls
            relevance={currentRow.Relevance}
            contribution={currentRow.Contribution}
            onRelevanceChange={(value) => handleLabelUpdate("Relevance", value)}
            onContributionChange={(value) =>
              handleLabelUpdate("Contribution", value)
            }
          />
        </div>

        <NavigationControls
          currentIndex={currentIndex}
          totalRows={data.length}
          onPrevious={handlePreviousInternal}
          onNext={handleNextInternal}
        />
      </div>
    </div>
  );
}
