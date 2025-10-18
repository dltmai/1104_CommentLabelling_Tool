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
