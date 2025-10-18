# Data Labeling Web App

Ứng dụng web gán nhãn dữ liệu được xây dựng với Next.js, cho phép người dùng upload file Excel và gán nhãn cho dữ liệu.

## Tính năng

- **Upload Excel**: Hỗ trợ upload file Excel (.xlsx, .xls) hoặc CSV
- **Hiển thị dữ liệu**: Hiển thị các cột Summary_File, Similarity_Score, Reference_Summary, Generated_Summary, Summary, Comment
- **Expand/Collapse**: Cho phép mở rộng hoặc thu gọn các phần Summary, Reference Summary, Generated Summary
- **Gán nhãn**:
  - Relevance: 0-Mapping, 1-Not mapping
  - Contribution: 0-Generic, 1-Constructive
- **Navigation**:
  - Find Next: Tìm dòng chưa gán nhãn tiếp theo
  - Previous/Next: Điều hướng giữa các dòng
- **Export**: Xuất file Excel sau khi gán nhãn

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install
```

2. Chạy ứng dụng:

```bash
npm run dev
```

3. Mở trình duyệt và truy cập `http://localhost:3000`

## Cấu trúc dữ liệu Excel

File Excel cần có các cột sau:

- Summary_File
- Similarity_Score
- Reference_Summary
- Generated_Summary
- Summary
- Comment
- Relevance (tùy chọn - sẽ được gán trong ứng dụng)
- Contribution (tùy chọn - sẽ được gán trong ứng dụng)

## Sử dụng

1. Upload file Excel chứa dữ liệu cần gán nhãn
2. Xem dữ liệu hiển thị với các phần có thể expand/collapse
3. Gán nhãn Relevance và Contribution cho từng dòng
4. Sử dụng "Find Next" để tìm dòng chưa gán nhãn
5. Sử dụng "Export Excel" để xuất file sau khi hoàn thành gán nhãn
