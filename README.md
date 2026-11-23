# Hệ thống quản lý công việc và tiến độ đồ án môn học

Đồ án cơ sở — Chuyên ngành Công nghệ phần mềm.

> 🌳 **BẢN ĐỒ CÂY LIÊN KẾT TOÀN HỆ THỐNG:** Xem chi tiết 7 Cây Liên kết (Rút gọn, Chức năng, Database BCNF, Hệ thống & API, Giao diện Chibi, Hồ sơ Báo cáo & **Cây Liên kết Tổng hợp Cuối cùng**) tại **[CAY-LIEN-KET-HE-THONG.md](./CAY-LIEN-KET-HE-THONG.md)**.  
> 📜 **Quy tắc Bắt buộc (Workspace Rule):** Xem tại **[AGENTS.md](./AGENTS.md)** — Bất kỳ ai cập nhật dự án ở bất kỳ dạng nào đều **bắt buộc cập nhật đồng bộ vào `CAY-LIEN-KET-HE-THONG.md`**.

## Thông tin
| Hạng mục | Nội dung |
|---|---|
| Đề tài | Hệ thống quản lý công việc và tiến độ đồ án môn học |
| Ngành | Công nghệ thông tin |
| Chuyên ngành | Công nghệ phần mềm |
| Sinh viên | Đỗ Minh Trực (2180606023 – 21DTHC5), Trần Minh Duy (2280600494 – 22DTHE9) |
| GVHD | ThS. Bùi Phú Khuyên |
| Stack công nghệ | Frontend: React 19 + Vite \| Backend: Node.js (REST API) \| CSDL: SQLite (Engine cục bộ 9 bảng BCNF) / PostgreSQL (Thiết kế DDL) |
| Triển khai | Localhost (Port 4173 & 5173) |

## Cây Liên kết Rút gọn (Quick Navigation Tree)
```text
📦 HỆ THỐNG QUẢN LÝ CÔNG VIỆC VÀ TIẾN ĐỘ ĐỒ ÁN MÔN HỌC
├── 🌳 Bản đồ 7 Cây Liên kết Trung tâm: CAY-LIEN-KET-HE-THONG.md
├── 📜 Quy tắc đồng bộ bắt buộc: AGENTS.md & ../.agents/rules/cay-lien-ket.md
├── 📋 00-ke-hoach/ ──> THONG-TIN-NGHIEP-VU.md (Chốt nghiệp vụ gốc)
├── 🎯 01-dac-ta/   ──> 03-yeu-cau-chuc-nang.md (28 FR), 05-pham-vi-mvp.md, 06-actor-vai-tro.md
├── 📐 02-uml/      ──> Use Case, Class Diagram, Sequence Diagram, Activity Diagram
├── 🗄️ 03-csdl/     ──> 20 thuộc tính Q, 8 PTH F, Chuẩn hóa BCNF, Tableau 20x8, 07-schema-sql-du-kien.md
├── 🗺️ 04-thiet-ke-he-thong/ ──> 01-kien-truc.md, 02-api-du-kien.md, 04-luoc-do-thong-tin-va-kich-ban-bao-ve.md
└── 💻 07-nguon-code/demo-giao-dien/ ──> Ứng dụng Fullstack (server.js + dacs.sqlite + 14 React Components: Cổng Môn học GVPTMH & Sinh viên + Workspace Kanban)
```

## Hướng dẫn chạy ứng dụng
```bash
# 1. Di chuyển vào thư mục demo giao diện
cd 07-nguon-code/demo-giao-dien

# 2. Cài đặt các gói phụ thuộc (React, Vite)
npm install

# 3. Build giao diện & Chạy ứng dụng Fullstack (React App + SQLite API)
npm run build
npm start
# -> Mở trình duyệt truy cập: http://localhost:4173
```
