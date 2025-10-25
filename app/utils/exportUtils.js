import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const exportToExcel = (data, filename = "labeled_data.xlsx") => {
  // Sanitize data before export: normalize numeric strings to numbers and
  // ensure that if Contribution_Score === 0 we set Contribution = 0 so exported
  // file reflects the UI intention.
  const sanitized = data.map((r) => {
    const row = { ...r };
    // normalize Contribution
    if (typeof row.Contribution === "string") {
      const p = parseInt(row.Contribution);
      row.Contribution = isNaN(p) ? row.Contribution : p;
    }
    // normalize Contribution_Score
    if (typeof row.Contribution_Score === "string") {
      const p = parseInt(row.Contribution_Score);
      row.Contribution_Score = isNaN(p) ? row.Contribution_Score : p;
    }
    // If score is explicitly 0, ensure Contribution is 0
    if (row.Contribution_Score === 0) {
      row.Contribution = 0;
    }
    return row;
  });

  // Tạo worksheet từ dữ liệu
  const worksheet = XLSX.utils.json_to_sheet(sanitized);

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
