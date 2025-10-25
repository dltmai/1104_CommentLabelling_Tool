"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

export default function FileUpload({ onDataLoad }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Chuyển đổi dữ liệu thành format mong muốn
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        let processedData = rows
          .map((row, index) => ({
            Summary_File: row[0] || "",
            Similarity_Score: parseFloat(row[1]) || 0,
            Reference_Summary: row[2] || "",
            Generated_Summary: row[3] || "",
            Summary: row[4] || "",
            Comment: row[5] || "",
            Relevance:
              row[6] !== undefined &&
              row[6] !== null &&
              row[6] !== "" &&
              !isNaN(parseInt(row[6]))
                ? parseInt(row[6])
                : null,
            Contribution:
              row[7] !== undefined &&
              row[7] !== null &&
              row[7] !== "" &&
              !isNaN(parseInt(row[7]))
                ? parseInt(row[7])
                : null,
            // Map Contribution_Score if present (column 9 / index 8)
            Contribution_Score:
              row[8] !== undefined &&
              row[8] !== null &&
              row[8] !== "" &&
              !isNaN(parseInt(String(row[8]).trim()))
                ? parseInt(String(row[8]).trim())
                : null,
          }))
          .filter((row) => row.Summary_File); // Lọc bỏ các dòng trống
        // Sort by Summary_File (trimmed, numeric-aware where possible) so the UI
        // displays rows grouped consistently for the user.
        processedData.sort((a, b) =>
          (a.Summary_File || "")
            .toString()
            .trim()
            .localeCompare(
              (b.Summary_File || "").toString().trim(),
              undefined,
              { numeric: true, sensitivity: "base" }
            )
        );

        onDataLoad(processedData);
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Có lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.");
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(
      (file) =>
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".csv")
    );

    if (excelFile) {
      handleFile(excelFile);
    } else {
      alert("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
            Upload Excel File
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Upload file Excel chứa dữ liệu cần gán nhãn với các cột:
            Summary_File, Similarity_Score, Reference_Summary,
            Generated_Summary, Summary, Comment, Relevance, Contribution
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Đang xử lý file...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl text-gray-400 dark:text-gray-500">
                📁
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kéo thả file Excel vào đây hoặc click để chọn file
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hỗ trợ định dạng: .xlsx, .xls, .csv
                </p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}
