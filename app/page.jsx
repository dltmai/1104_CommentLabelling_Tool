"use client";

import { useState } from "react";
import FileUpload from "./components/FileUpload";
import DataDisplay from "./components/DataDisplay";
import { exportToExcel, getLabelingProgress } from "./utils/exportUtils";

export default function Home() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleDataLoad = (loadedData) => {
    setData(loadedData);
    setCurrentIndex(0);
    setIsDataLoaded(true);
  };

  const handleUpdateRow = (index, updatedRow) => {
    const newData = [...data];
    newData[index] = updatedRow;
    setData(newData);
  };

  const findNextUnlabeled = () => {
    // Find next summary group (after currentIndex) that contains any unlabeled row
    const currentSummary = data[currentIndex]?.Summary;

    const findStartOfSummary = (idx) => {
      const summary = data[idx]?.Summary;
      if (summary === undefined) return idx;
      return data.findIndex((r) => r.Summary === summary);
    };

    // iterate through indices after currentIndex, but skip within same summary
    let i = currentIndex + 1;
    let found = -1;
    while (i < data.length) {
      const s = data[i]?.Summary;
      if (s !== currentSummary) {
        const start = findStartOfSummary(i);
        const group = data.filter((r) => r.Summary === s);
        const hasUnlabeled = group.some(
          (row) =>
            row.Relevance === null ||
            row.Relevance === undefined ||
            row.Contribution === null ||
            row.Contribution === undefined ||
            row.Contribution_Score === null ||
            row.Contribution_Score === undefined
        );
        if (hasUnlabeled) {
          found = start;
          break;
        }
        // skip to end of this summary group
        const lastIndexOfGroup = data.map((r) => r.Summary).lastIndexOf(s);
        i = lastIndexOfGroup + 1;
      } else {
        i++;
      }
    }

    if (found !== -1) {
      setCurrentIndex(found);
      return;
    }

    // If not found, search from beginning
    i = 0;
    while (i < data.length) {
      const s = data[i]?.Summary;
      const start = findStartOfSummary(i);
      const group = data.filter((r) => r.Summary === s);
      const hasUnlabeled = group.some(
        (row) =>
          row.Relevance === null ||
          row.Relevance === undefined ||
          row.Contribution === null ||
          row.Contribution === undefined ||
          row.Contribution_Score === null ||
          row.Contribution_Score === undefined
      );
      if (hasUnlabeled) {
        setCurrentIndex(start);
        return;
      }
      const lastIndexOfGroup = data.map((r) => r.Summary).lastIndexOf(s);
      i = lastIndexOfGroup + 1;
    }
  };

  const handleExport = () => {
    exportToExcel(data, "labeled_data.xlsx");
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
            onExport={handleExport}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
