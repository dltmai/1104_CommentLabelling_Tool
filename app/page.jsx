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
    console.log("handleUpdateRow called", { index, updatedRow });
    // Use functional state update to avoid races when multiple partial
    // updates arrive quickly (Contribution and Contribution_Score).
    setData((prev) => {
      const newData = [...prev];
      newData[index] = {
        ...(newData[index] || {}),
        ...(updatedRow || {}),
      };
      console.log("newData sample at index", index, newData[index]);
      return newData;
    });
  };

  const findNextUnlabeled = () => {
    const unlabeledIndex = data.findIndex(
      (row, index) =>
        index > currentIndex &&
        (row.Relevance === null ||
          row.Relevance === undefined ||
          row.Contribution === null ||
          row.Contribution === undefined)
    );
    if (unlabeledIndex !== -1) {
      setCurrentIndex(unlabeledIndex);
    } else {
      // Tìm từ đầu nếu không tìm thấy từ vị trí hiện tại
      const firstUnlabeled = data.findIndex(
        (row) =>
          row.Relevance === null ||
          row.Relevance === undefined ||
          row.Contribution === null ||
          row.Contribution === undefined
      );
      if (firstUnlabeled !== -1) {
        setCurrentIndex(firstUnlabeled);
      }
    }
  };

  const handleExport = () => {
    exportToExcel(data, "labeled_data.xlsx");
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
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
