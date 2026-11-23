# Quy tắc Bắt buộc: Đồng bộ Hệ thống Cây Liên kết Thông tin Dự án (Link-Tree Sync Rule)

## 1. Nguyên tắc Cốt lõi (Mandatory Rule)
Dự án **Hệ thống quản lý công việc và tiến độ đồ án môn học** duy trì hệ thống **Cây Liên kết Thông tin (Knowledge & Link Trees)** tại:
- [CAY-LIEN-KET-HE-THONG.md](./CAY-LIEN-KET-HE-THONG.md)

**QUY ĐỊNH BẮT BUỘC CHO MỌI CẬP NHẬT:**
Khi bất kỳ ai (AI Agent hoặc Thành viên nhóm) cập nhật dự án ở **bất kỳ dạng nào** (Chức năng, Giao diện React, REST API, Bảng CSDL/Seed SQLite, Hình ảnh Chibi, Tài liệu đặc tả, UML hay Báo cáo):
1. **BẮT BUỘC phải cập nhật đồng bộ ngay lập tức vào file `CAY-LIEN-KET-HE-THONG.md`** ở tất cả các cây liên kết thành phần liên quan (Cây Rút gọn, Cây Chức năng, Cây Database BCNF, Cây Kiến trúc & API, Cây Giao diện & Chibi, Cây Hồ sơ Báo cáo) VÀ **Cây 7: Cây Liên kết Tổng hợp Toàn Hệ thống** ở cuối file.
2. **Bảo toàn CSDL Chuẩn BCNF:** Tuyệt đối giữ vững cấu trúc 9 bảng vật lý chuẩn BCNF (`03-csdl/07-schema-sql-du-kien.md` & `src/db/schema.sql`) để bảo vệ tính đúng đắn của tập 20 thuộc tính $Q$, 8 phụ thuộc hàm $F$ và bảng Tableau $20 \times 8$.
3. Không một tác vụ chỉnh sửa nào được coi là hoàn tất nếu `CAY-LIEN-KET-HE-THONG.md` chưa phản ánh chính xác trạng thái mới nhất của hệ thống.
