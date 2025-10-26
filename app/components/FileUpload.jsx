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

        // Chuyển đổi dữ liệu thành format mong muốn (hỗ trợ cả header-based và positional)
        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1);

        // Normalize header names for detection. Create a normalized key that
        // removes non-alphanumeric characters so headers like "ContributionScore",
        // "Contribution Score" or "contribution_score" all match.
        const normalizeKey = (s) =>
          (s || "")
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
        const normalizedHeaders = headers.map((h) => normalizeKey(h));

        const findHeaderIndex = (names, fallbackIndex) => {
          const normalizedNames = names.map((n) => normalizeKey(n));
          for (let i = 0; i < normalizedHeaders.length; i++) {
            const h = normalizedHeaders[i];
            if (!h) continue;
            // Strict equality on normalized header names to avoid accidental
            // substring matches (e.g. 'similarityscore' matching 'score').
            for (const nn of normalizedNames) {
              if (h === nn) return i;
            }
          }
          return fallbackIndex;
        };

        // Known header name candidates for each field
        const idxSummaryFile = findHeaderIndex(
          ["summary_file", "summary file"],
          0
        );
        const idxSimilarity = findHeaderIndex(
          ["similarity_score", "similarity score"],
          1
        );
        const idxReferenceSummary = findHeaderIndex(
          ["reference_summary", "reference summary"],
          2
        );
        const idxGeneratedSummary = findHeaderIndex(
          ["generated_summary", "generated summary"],
          3
        );
        const idxSummary = findHeaderIndex(["summary"], 4);
        const idxComment = findHeaderIndex(["comment", "comments"], 5);
        const idxRelevance = findHeaderIndex(["relevance"], 6);
        const idxContribution = findHeaderIndex(["contribution"], 7);
        const idxContributionScore = findHeaderIndex(
          ["contribution_score", "contribution score", "score"],
          8
        );

        const parseIntOrNull = (v) => {
          if (v === undefined || v === null) return null;
          const s = String(v).trim();
          if (s === "") return null;
          const n = parseInt(s, 10);
          return Number.isNaN(n) ? null : n;
        };

        // Normalize imported contribution scores into 1-10 range.
        // Heuristics:
        // - If value is between 1 and 10, keep as-is.
        // - If value is between 10 and 100 and is a multiple of 10, assume it's a percent and map 100->10, 80->8, etc.
        // - Otherwise clamp values >10 down to 10 and values <1 to null.
        const normalizeScore = (n) => {
          if (n === null || n === undefined) return null;
          if (typeof n !== "number") return null;
          if (n >= 1 && n <= 10) return n;
          if (n > 10 && n <= 100 && n % 10 === 0)
            return Math.max(1, Math.min(10, Math.round(n / 10)));
          if (n > 10) return 10;
          return null;
        };

        const processedData = rows
          .map((row) => {
            const get = (i) => (row[i] !== undefined ? row[i] : "");
            return {
              Summary_File: get(idxSummaryFile) || "",
              Similarity_Score: parseFloat(get(idxSimilarity)) || 0,
              Reference_Summary: get(idxReferenceSummary) || "",
              Generated_Summary: get(idxGeneratedSummary) || "",
              Summary: get(idxSummary) || "",
              Comment: get(idxComment) || "",
              Relevance: parseIntOrNull(get(idxRelevance)),
              Contribution: parseIntOrNull(get(idxContribution)),
              Contribution_Score: normalizeScore(
                parseIntOrNull(get(idxContributionScore))
              ),
            };
          })
          .filter((row) => row.Summary_File); // Lọc bỏ các dòng trống

        // Sort processedData by Summary_File (trim + numeric-aware) so the UI
        // displays groups consistently after upload.
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
