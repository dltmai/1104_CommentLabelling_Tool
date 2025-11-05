import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (data, filename = "labeled_data.xlsx") => {
  // Tạo worksheet từ dữ liệu
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Tạo workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Labeled Data");

  // Xuất file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
};

export const getLabelingProgress = (data) => {
  const total = data.length;
  const labeled = data.filter(
    (row) => row.Relevance !== undefined && row.Contribution !== undefined
  ).length;
  const unlabeled = total - labeled;

  return {
    total,
    labeled,
    unlabeled,
    progress: total > 0 ? (labeled / total) * 100 : 0,
  };
};

// Export current data rows back to CSV with expected headers
export const exportToCSV = (
  data,
  filename = "labeled_data.csv"
) => {
  const headers = [
    "Summary_File",
    "Similarity_Score",
    "Reference_Summary",
    "Generated_Summary",
    "Summary",
    "Comment",
    "Relevance",
    "Contribution",
    "Contribution_Score",
  ];

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";
    const s = String(value);
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replaceAll('"', '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const rows = data.map((row) =>
    headers
      .map((h) => escapeCsv(row[h]))
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
};

// Download an arbitrary JSON object as a file
export const downloadJson = (obj, filename = "data.json") => {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  saveAs(blob, filename);
};

// Build grouped JSON (like the Python script) from flat rows
export const buildGroupedJson = (rows) => {
  const groups = new Map();
  let totalRows = 0;
  for (const r of rows) {
    totalRows += 1;
    const key = r.Summary_File || "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      summary_file: r.Summary_File,
      similarity_score:
        r.Similarity_Score === null || r.Similarity_Score === ""
          ? null
          : Number(r.Similarity_Score),
      reference_summary: r.Reference_Summary,
      generated_summary: r.Generated_Summary,
      summary: r.Summary,
      comment: r.Comment,
      relevance: r.Relevance,
      contribution: r.Contribution,
    });
  }

  const items = [];
  const multi = [];
  for (const [key, list] of groups.entries()) {
    const base = list[0] || {};
    const sim = list
      .map((x) => x.similarity_score)
      .filter((v) => v !== null && !Number.isNaN(v));
    const avg = sim.length
      ? Math.round((sim.reduce((a, b) => a + b, 0) / sim.length) * 1e6) / 1e6
      : null;

    const comments = list.map((x) => ({
      comment: x.comment,
      relevance: x.relevance,
      contribution: x.contribution,
    }));

    const item = {
      summary_file: base.summary_file,
      reference_summary: base.reference_summary,
      generated_summary: base.generated_summary,
      summary: base.summary,
      average_similarity_score: avg,
      comments,
      comment_count: list.length,
      has_multiple_comments: list.length > 1,
    };
    items.push(item);
    if (item.has_multiple_comments) multi.push(item.summary_file);
  }

  return {
    items,
    multi_comment_summaries: multi,
    totals: {
      rows: totalRows,
      groups: items.length,
      multi_comment_groups: multi.length,
    },
  };
};