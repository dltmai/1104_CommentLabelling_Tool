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

  useEffect(() => {
    setExpandedSections((prev) => ({ ...prev, summary: false }));
  }, [currentIndex]);

  const collapseSummary = () => {
    setExpandedSections((prev) => ({ ...prev, summary: false }));
  };

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
    // Send a partial update (single-field) to the parent. Parent should merge
    // this with the existing row to avoid overwriting concurrent updates.
    const partial = { [field]: value };
    console.log("handleLabelUpdate (partial)", { field, value });
    if (typeof onUpdateRow === "function") {
      onUpdateRow(currentIndex, partial);
    } else {
      console.warn("onUpdateRow is not a function", onUpdateRow);
    }
  };

  const hasValue = (v) =>
    v !== null &&
    v !== undefined &&
    String(v).trim() !== "" &&
    String(v).toLowerCase() !== "null" &&
    String(v).toLowerCase() !== "undefined";

  // ✅ Logic xác định dòng đã được gán nhãn (chuẩn hoá kiểu trước khi kiểm tra)
  // - Relevance và Contribution là bắt buộc
  // - Nếu Contribution === 0 (Generic) -> chỉ cần Relevance + Contribution
  // - Nếu Contribution === 1 (Constructive) -> cần Contribution_Score trong [1..10]

  const contributionVal = currentRow.Contribution;
  const isCurrentRowLabeled = (() => {
    const relevanceSet = hasValue(currentRow.Relevance);
    const contributionSet = hasValue(contributionVal);

    // Debug: print the evaluated flags
    console.log("label-check", {
      relevance: currentRow.Relevance,
      contribution: contributionVal,
      score: currentRow.Contribution_Score,
      relevanceSet,
      contributionSet,
    });

    if (!relevanceSet || !contributionSet) return false;

    const contribNum = Number(contributionVal);
    if (!Number.isFinite(contribNum)) return false;

    if (contribNum === 1) {
      // Constructive: require score 1..10
      const scoreNum = Number(currentRow.Contribution_Score);
      return (
        Number.isFinite(scoreNum) &&
        Number.isInteger(scoreNum) &&
        scoreNum >= 1 &&
        scoreNum <= 10
      );
    }

    // For Generic (0) or other numeric values: Relevance+Contribution enough
    return true;
  })();

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

          <LabelingControls
            relevance={currentRow.Relevance}
            contribution={currentRow.Contribution}
            contributionScore={currentRow.Contribution_Score}
            onRelevanceChange={(value) => handleLabelUpdate("Relevance", value)}
            onContributionChange={(value) =>
              handleLabelUpdate("Contribution", value)
            }
            onContributionScoreChange={(value) =>
              handleLabelUpdate("Contribution_Score", value)
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
