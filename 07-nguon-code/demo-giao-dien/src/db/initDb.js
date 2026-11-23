import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../dacs.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

console.log('[DB] Đang khởi tạo CSDL SQLite tại:', dbPath);

// Khởi tạo Database
const db = new DatabaseSync(dbPath);

// Bật khóa ngoại
db.exec('PRAGMA foreign_keys = ON;');

// Đọc và chạy schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);
console.log('[DB] Đã khởi tạo 9 bảng vật lý thành công.');

// Kiểm tra xem đã có dữ liệu gốc chưa
const userCount = db.prepare('SELECT COUNT(*) as count FROM nguoi_dung').get().count;

if (userCount === 0) {
  console.log('[DB] Đang nạp dữ liệu mẫu thực tế cho đồ án DACS...');

  // 1. NGUOI_DUNG
  const insertUser = db.prepare(`
    INSERT INTO nguoi_dung (ma_nguoi_dung, email, mat_khau_bam, ho_ten, vai_tro_he_thong, trang_thai_hoat_dong)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('u-gv-01', 'khuyenbp@gmail.com', '$2b$10$hashed_gv_pass_demo', 'ThS. Bùi Phú Khuyên', 'giangvien', 1);
  insertUser.run('u-sv-01', '2180606023@gmail.com', '$2b$10$hashed_truc_pass_demo', 'Đỗ Minh Trực', 'sinhvien', 1);
  insertUser.run('u-sv-02', '2280600494@gmail.com', '$2b$10$hashed_duy_pass_demo', 'Trần Minh Duy', 'sinhvien', 1);

  // 2. DO_AN
  const insertProject = db.prepare(`
    INSERT INTO do_an (ma_do_an, ten_do_an, loai_do_an, ten_mon_hoc, noi_dung_muc_tieu, tien_do_tong, trang_thai, ma_giang_vien)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProject.run(
    'da-dacs-01',
    'Hệ thống quản lý công việc và tiến độ đồ án môn học',
    'mon_hoc',
    'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    '[NHÓM 2-3 SV] Hệ thống web hỗ trợ sinh viên và giảng viên theo dõi sát sao tiến độ công việc, mốc bàn giao và đánh giá minh bạch theo từng giai đoạn.',
    65.0,
    'dang_thuc_hien',
    'u-gv-01'
  );

  // 3. NHOM
  db.prepare(`INSERT INTO nhom (ma_nhom, ma_do_an, ten_nhom) VALUES (?, ?, ?)`).run(
    'nhom-01', 'da-dacs-01', 'Nhóm Đồ án Môn học 05'
  );

  // 4. THANH_VIEN_NHOM
  const insertMember = db.prepare(`
    INSERT INTO thanh_vien_nhom (ma_thanh_vien_nhom, ma_nhom, ma_nguoi_dung, vai_tro_trong_nhom)
    VALUES (?, ?, ?, ?)
  `);
  insertMember.run('tvn-01', 'nhom-01', 'u-sv-01', 'nhom_truong');
  insertMember.run('tvn-02', 'nhom-01', 'u-sv-02', 'thanh_vien');

  // 5. MOC_TIEN_DO
  const insertMilestone = db.prepare(`
    INSERT INTO moc_tien_do (ma_moc, ma_do_an, ten_moc, han_hoan_thanh, trang_thai, noi_dung_mo_ta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertMilestone.run('moc-01', 'da-dacs-01', 'Mốc 1: Khảo sát nghiệp vụ & Đặc tả yêu cầu', '2026-09-25', 'hoan_thanh', 'Chốt phạm vi 8 use case cốt lõi, danh sách tác tử và quy tắc phân quyền nhóm.');
  insertMilestone.run('moc-02', 'da-dacs-01', 'Mốc 2: Phân tích & Chuẩn hóa CSDL BCNF', '2026-10-15', 'hoan_thanh', 'Xác định 20 thuộc tính, tập phụ thuộc hàm phủ tối thiểu, phân rã R1-R8 và bảng Tableau 20x8.');
  insertMilestone.run('moc-03', 'da-dacs-01', 'Mốc 3: Thiết kế Giao diện Demo & Kiến trúc API', '2026-10-30', 'chua_hoan_thanh', 'Thiết kế UI theo TasteSkill v2 và chuẩn bị các kịch bản báo cáo với GVHD.');
  insertMilestone.run('moc-04', 'da-dacs-01', 'Mốc 4: Lập trình MVP & Báo cáo đồ án', '2026-11-20', 'chua_hoan_thanh', 'Lập trình React + Node.js Express + SQLite local và viết tài liệu thuyết minh dacs.doc.');

  // 6. CONG_VIEC
  const insertTask = db.prepare(`
    INSERT INTO cong_viec (
      ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
      trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
      ma_nguoi_thuc_hien, ma_nguoi_tao, ma_nguoi_khoa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run('cv-01', 'da-dacs-01', 'moc-01', 'Khảo sát và lập bảng đặc tả yêu cầu chức năng (FR)', 'Hoàn thiện bảng đặc tả 8 use case chính và phân rã các bước tương tác tác tử.', 'hoan_thanh', 100.0, 1, '2026-09-20', 'u-sv-01', 'u-gv-01', 'u-gv-01');
  insertTask.run('cv-02', 'da-dacs-01', 'moc-01', 'Vẽ sơ đồ Use Case và Class Diagram phân tích', 'Đảm bảo tuân thủ quy tắc: thuộc tính là danh từ, phương thức là động từ hành động.', 'hoan_thanh', 100.0, 1, '2026-09-24', 'u-sv-02', 'u-sv-01', 'u-sv-01');
  insertTask.run('cv-03', 'da-dacs-01', 'moc-02', 'Tính toán phủ tối thiểu và tìm khóa bằng bao đóng', 'Tập Q gồm 20 thuộc tính A-W, chứng minh khóa chính duy nhất k = A.', 'hoan_thanh', 100.0, 1, '2026-10-05', 'u-sv-01', 'u-sv-01', 'u-gv-01');
  insertTask.run('cv-04', 'da-dacs-01', 'moc-02', 'Lập bảng Tableau 20x8 chứng minh Bảo toàn thông tin', 'Thuật toán Chase lấp đầy hàng R1 với các dấu tích, xác nhận không mất mát thông tin khi nối tự nhiên.', 'hoan_thanh', 100.0, 1, '2026-10-12', 'u-sv-02', 'u-sv-01', 'u-gv-01');
  insertTask.run('cv-05', 'da-dacs-01', 'moc-03', 'Xây dựng giao diện Demo Workspace theo TasteSkill v2', 'Bảng Kanban 4 cột, ngăn trượt chi tiết công việc, thanh chuyển vai trò để báo cáo GVHD.', 'dang_lam', 75.0, 0, '2026-10-25', 'u-sv-01', 'u-sv-01', null);
  insertTask.run('cv-06', 'da-dacs-01', 'moc-03', 'Đặc tả các Endpoint REST API tương ứng 9 bảng CSDL', 'Soạn thảo tài liệu API contract trong 04-thiet-ke-he-thong/02-api-du-kien.md.', 'dang_lam', 40.0, 0, '2026-10-28', 'u-sv-02', 'u-sv-01', null);
  insertTask.run('cv-07', 'da-dacs-01', 'moc-03', 'Soạn kịch bản trả lời phản biện cơ sở dữ liệu', 'Chuẩn bị các câu hỏi lý thuyết: tại sao có ma_do_an trong cong_viec, tại sao tách nguoi_dung và thanh_vien_nhom.', 'can_lam', 0.0, 0, '2026-10-30', 'u-sv-01', 'u-gv-01', null);
  insertTask.run('cv-08', 'da-dacs-01', 'moc-04', 'Khởi tạo cấu trúc dự án React và Express cục bộ', 'Chờ phê duyệt từ cổng duyệt CHO-DUYET.md trước khi chạy mã nguồn.', 'can_lam', 0.0, 0, '2026-11-05', 'u-sv-02', 'u-sv-01', null);
  insertTask.run('cv-09', 'da-dacs-01', 'moc-02', 'Rà soát định dạng font chữ Time New Roman trong biểu mẫu Word', 'Kiểm tra biểu mẫu theo dõi tiến độ tuần 1, tránh lỗi tràn bảng và không thẳng lề.', 'tre_han', 20.0, 0, '2026-10-14', 'u-sv-02', 'u-gv-01', null);

  // 7. BINH_LUAN
  const insertComment = db.prepare(`
    INSERT INTO binh_luan (ma_binh_luan, ma_cong_viec, ma_nguoi_dung, noi_dung)
    VALUES (?, ?, ?, ?)
  `);
  insertComment.run('bl-01', 'cv-05', 'u-gv-01', 'Giao diện demo cần thiết kế sạch sẽ, trực quan theo đúng cấu trúc bảng CSDL, không đưa các tính năng rườm rà vào.');
  insertComment.run('bl-02', 'cv-05', 'u-sv-01', 'Dạ thưa Thầy, nhóm em đã áp dụng bộ tokens chuẩn TasteSkill v2 với bề mặt phẳng 1px và màu sắc tối giản nhấn vào trạng thái công việc ạ.');
  insertComment.run('bl-03', 'cv-09', 'u-sv-02', 'Em đang chỉnh lại phần lề theo đúng hướng dẫn 2-2.5-3-2 cm của Khoa, hôm nay sẽ nộp lại Thầy xem.');

  // 8. TEP_DINH_KEM
  const insertFile = db.prepare(`
    INSERT INTO tep_dinh_kem (ma_tep, ma_cong_viec, ma_nguoi_dung, ten_tep, duong_dan_tep, loai_tep, dung_luong)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertFile.run('tep-01', 'cv-04', 'u-sv-01', '08-ket-qua-tinh-toan-viet-tay.md', '/uploads/08-ket-qua-tinh-toan-viet-tay.md', 'text/markdown', 6908);
  insertFile.run('tep-02', 'cv-05', 'u-sv-01', 'erd.drawio', '/uploads/erd.drawio', 'application/xml', 31602);

  // 9. THONG_BAO
  const insertNotification = db.prepare(`
    INSERT INTO thong_bao (ma_thong_bao, ma_nguoi_dung, ma_do_an, ma_cong_viec, loai_thong_bao, tieu_de, noi_dung, trang_thai_doc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotification.run('tb-01', 'u-sv-01', 'da-dacs-01', 'cv-05', 'nhac_nho_tien_do', 'GVHD Bùi Phú Khuyên đã nhắc nhở tiến độ', 'Chuẩn bị bản giao diện demo hoàn chỉnh trước buổi báo cáo tiến độ tuần.', 0);
  insertNotification.run('tb-02', 'u-sv-02', 'da-dacs-01', 'cv-09', 'canh_bao_tre_han', 'Cảnh báo: Công việc đã quá hạn chót', 'Công việc Rà soát biểu mẫu Word đã quá hạn ngày 14/10/2026.', 1);

  console.log('[DB] Đã nạp thành công dữ liệu khởi tạo vào 9 bảng SQLite!');
}

// ============================================================================
// BỔ SUNG DỮ LIỆU MẪU LỚP HỌC PHẦN, NGÂN HÀNG ĐỀ TÀI (CÁ NHÂN & NHÓM)
// Bảo toàn 100% lược đồ 9 bảng BCNF, dùng INSERT OR IGNORE để nâng cấp an toàn
// ============================================================================
function ensureClassroomTopicsSeeded() {
  // Đảm bảo đề tài gốc da-dacs-01 có nhãn quy mô [NHÓM 2-3 SV]
  db.prepare(`
    UPDATE do_an
    SET ten_mon_hoc = 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
        noi_dung_muc_tieu = CASE
          WHEN noi_dung_muc_tieu NOT LIKE '[%' THEN '[NHÓM 2-3 SV] ' || noi_dung_muc_tieu
          ELSE noi_dung_muc_tieu
        END
    WHERE ma_do_an = 'da-dacs-01'
  `).run();

  // Thêm sinh viên trong lớp học phần 21DTHC5
  const insertUserIgnore = db.prepare(`
    INSERT OR IGNORE INTO nguoi_dung (ma_nguoi_dung, email, mat_khau_bam, ho_ten, vai_tro_he_thong, trang_thai_hoat_dong)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertUserIgnore.run('u-sv-03', '2280601102@gmail.com', '$2b$10$hashed_nam_pass', 'Lê Hoàng Nam', 'sinhvien', 1);
  insertUserIgnore.run('u-sv-04', '2280601508@gmail.com', '$2b$10$hashed_nhu_pass', 'Phạm Quỳnh Như', 'sinhvien', 1);
  insertUserIgnore.run('u-sv-05', '2280601899@gmail.com', '$2b$10$hashed_kiet_pass', 'Nguyễn Tuấn Kiệt', 'sinhvien', 1);

  // Chuẩn hóa toàn bộ email tài khoản demo về @gmail.com nếu CSDL cũ đã tạo từ trước
  db.prepare(`
    UPDATE nguoi_dung
    SET email = REPLACE(REPLACE(email, '@huflit.edu.vn', '@gmail.com'), '@hutech.edu.vn', '@gmail.com')
    WHERE email LIKE '%@huflit.edu.vn' OR email LIKE '%@hutech.edu.vn'
  `).run();

  const insertProjectIgnore = db.prepare(`
    INSERT OR IGNORE INTO do_an (ma_do_an, ten_do_an, loai_do_an, ten_mon_hoc, noi_dung_muc_tieu, tien_do_tong, trang_thai, ma_giang_vien)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Đề tài 2: Đề tài Cá nhân (1 người) đã có SV Lê Hoàng Nam nhận và đang làm
  insertProjectIgnore.run(
    'da-solo-01',
    'Xây dựng module tra cứu điểm và thống kê lộ trình học tập cá nhân',
    'mon_hoc',
    'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    '[CÁ NHÂN 1 SV] Ứng dụng web đơn trang (SPA) cho phép sinh viên tự theo dõi lộ trình học tập, tính điểm GPA tích lũy và cảnh báo học vụ cá nhân.',
    50.0,
    'dang_thuc_hien',
    'u-gv-01'
  );

  db.prepare(`INSERT OR IGNORE INTO nhom (ma_nhom, ma_do_an, ten_nhom) VALUES (?, ?, ?)`).run(
    'nhom-solo-01', 'da-solo-01', 'Cá nhân - Lê Hoàng Nam'
  );

  db.prepare(`
    INSERT OR IGNORE INTO thanh_vien_nhom (ma_thanh_vien_nhom, ma_nhom, ma_nguoi_dung, vai_tro_trong_nhom)
    VALUES (?, ?, ?, ?)
  `).run('tvn-solo-01', 'nhom-solo-01', 'u-sv-03', 'nhom_truong');

  // Mốc tiến độ và công việc cho đề tài cá nhân da-solo-01
  const insertMsIgnore = db.prepare(`
    INSERT OR IGNORE INTO moc_tien_do (ma_moc, ma_do_an, ten_moc, han_hoan_thanh, trang_thai, noi_dung_mo_ta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertMsIgnore.run('moc-solo-01', 'da-solo-01', 'Mốc 1: Thiết kế cấu trúc dữ liệu điểm học phần & GPA', '2026-10-05', 'hoan_thanh', 'Hoàn thành công thức quy đổi thang điểm 10 sang thang điểm 4 và tín chỉ tích lũy.');
  insertMsIgnore.run('moc-solo-02', 'da-solo-01', 'Mốc 2: Xây dựng giao diện biểu đồ học tập cá nhân', '2026-10-28', 'chua_hoan_thanh', 'Biểu đồ trực quan kết quả từng học kỳ và dự báo xếp loại học lực.');

  const insertTaskIgnore = db.prepare(`
    INSERT OR IGNORE INTO cong_viec (
      ma_cong_viec, ma_do_an, ma_moc, tieu_de, noi_dung_mo_ta,
      trang_thai, phan_tram_tien_do, trang_thai_khoa, han_chot,
      ma_nguoi_thuc_hien, ma_nguoi_tao, ma_nguoi_khoa
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTaskIgnore.run('cv-solo-01', 'da-solo-01', 'moc-solo-01', 'Viết hàm tính điểm trung bình tích lũy GPA hệ 4', 'Kiểm thử với bảng điểm mẫu 8 học kỳ của Khoa CNTT.', 'hoan_thanh', 100.0, 1, '2026-10-02', 'u-sv-03', 'u-gv-01', 'u-gv-01');
  insertTaskIgnore.run('cv-solo-02', 'da-solo-01', 'moc-solo-02', 'Thiết kế giao diện Dashboard thống kê tín chỉ tự chọn', 'Hiển thị rõ số tín chỉ đã hoàn thành và số tín chỉ còn thiếu.', 'dang_lam', 50.0, 0, '2026-10-25', 'u-sv-03', 'u-sv-03', null);
  insertTaskIgnore.run('cv-solo-03', 'da-solo-01', 'moc-solo-02', 'Tích hợp xuất bảng điểm cá nhân ra file PDF', 'Hỗ trợ sinh viên in bảng theo dõi kết quả học tập cá nhân.', 'can_lam', 0.0, 0, '2026-10-28', 'u-sv-03', 'u-sv-03', null);

  // Đề tài 3: Đề tài Nhóm (2-3 SV) - ĐANG MỞ ĐĂNG KÝ (chưa có bản ghi trong bảng nhom)
  insertProjectIgnore.run(
    'da-open-01',
    'Hệ thống quản lý phòng thí nghiệm và đăng ký mượn thiết bị IoT',
    'mon_hoc',
    'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    '[NHÓM 2-3 SV] Xây dựng phần mềm quản lý danh mục thiết bị phần cứng, đặt lịch mượn trả phòng Lab và theo dõi tình trạng thiết bị cho Khoa CNTT.',
    0.0,
    'dang_thuc_hien',
    'u-gv-01'
  );
  insertMsIgnore.run('moc-open1-01', 'da-open-01', 'Mốc 1: Khảo sát quy trình mượn trả thiết bị Lab & Đặc tả Use Case', '2026-10-10', 'chua_hoan_thanh', 'Xác định luồng duyệt phiếu mượn thiết bị giữa Sinh viên và Cán bộ quản lý phòng Lab.');
  insertMsIgnore.run('moc-open1-02', 'da-open-01', 'Mốc 2: Thiết kế CSDL BCNF & Giao diện đặt lịch phòng Lab', '2026-10-28', 'chua_hoan_thanh', 'Thiết kế lược đồ CSDL quản lý tồn kho thiết bị và lịch mượn theo ca học.');
  insertMsIgnore.run('moc-open1-03', 'da-open-01', 'Mốc 3: Lập trình MVP & Nghiệm thu đồ án môn học', '2026-11-18', 'chua_hoan_thanh', 'Hoàn thiện chức năng cảnh báo quá hạn trả thiết bị IoT.');

  // Đề tài 4: Đề tài Cá nhân (1 SV) - ĐANG MỞ ĐĂNG KÝ (chưa có bản ghi trong bảng nhom)
  insertProjectIgnore.run(
    'da-open-02',
    'Công cụ kiểm thử tự động RESTful API và xuất báo cáo Markdown',
    'mon_hoc',
    'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    '[CÁ NHÂN 1 SV] Phát triển công cụ Web Dashboard gọn nhẹ giúp sinh viên tự động chạy kịch bản kiểm thử các Endpoint API của đồ án môn học và xuất báo cáo.',
    0.0,
    'dang_thuc_hien',
    'u-gv-01'
  );
  insertMsIgnore.run('moc-open2-01', 'da-open-02', 'Mốc 1: Đặc tả cấu trúc kịch bản Test Case JSON & Parser', '2026-10-12', 'chua_hoan_thanh', 'Định nghĩa cú pháp kiểm thử request/response và mã trạng thái HTTP.');
  insertMsIgnore.run('moc-open2-02', 'da-open-02', 'Mốc 2: Lập trình bộ chạy kiểm thử & Xuất báo cáo Markdown', '2026-11-05', 'chua_hoan_thanh', 'Tự động tổng hợp tỷ lệ Pass/Fail và thời gian phản hồi API.');

  // Tạo và khởi tạo bảng Lớp học phần cho Giảng viên phụ trách môn học (GVPTMH)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lop_mon_hoc (
      ma_lop TEXT PRIMARY KEY,
      ten_lop TEXT NOT NULL,
      ten_mon_hoc TEXT NOT NULL,
      hoc_ky TEXT NOT NULL,
      ma_giang_vien TEXT NOT NULL,
      mo_ta TEXT,
      thoi_gian_tao TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const insertClass = db.prepare(`
    INSERT OR IGNORE INTO lop_mon_hoc (ma_lop, ten_lop, ten_mon_hoc, hoc_ky, ma_giang_vien, mo_ta)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertClass.run(
    '21DTHC5',
    'Lớp 21DTHC5 - CNPM',
    'Công nghệ phần mềm',
    'Học kỳ 1 • 2026',
    'u-gv-01',
    'Lớp học phần chính thức của Giảng viên phụ trách môn học (GVPTMH) ThS. Bùi Phú Khuyên'
  );
  insertClass.run(
    '22DTHE9',
    'Lớp 22DTHE9 - CNPM',
    'Công nghệ phần mềm',
    'Học kỳ 1 • 2026',
    'u-gv-01',
    'Lớp học phần bổ trợ phân công thực hành đồ án'
  );

  // Bảng bổ trợ Kết nối GitHub Dashboard (giữ nguyên 9 bảng lõi chuẩn BCNF)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lien_ket_github (
      ma_lien_ket          TEXT PRIMARY KEY,
      ma_do_an             TEXT NOT NULL UNIQUE REFERENCES do_an(ma_do_an) ON DELETE CASCADE,
      repo_url             TEXT NOT NULL,
      repo_owner           TEXT NOT NULL,
      repo_name            TEXT NOT NULL,
      default_branch       TEXT DEFAULT 'master',
      access_token         TEXT,
      member_mapping_json  TEXT DEFAULT '{}',
      cached_payload_json  TEXT,
      last_synced_at       TEXT
    );
  `);

  // Seed sẵn liên kết GitHub mẫu cho đề tài da-dacs-01 (Nhóm 05) để demo ngay
  db.prepare(`
    INSERT OR IGNORE INTO lien_ket_github (
      ma_lien_ket, ma_do_an, repo_url, repo_owner, repo_name, default_branch, member_mapping_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'gh-dacs-01',
    'da-dacs-01',
    'https://github.com/TDMHorizon/HeThongQuanLyCongViecVaTienDoDoAnNhom',
    'TDMHorizon',
    'HeThongQuanLyCongViecVaTienDoDoAnNhom',
    'master',
    JSON.stringify({
      'u-sv-01': 'TDMHorizon',
      'u-sv-02': 'Sixduy'
    })
  );
}

ensureClassroomTopicsSeeded();

export function getDb() {
  return db;
}
