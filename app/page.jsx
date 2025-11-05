"use client";

import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataDisplay from "./components/DataDisplay";
import {
  exportToExcel,
  getLabelingProgress,
  exportToCSV,
  downloadJson,
  buildGroupedJson,
} from "./utils/exportUtils";

export default function Home() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [groupedJson, setGroupedJson] = useState(null);

  const handleDataLoad = (loadedData) => {
    setData(loadedData);
    setCurrentIndex(0);
    setIsDataLoaded(true);
    // Build grouped JSON (same shape as the Python converter)
    const grouped = buildGroupedJson(loadedData);
    setGroupedJson(grouped);
  };

  const handleUpdateRow = (index, updatedRow) => {
    // Merge incoming row updates with the existing row using a functional
    // state update to avoid race conditions when child components issue
    // multiple quick updates (e.g. Contribution then Contribution_Score).
    setData((prev) => {
      const next = [...prev];
      const existing = next[index] || {};
      next[index] = { ...existing, ...updatedRow };
      return next;
    });
  };

  const findNextUnlabeled = () => {
    // Build a list of unique summary groups preserving order with their
    // first index. Then start searching from the summary after the current one
    // and find the first group that contains any unlabeled row according to
    // the same per-row rules used in the UI.
    if (!data.length) return;

    const groups = [];
    const seen = new Set();
    for (let i = 0; i < data.length; i++) {
      const s = data[i]?.Summary ?? "";
      if (!seen.has(s)) {
        seen.add(s);
        groups.push({ summary: s, firstIndex: i });
      }
    }

    const isRowLabeled = (row) => {
      const relevanceSet =
        row.Relevance !== null && row.Relevance !== undefined;
      const contributionSet =
        row.Contribution !== null && row.Contribution !== undefined;
      if (!relevanceSet || !contributionSet) return false;
      if (Number(row.Contribution) === 1) {
        return (
          row.Contribution_Score !== null &&
          row.Contribution_Score !== undefined &&
          Number(row.Contribution_Score) > 0
        );
      }
      return true;
    };

    const currentSummary = data[currentIndex]?.Summary ?? "";
    const currentGroupPos = groups.findIndex(
      (g) => g.summary === currentSummary
    );
    const startPos = currentGroupPos === -1 ? 0 : currentGroupPos + 1;

    const findUnlabeledFrom = (pos) => {
      for (let gi = pos; gi < groups.length; gi++) {
        const { summary, firstIndex } = groups[gi];
        const groupRows = data.filter((r) => r.Summary === summary);
        const hasUnlabeled = groupRows.some((row) => !isRowLabeled(row));
        if (hasUnlabeled) return firstIndex;
      }
      return -1;
    };

    // Search forward from the next summary, then wrap and search from start
    let foundIndex = findUnlabeledFrom(startPos);
    if (foundIndex === -1 && startPos > 0) {
      foundIndex = findUnlabeledFrom(0);
    }

    if (foundIndex !== -1) setCurrentIndex(foundIndex);
  };

  const handleExportExcel = () => {
    exportToExcel(data, "labeled_data.xlsx");
  };

  const handleExportCSV = () => {
    exportToCSV(data, "labeled_data.csv");
  };

  const handleDownloadJSON = () => {
    const grouped = groupedJson ?? buildGroupedJson(data);
    downloadJson(grouped, "Hung_comment_labeling.json");
  };

  const handlePrevious = () => {
    if (!data.length) return;
    const currentSummary = data[currentIndex]?.Summary;
    // find previous index where Summary changes
    let i = currentIndex - 1;
    while (i >= 0 && data[i]?.Summary === currentSummary) {
      i--;
    }
    if (i < 0) return; // no previous summary
    // i is now at last index of previous summary; find its first index
    const prevSummary = data[i]?.Summary;
    const firstIndex = data.findIndex((r) => r.Summary === prevSummary);
    if (firstIndex !== -1) setCurrentIndex(firstIndex);
  };

  const handleNext = () => {
    if (!data.length) return;
    const currentSummary = data[currentIndex]?.Summary;
    // find first index after currentIndex whose Summary differs
    let i = currentIndex + 1;
    while (i < data.length && data[i]?.Summary === currentSummary) {
      i++;
    }
    if (i >= data.length) return; // no next summary
    // i is at first index of next summary (by construction)
    setCurrentIndex(i);
  };

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header removed per request */}

        {!isDataLoaded ? (
          <FileUpload onDataLoad={handleDataLoad} />
        ) : (
          <DataDisplay
            data={data}
            currentIndex={currentIndex}
            onUpdateRow={handleUpdateRow}
            onFindNext={findNextUnlabeled}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onDownloadJSON={handleDownloadJSON}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
