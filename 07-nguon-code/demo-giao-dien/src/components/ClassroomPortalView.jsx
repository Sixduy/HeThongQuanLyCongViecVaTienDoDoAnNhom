import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function ClassroomPortalView() {
  const {
    classes,
    activeClassId,
    setActiveClassId,
    createClass,
    topics,
    users,
    currentUser,
    currentUserId,
    setCurrentUserId,
    isLecturer,
    studentProject,
    chibiMode,
    enterWorkspace,
    createTopic,
    registerSoloTopic,
    registerTeamTopic,
    resetTopicRegistration
  } = useProject();

  // Tab con của GVPTMH: 'topics' (Ngân hàng đề tài) | 'groups' (Danh sách nhóm & tiến độ) | 'roster' (Sĩ số SV)
  const [lecturerSubTab, setLecturerSubTab] = useState('topics');

  // Tab con của Sinh viên: 'my' (Đề tài của tôi / Đăng ký) | 'bank' (Ngân hàng đề tài tham khảo)
  const [studentSubTab, setStudentSubTab] = useState('my');

  // Modals
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState(false);
  const [teamModalTopic, setTeamModalTopic] = useState(null);
  const [soloConfirmTopic, setSoloConfirmTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form tạo lớp mới
  const [classForm, setClassForm] = useState({
    ma_lop: '',
    ten_lop: '',
    ten_mon_hoc: 'Công nghệ phần mềm',
    hoc_ky: 'Học kỳ 1 • 2026',
    mo_ta: ''
  });

  // Chế độ nhập đề tài: 'rows' (Nhiều dòng linh hoạt) | 'bulk' (Dán danh sách nhanh từ Word/Excel)
  const [topicInputMode, setTopicInputMode] = useState('rows');

  // Danh sách các dòng đề tài nhập cùng lúc (cho phép thêm nhiều đề tài cho 1 lớp)
  const [topicRows, setTopicRows] = useState([
    { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
    { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
  ]);

  // Văn bản dán nhanh hàng loạt
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultScale, setBulkDefaultScale] = useState('nhom'); // 'nhom' | 'ca_nhan' | 'alternate'

  // Form cũ tương thích
  const [newTopicForm, setNewTopicForm] = useState({
    ten_do_an: '',
    quy_mo: 'nhom',
    ten_mon_hoc: 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    noi_dung_muc_tieu: ''
  });

  // Form lập nhóm & chọn nhóm trưởng
  const [teamForm, setTeamForm] = useState({
    ten_nhom: '',
    leaderId: '',
    memberIds: []
  });

  // Modal nhận đề tài cá nhân
  const [soloStudentId, setSoloStudentId] = useState('');

  // Danh sách sinh viên
  const students = useMemo(() => {
    return users.filter(u => u.vai_tro_he_thong === 'sinhvien');
  }, [users]);

  // Các nhóm đã hình thành trong lớp
  const registeredGroups = useMemo(() => {
    return topics.filter(t => t.da_dang_ky);
  }, [topics]);

  // Đề tài còn trống chờ đăng ký
  const openTopics = useMemo(() => {
    return topics.filter(t => !t.da_dang_ky);
  }, [topics]);

  // Thông tin lớp hiện tại
  const currentClassInfo = useMemo(() => {
    return classes.find(c => c.ma_lop === activeClassId) || {
      ma_lop: '21DTHC5',
      ten_lop: 'Lớp 21DTHC5 - CNPM',
      ten_mon_hoc: 'Công nghệ phần mềm',
      hoc_ky: 'Học kỳ 1 • 2026',
      mo_ta: 'Lớp học phần chính thức môn Công nghệ phần mềm'
    };
  }, [classes, activeClassId]);

  // Sinh viên hiện tại đã có nhóm hay chưa
  const hasEnrolledProject = Boolean(studentProject);

  // Thao tác Tạo Lớp mới (GVPTMH)
  const handleCreateClassSubmit = async (e) => {
    e.preventDefault();
    if (!classForm.ma_lop.trim()) return;
    try {
      setSubmitting(true);
      await createClass(classForm);
      setClassForm({
        ma_lop: '',
        ten_lop: '',
        ten_mon_hoc: 'Công nghệ phần mềm',
        hoc_ky: 'Học kỳ 1 • 2026',
        mo_ta: ''
      });
      setIsCreateClassModalOpen(false);
      alert('Tạo Lớp môn học mới thành công!');
    } catch (err) {
      alert(`Lỗi tạo lớp: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Thêm dòng đề tài mới vào danh sách
  const handleAddTopicRow = () => {
    setTopicRows(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        ten_do_an: '',
        quy_mo: prev.length % 2 === 0 ? 'nhom' : 'ca_nhan',
        noi_dung_muc_tieu: ''
      }
    ]);
  };

  // Xóa một dòng đề tài
  const handleRemoveTopicRow = (id) => {
    if (topicRows.length <= 1) return;
    setTopicRows(prev => prev.filter(r => r.id !== id));
  };

  // Cập nhật giá trị trường dữ liệu của 1 dòng
  const handleUpdateTopicRow = (id, field, value) => {
    setTopicRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Nạp 4 đề tài mẫu phong phú chuẩn CNPM cho lớp
  const handleLoadSampleTopics = () => {
    setTopicRows([
      {
        id: Date.now() + 1,
        ten_do_an: 'Xây dựng cổng tra cứu thông tin học vụ và lịch thi tích hợp AI Chatbot',
        quy_mo: 'nhom',
        noi_dung_muc_tieu: 'Hệ thống web SPA hỗ trợ sinh viên tra cứu điểm thi, học phí và hỏi đáp quy chế học vụ qua AI.'
      },
      {
        id: Date.now() + 2,
        ten_do_an: 'Hệ thống quản lý điểm rèn luyện và hoạt động phong trào sinh viên',
        quy_mo: 'nhom',
        noi_dung_muc_tieu: 'Nền tảng trực tuyến chấm điểm rèn luyện minh bạch, duyệt minh chứng tham gia phong trào Khoa CNTT.'
      },
      {
        id: Date.now() + 3,
        ten_do_an: 'Ứng dụng nhắc nhở thời khóa biểu và lộ trình chứng chỉ tốt nghiệp',
        quy_mo: 'ca_nhan',
        noi_dung_muc_tieu: 'Module theo dõi tiến độ tích lũy chứng chỉ ngoại ngữ, tin học và cảnh báo học vụ cá nhân theo tuần.'
      },
      {
        id: Date.now() + 4,
        ten_do_an: 'Nền tảng chia sẻ tài liệu ôn tập và ngân hàng câu hỏi trắc nghiệm',
        quy_mo: 'ca_nhan',
        noi_dung_muc_tieu: 'Ứng dụng lưu trữ, tìm kiếm và phân quyền tải tài liệu học tập theo từng học phần.'
      }
    ]);
    setTopicInputMode('rows');
  };

  // Chuyển văn bản dán hàng loạt thành các dòng đề tài
  const handleParseBulkText = () => {
    if (!bulkText.trim()) {
      alert('Vui lòng dán danh sách đề tài vào ô văn bản trước!');
      return;
    }
    const lines = bulkText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) {
      alert('Không tìm thấy dòng đề tài nào hợp lệ!');
      return;
    }

    const newRows = lines.map((line, idx) => {
      let scale = bulkDefaultScale;
      if (bulkDefaultScale === 'alternate') {
        scale = idx % 2 === 0 ? 'nhom' : 'ca_nhan';
      }
      return {
        id: Date.now() + idx,
        ten_do_an: line,
        quy_mo: scale,
        noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}", chuẩn hóa CSDL BCNF và báo cáo nghiệm thu.`
      };
    });

    setTopicRows(newRows);
    setTopicInputMode('rows');
  };

  // Thao tác Tạo & Công bố Đề tài mới (GVPTMH - Hỗ trợ NHIỀU ĐỀ TÀI CÙNG LÚC)
  const handleCreateTopicSubmit = async (e) => {
    e.preventDefault();

    let rowsToSubmit = topicRows;
    if (topicInputMode === 'bulk') {
      if (!bulkText.trim()) {
        alert('Vui lòng dán danh sách đề tài hoặc chuyển sang tab Nhập theo danh sách!');
        return;
      }
      const lines = bulkText
        .split('\n')
        .map(l => l.trim().replace(/^(\d+[\.\/\)\-\:]|\-|\*|Đề tài \d+[\:\.\-]?)\s*/i, '').trim())
        .filter(l => l.length > 0);
      rowsToSubmit = lines.map((line, idx) => ({
        id: Date.now() + idx,
        ten_do_an: line,
        quy_mo: bulkDefaultScale === 'alternate' ? (idx % 2 === 0 ? 'nhom' : 'ca_nhan') : bulkDefaultScale,
        noi_dung_muc_tieu: `Xây dựng giải pháp phần mềm cho đề tài "${line}".`
      }));
    }

    const validRows = rowsToSubmit.filter(r => r.ten_do_an && r.ten_do_an.trim());
    if (validRows.length === 0) {
      alert('Vui lòng nhập ít nhất 1 tên đề tài!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ten_mon_hoc: `Môn: ${currentClassInfo.ten_mon_hoc} • ${currentClassInfo.ten_lop}`,
        ma_giang_vien: 'u-gv-01',
        topics: validRows.map(r => ({
          ten_do_an: r.ten_do_an.trim(),
          quy_mo: r.quy_mo,
          noi_dung_muc_tieu: r.noi_dung_muc_tieu ? r.noi_dung_muc_tieu.trim() : undefined
        }))
      };

      await createTopic(payload);

      // Reset về trạng thái mặc định
      setTopicRows([
        { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
        { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
      ]);
      setBulkText('');
      setIsCreateTopicModalOpen(false);
    } catch (err) {
      alert(`Lỗi công bố đề tài: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal nhận đề tài cá nhân
  const handleOpenSoloConfirm = (topic) => {
    const defaultSvId = !isLecturer && currentUser ? currentUser.ma_nguoi_dung : 'u-sv-04';
    setSoloStudentId(defaultSvId);
    setSoloConfirmTopic(topic);
  };

  const handleConfirmSoloSubmit = async (e) => {
    e.preventDefault();
    if (!soloConfirmTopic || !soloStudentId) return;
    try {
      setSubmitting(true);
      await registerSoloTopic(soloConfirmTopic.ma_do_an, soloStudentId);
      if (!isLecturer) setCurrentUserId(soloStudentId);
      setSoloConfirmTopic(null);
    } catch (err) {
      alert(`Lỗi nhận đề tài cá nhân: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal lập nhóm
  const handleOpenTeamModal = (topic) => {
    const unassigned = students.filter(s => !s.da_co_nhom);
    let defaultMembers = [];
    let defaultLeader = '';

    if (!isLecturer && currentUser) {
      defaultLeader = currentUser.ma_nguoi_dung;
      const partner = unassigned.find(s => s.ma_nguoi_dung !== currentUser.ma_nguoi_dung) || students.find(s => s.ma_nguoi_dung !== currentUser.ma_nguoi_dung);
      defaultMembers = partner ? [currentUser.ma_nguoi_dung, partner.ma_nguoi_dung] : [currentUser.ma_nguoi_dung];
    } else if (unassigned.length >= 2) {
      defaultLeader = unassigned[0].ma_nguoi_dung;
      defaultMembers = [unassigned[0].ma_nguoi_dung, unassigned[1].ma_nguoi_dung];
    } else {
      defaultLeader = students[0]?.ma_nguoi_dung || '';
      defaultMembers = students.slice(0, 2).map(s => s.ma_nguoi_dung);
    }

    const nextNum = registeredGroups.filter(g => g.quy_mo === 'nhom').length + 5;
    setTeamForm({
      ten_nhom: `Nhóm Đồ án Môn học 0${nextNum}`,
      leaderId: defaultLeader,
      memberIds: defaultMembers
    });
    setTeamModalTopic(topic);
  };

  const handleToggleMember = (studentId) => {
    setTeamForm(prev => {
      const exists = prev.memberIds.includes(studentId);
      let nextMembers = exists ? prev.memberIds.filter(id => id !== studentId) : [...prev.memberIds, studentId];
      if (nextMembers.length > 3) {
        alert('Đề tài nhóm giới hạn tối đa 3 sinh viên!');
        return prev;
      }
      let nextLeader = prev.leaderId;
      if (!nextMembers.includes(nextLeader)) {
        nextLeader = nextMembers[0] || '';
      }
      return { ...prev, memberIds: nextMembers, leaderId: nextLeader };
    });
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamModalTopic) return;
    if (!teamForm.ten_nhom.trim()) {
      alert('Vui lòng đặt tên nhóm!');
      return;
    }
    if (teamForm.memberIds.length < 2) {
      alert('Đề tài nhóm cần tối thiểu 2 sinh viên tham gia!');
      return;
    }
    try {
      setSubmitting(true);
      await registerTeamTopic(teamModalTopic.ma_do_an, {
        ten_nhom: teamForm.ten_nhom.trim(),
        leaderId: teamForm.leaderId,
        memberIds: teamForm.memberIds
      });
      if (!isLecturer) setCurrentUserId(teamForm.leaderId);
      setTeamModalTopic(null);
    } catch (err) {
      alert(`Lỗi đăng ký nhóm: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="classroom-portal-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '36px' }}>

      {/* =====================================================================
          1. HEADER BANNER CỔNG MÔN HỌC (CHUẨN TASTESKILL V2 / LINEAR NỀN SÁNG)
         ===================================================================== */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderTop: '3px solid #2563eb',
          borderRadius: '14px',
          padding: '22px 24px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 480px' }}>
            {chibiMode && (
              <img
                src={isLecturer ? CHIBI_ASSETS.characters.gvReview : (hasEnrolledProject ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.characters.chiaTask)}
                alt="Portal Mascot"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'contain',
                  background: '#eff6ff',
                  borderRadius: '12px',
                  padding: '6px',
                  border: '1px solid #bfdbfe'
                }}
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2.5px 10px',
                    borderRadius: 'var(--radius-pill)',
                    letterSpacing: '0.4px'
                  }}
                >
                  {isLecturer ? 'GIẢNG VIÊN PHỤ TRÁCH MÔN HỌC (GVPTMH)' : 'CỔNG SINH VIÊN ĐỒ ÁN MÔN HỌC'}
                </span>
                <span
                  style={{
                    background: '#f4f4f5',
                    color: '#52525b',
                    border: '1px solid #e4e4e7',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2.5px 9px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  {currentClassInfo.ten_mon_hoc} &bull; {currentClassInfo.ten_lop}
                </span>
                <span
                  style={{
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2.5px 9px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  GVHD: ThS. Bùi Phú Khuyên
                </span>
              </div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>
                {isLecturer
                  ? `Bảng điều khiển GVPTMH — ${currentClassInfo.ten_lop}`
                  : `Cổng Thông tin Sinh viên — ${currentClassInfo.ten_mon_hoc}`}
              </h2>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {isLecturer
                  ? 'Quản lý các lớp môn học, chuẩn bị ngân hàng đề tài (cá nhân/nhóm) và theo dõi tình hình phân nhóm trước khi đi vào quản lý chi tiết từng nhóm.'
                  : (hasEnrolledProject
                    ? `Chào ${currentUser?.ho_ten}! Bạn đã tham gia đề tài của môn học. Bạn có thể xem trạng thái bên dưới và bấm nút để vào bảng việc Kanban.`
                    : `Chào ${currentUser?.ho_ten}! Bạn hiện chưa có đề tài. Hãy chọn làm đề tài cá nhân (1 người) hoặc lập nhóm (2-3 người) bên dưới.`)}
              </p>
            </div>
          </div>

          {/* Chọn Lớp môn học & Nút tạo Lớp (Dành cho GVPTMH) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--surface-subtle)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Lớp đang chọn:</span>
              <select
                value={activeClassId}
                onChange={e => setActiveClassId(e.target.value)}
                style={{
                  background: 'var(--surface-raised)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {classes.map(c => (
                  <option key={c.ma_lop} value={c.ma_lop}>
                    {c.ten_lop} ({c.hoc_ky})
                  </option>
                ))}
              </select>

              {isLecturer && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsCreateClassModalOpen(true)}
                  style={{
                    color: '#2563eb',
                    borderColor: '#93c5fd',
                    background: '#eff6ff',
                    fontSize: '11.5px',
                    padding: '5px 10px',
                    fontWeight: 700
                  }}
                  title="Tạo thêm Lớp môn học mới"
                >
                  + Tạo Lớp mới
                </button>
              )}
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
              Học kỳ: <strong style={{ color: 'var(--text)' }}>{currentClassInfo.hoc_ky}</strong> &bull; Sĩ số: <strong style={{ color: 'var(--text)' }}>{students.length} sinh viên</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. NỘI DUNG CHÍNH: PHÂN BIỆT RÕ RÀNG GIỮA GV VÀ SINH VIÊN
         ===================================================================== */}

      {isLecturer ? (
        /* -------------------------------------------------------------------
           A. GIAO DIỆN GIẢNG VIÊN PHỤ TRÁCH MÔN HỌC (GVPTMH)
           ------------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Thống kê cấp độ môn học */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', borderTop: '3px solid #2563eb' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ngân hàng Đề tài Môn học</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', margin: '4px 0' }}>{topics.length}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                {topics.filter(t => t.quy_mo === 'nhom').length} đề tài nhóm &bull; {topics.filter(t => t.quy_mo === 'ca_nhan').length} đề tài cá nhân
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', borderTop: '3px solid #16a34a' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Nhóm Đồ án Đã Thành Lập</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>{registeredGroups.length}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                Đã kích hoạt Workspace quản lý tiến độ
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', borderTop: '3px solid #d97706' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Đề tài Còn trống Chờ chọn</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>{openTopics.length}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                Sẵn sàng cho sinh viên đăng ký
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', borderTop: '3px solid #7c3aed' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sĩ số SV Đã có Nhóm</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#6d28d9', margin: '4px 0' }}>
                {students.filter(s => s.da_co_nhom).length}/{students.length}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                {students.filter(s => !s.da_co_nhom).length} sinh viên đang chờ ghép nhóm
              </div>
            </div>
          </div>

          {/* Thanh chuyển mạch 3 Tab của GVPTMH */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--surface)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className={`tab-btn ${lecturerSubTab === 'topics' ? 'active' : ''}`}
                onClick={() => setLecturerSubTab('topics')}
                style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 700 }}
              >
                📚 1. Ngân hàng Đề tài ({topics.length})
              </button>
              <button
                className={`tab-btn ${lecturerSubTab === 'groups' ? 'active' : ''}`}
                onClick={() => setLecturerSubTab('groups')}
                style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 700 }}
              >
                👥 2. Các Nhóm Đồ án & Bảng Tiến độ ({registeredGroups.length})
              </button>
              <button
                className={`tab-btn ${lecturerSubTab === 'roster' ? 'active' : ''}`}
                onClick={() => setLecturerSubTab('roster')}
                style={{ padding: '7px 14px', fontSize: '13px', fontWeight: 700 }}
              >
                🎓 3. Sĩ số Sinh viên Lớp ({students.length})
              </button>
            </div>

            {lecturerSubTab === 'topics' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreateTopicModalOpen(true)}
                style={{ fontWeight: 700, padding: '7px 14px' }}
              >
                <span>+ Thêm Đề tài vào Ngân hàng</span>
              </button>
            )}
          </div>

          {/* Tab 1: Ngân hàng đề tài của GVPTMH */}
          {lecturerSubTab === 'topics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
              {topics.map(topic => (
                <div
                  key={topic.ma_do_an}
                  className="topic-card"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: topic.quy_mo === 'ca_nhan' ? '#e0f2fe' : '#f3e8ff',
                          color: topic.quy_mo === 'ca_nhan' ? '#0369a1' : '#6d28d9',
                          border: topic.quy_mo === 'ca_nhan' ? '1px solid #bae6fd' : '1px solid #e9d5ff',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <img
                          src={topic.quy_mo === 'ca_nhan' ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.characters.chiaTask}
                          alt="Scale"
                          style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                        />
                        {topic.quy_mo === 'ca_nhan' ? 'Cá nhân (1 SV)' : 'Nhóm (2-3 SV)'}
                      </span>

                      {topic.da_dang_ky ? (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <img src={CHIBI_ASSETS.icons.done} alt="Done" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                          Đã có nhóm nhận ({topic.team?.ten_nhom})
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <img src={CHIBI_ASSETS.icons.flag} alt="Open" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                          Chờ sinh viên chọn
                        </span>
                      )}
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                      {topic.ten_do_an}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {topic.mo_ta_sach}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px dashed var(--border)', fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                    <span>🚩 {topic.so_moc} mốc bàn giao</span>
                    {topic.da_dang_ky ? (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => enterWorkspace(topic.ma_do_an)}
                        style={{ borderColor: '#2563eb', color: '#1d4ed8', fontWeight: 600 }}
                      >
                        Vào xem Kanban ({topic.tien_do_tong}%) →
                      </button>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#b45309' }}>Sẵn sàng mở đăng ký</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Các Nhóm Đồ án & Bảng Tiến độ của GVPTMH */}
          {lecturerSubTab === 'groups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Dưới đây là các Nhóm đồ án và Đề tài cá nhân đã được đăng ký trong lớp <strong>{currentClassInfo.ten_lop}</strong>.
                Bấm vào <strong>"Đi vào Không gian Quản lý Tiến độ"</strong> của nhóm nào để duyệt mốc, xem Kanban và khóa tiến độ của nhóm đó:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
                {registeredGroups.map(group => {
                  const leader = group.team?.members?.find(m => m.vai_tro_trong_nhom === 'nhom_truong');
                  const isSolo = group.quy_mo === 'ca_nhan';

                  return (
                    <div
                      key={group.ma_do_an}
                      style={{
                        background: 'var(--surface)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              background: isSolo ? '#e0f2fe' : '#f3e8ff',
                              color: isSolo ? '#0369a1' : '#6d28d9',
                              border: isSolo ? '1px solid #bae6fd' : '1px solid #e9d5ff'
                            }}
                          >
                            {chibiMode && (
                              <img
                                src={isSolo ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.logos.team}
                                alt="Scale"
                                style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                              />
                            )}
                            {isSolo ? 'Đồ án Cá nhân (1 SV)' : 'Đồ án Nhóm (2-3 SV)'}
                          </span>
                          <h4 style={{ margin: '6px 0 2px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>
                            {group.team?.ten_nhom}
                          </h4>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Đề tài: <strong>{group.ten_do_an}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>
                            {Number(group.tien_do_tong || 0).toFixed(0)}%
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Tiến độ tổng</div>
                        </div>
                      </div>

                      {/* Thành viên */}
                      <div style={{ background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: '12px' }}>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>Thành viên phụ trách:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {group.team?.members?.map(m => (
                            <span key={m.ma_nguoi_dung} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                              {m.ho_ten} {m.vai_tro_trong_nhom === 'nhom_truong' ? '⭐' : ''}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Nút hành động cốt lõi: ĐI VÀO WORKSPACE KANBAN CỦA NHÓM NÀY */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => enterWorkspace(group.ma_do_an)}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            fontWeight: 700,
                            padding: '9px 16px',
                            background: '#2563eb',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {chibiMode && (
                            <img
                              src={CHIBI_ASSETS.icons.kanban}
                              alt="Kanban"
                              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                            />
                          )}
                          <span>Đi vào Quản lý Tiến độ (Kanban) của Nhóm này &rarr;</span>
                        </button>

                        {group.ma_do_an !== 'da-dacs-01' && (
                          <button
                            className="btn btn-outline btn-sm"
                            title="Đặt lại đề tài về trống để demo lại"
                            onClick={() => {
                              if (window.confirm('Đặt lại đề tài này về trạng thái trống?')) {
                                resetTopicRegistration(group.ma_do_an);
                              }
                            }}
                            style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                          >
                            Đặt lại
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Sĩ số SV lớp */}
          {lecturerSubTab === 'roster' && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700 }}>Danh sách Sinh viên Lớp {currentClassInfo.ten_lop}</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '8px' }}>Họ tên</th>
                    <th style={{ padding: '8px' }}>Email</th>
                    <th style={{ padding: '8px' }}>Tình trạng Nhóm</th>
                    <th style={{ padding: '8px' }}>Đề tài thực hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const m = s.danh_sach_nhom?.[0];
                    return (
                      <tr key={s.ma_nguoi_dung} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600 }}>{s.ho_ten}</td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{s.email}</td>
                        <td style={{ padding: '10px 8px' }}>
                          {m ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>
                              {m.ten_nhom}
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>
                              Chưa có nhóm
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          {m ? (
                            <span
                              onClick={() => enterWorkspace(m.ma_do_an)}
                              style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              {m.ten_do_an}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* -------------------------------------------------------------------
           B. GIAO DIỆN SINH VIÊN MÔN HỌC (STUDENT PORTAL)
           ------------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {hasEnrolledProject ? (
            /* TRƯỜNG HỢP 1: SINH VIÊN ĐÃ CÓ NHÓM / ĐỀ TÀI (CHUẨN LINEAR NỀN SÁNG CÓ HÌNH ẢNH CHIBI SINH ĐỘNG) */
            <div
              style={{
                background: 'var(--surface-raised)',
                borderRadius: '14px',
                padding: '24px 26px',
                border: '1px solid var(--border)',
                borderLeft: '4px solid #2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Top tags row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        padding: '3px 12px',
                        borderRadius: 'var(--radius-pill)',
                        letterSpacing: '0.4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <img src={CHIBI_ASSETS.icons.done} alt="Done" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                      ĐỀ TÀI BẠN ĐANG THỰC HIỆN
                    </span>

                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Vai trò của bạn:{' '}
                      <strong
                        style={{
                          background: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#fef3c7' : '#f4f4f5',
                          color: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '#b45309' : '#52525b',
                          border: currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? '1px solid #fde68a' : '1px solid #e4e4e7',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <img
                          src={currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? CHIBI_ASSETS.badges.leader : CHIBI_ASSETS.badges.fresher}
                          alt="Badge"
                          style={{ width: '14px', height: '14px', objectFit: 'contain' }}
                        />
                        {currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên'}
                      </strong>
                    </span>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
                      {studentProject.ten_do_an}
                    </h3>
                    <div style={{ fontSize: '13.5px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <img src={CHIBI_ASSETS.logos.team} alt="Team" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                      <span>{studentProject.ten_nhom}</span>
                      <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>&bull;</span>
                      <span style={{ color: '#15803d', fontWeight: 700, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 8px', borderRadius: '999px', fontSize: '11.5px' }}>
                        Tiến độ: {Number(studentProject.tien_do_tong || 0).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chibi Character Hero Card bên phải */}
                {chibiMode && (
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
                      border: '1px solid #dbeafe',
                      borderRadius: '16px',
                      padding: '10px 18px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                      textAlign: 'center'
                    }}
                  >
                    <img
                      src={currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? CHIBI_ASSETS.characters.ganhTa : CHIBI_ASSETS.characters.coding}
                      alt="Student Mascot"
                      style={{ width: '84px', height: '84px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.06))' }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', marginTop: '4px' }}>
                      {currentUser?.vai_tro_trong_nhom === 'nhom_truong' ? 'Gánh team về đích! 🚀' : 'Đang cày đồ án! 💻'}
                    </span>
                  </div>
                )}
              </div>

              {/* Nút hành động kêu gọi lớn: VÀO THẲNG KANBAN CỦA BẠN */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Không gian làm việc đã sẵn sàng với Bảng việc Kanban, Mốc tiến độ và Công cụ tự chấm % tiến độ.
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => enterWorkspace(studentProject.ma_do_an)}
                  style={{
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    color: '#ffffff',
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <img src={CHIBI_ASSETS.icons.kanban} alt="Kanban" style={{ width: '18px', height: '18px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  <span>Đi vào Bảng công việc & Báo cáo Tiến độ (Kanban) →</span>
                </button>
              </div>
            </div>
          ) : (
            /* TRƯỜNG HỢP 2: SINH VIÊN CHƯA CÓ NHÓM / CHỜ ĐĂNG KÝ */
            <div
              style={{
                background: 'var(--surface)',
                border: '1.5px dashed #f59e0b',
                borderRadius: '16px',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '11.5px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', border: '1px solid #fde68a' }}>
                    CHƯA CÓ ĐỀ TÀI MÔN HỌC
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>
                  Bạn chưa đăng ký đề tài môn học {currentClassInfo.ten_mon_hoc}
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Giảng viên phụ trách đã công bố ngân hàng đề tài. Bạn hãy lựa chọn 1 trong 2 hình thức thực hiện dưới đây để bắt đầu:
                </p>
              </div>

              {/* 2 Lựa chọn Độc lập vs Lập nhóm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Lựa chọn 1: Làm Cá nhân */}
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Hình thức 1 &bull; 1 SV Độc lập
                      </div>
                      <h4 style={{ margin: '4px 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0c4a6e' }}>
                        Làm Đề tài Cá nhân
                      </h4>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#0284c7', lineHeight: 1.45 }}>
                        Dành cho sinh viên muốn tự nghiên cứu độc lập. Bạn chỉ cần chọn đề tài 1 người là hệ thống kích hoạt workspace ngay.
                      </p>
                    </div>
                    {chibiMode && (
                      <img
                        src={CHIBI_ASSETS.characters.coding}
                        alt="Solo"
                        style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 }}
                      />
                    )}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const firstSolo = openTopics.find(t => t.quy_mo === 'ca_nhan') || topics.find(t => t.quy_mo === 'ca_nhan');
                      if (firstSolo) handleOpenSoloConfirm(firstSolo);
                      else alert('Hiện chưa có đề tài cá nhân nào còn trống!');
                    }}
                    style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 700, justifyContent: 'center', gap: '6px' }}
                  >
                    <span>⚡ Xem & Nhận Đề tài Cá nhân</span>
                  </button>
                </div>

                {/* Lựa chọn 2: Làm Nhóm */}
                <div
                  style={{
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Hình thức 2 &bull; Phối hợp 2-3 SV
                      </div>
                      <h4 style={{ margin: '4px 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#4c1d95' }}>
                        Làm Đề tài Nhóm
                      </h4>
                      <p style={{ margin: 0, fontSize: '12.5px', color: '#7c3aed', lineHeight: 1.45 }}>
                        Dành cho sinh viên làm việc nhóm. Bạn thực hiện đặt tên nhóm, chọn bạn cùng lớp và chỉ định ai là Nhóm trưởng.
                      </p>
                    </div>
                    {chibiMode && (
                      <img
                        src={CHIBI_ASSETS.characters.chiaTask}
                        alt="Team"
                        style={{ width: '56px', height: '56px', objectFit: 'contain', flexShrink: 0 }}
                      />
                    )}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const firstTeam = openTopics.find(t => t.quy_mo === 'nhom') || topics.find(t => t.quy_mo === 'nhom');
                      if (firstTeam) handleOpenTeamModal(firstTeam);
                      else alert('Hiện chưa có đề tài nhóm nào còn trống!');
                    }}
                    style={{ background: '#7c3aed', borderColor: '#7c3aed', fontWeight: 700, justifyContent: 'center', gap: '6px' }}
                  >
                    <span>👥 Lập Nhóm & Đăng ký Đề tài</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Danh mục Ngân hàng đề tài môn học của Lớp (SV xem tham khảo) */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={CHIBI_ASSETS.icons.checklist} alt="Bank" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
                  Ngân hàng Đề tài Môn học ({currentClassInfo.ten_lop.startsWith('Lớp ') ? currentClassInfo.ten_lop : `Lớp ${currentClassInfo.ten_lop}`})
                </h4>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                {topics.length} đề tài đã công bố
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
              {topics.map(t => {
                const isMyProject = hasEnrolledProject && (studentProject?.ma_do_an === t.ma_do_an);
                const isSolo = t.quy_mo === 'ca_nhan';
                const isRegistered = t.da_dang_ky;
                const leader = t.team?.members?.find(m => m.vai_tro_trong_nhom === 'nhom_truong');

                return (
                  <div
                    key={t.ma_do_an}
                    style={{
                      border: isMyProject ? '2px solid #2563eb' : '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '16px',
                      background: isMyProject ? '#f8faff' : 'var(--surface-raised)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: isMyProject ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      {/* Hàng trên: Badge Quy mô Chibi & Nhãn trạng thái */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: isSolo ? '#0369a1' : '#6d28d9',
                              background: isSolo ? '#e0f2fe' : '#f3e8ff',
                              border: isSolo ? '1px solid #bae6fd' : '1px solid #e9d5ff',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <img
                              src={isSolo ? CHIBI_ASSETS.characters.coding : CHIBI_ASSETS.characters.chiaTask}
                              alt="Scale"
                              style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                            />
                            {isSolo ? 'Đề tài 1 người' : 'Đề tài Nhóm (2-3 SV)'}
                          </span>

                          {isMyProject && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: '#1d4ed8',
                                background: '#dbeafe',
                                border: '1px solid #bfdbfe',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              ⭐ ĐỀ TÀI CỦA BẠN
                            </span>
                          )}
                        </div>

                        {isRegistered ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#15803d',
                              fontWeight: 700,
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <img src={CHIBI_ASSETS.icons.done} alt="Done" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                            Đã có nhóm nhận &bull; {Number(t.tien_do_tong || 0).toFixed(0)}%
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#b45309',
                              fontWeight: 700,
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <img src={CHIBI_ASSETS.icons.flag} alt="Open" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />
                            Còn trống
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text)', lineHeight: 1.35 }}>
                        {t.ten_do_an}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.45 }}>
                        {t.mo_ta_sach}
                      </div>
                    </div>

                    {/* KHU VỰC THÔNG TIN NHÓM & NÚT BẤM HÀNH ĐỘNG CỐT LÕI */}
                    {isRegistered ? (
                      /* Trường hợp A: Đề tài đã có nhóm phụ trách */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <img src={CHIBI_ASSETS.logos.team} alt="Team" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                            <strong>{t.team?.ten_nhom || 'Nhóm phụ trách'}</strong>
                            {leader && <span style={{ color: 'var(--text-subtle)' }}>({leader.ho_ten})</span>}
                          </span>
                          <span style={{ fontWeight: 700, color: '#15803d' }}>
                            {Number(t.tien_do_tong || 0).toFixed(0)}%
                          </span>
                        </div>

                        {/* Thanh mini progress */}
                        <div style={{ height: '4px', background: '#e4e4e7', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(Math.max(Number(t.tien_do_tong || 0), 0), 100)}%`, background: isMyProject ? '#2563eb' : '#15803d', transition: 'width 0.3s ease' }}></div>
                        </div>

                        {/* NÚT BẤM MỞ KHÔNG GIAN KANBAN ĐỂ XEM MÌNH / NHÓM ĐANG LÀM GÌ */}
                        <button
                          className={isMyProject ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                          onClick={() => enterWorkspace(t.ma_do_an)}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            fontWeight: 700,
                            gap: '6px',
                            background: isMyProject ? '#2563eb' : undefined,
                            borderColor: isMyProject ? '#2563eb' : '#93c5fd',
                            color: isMyProject ? '#ffffff' : '#1d4ed8'
                          }}
                        >
                          <img src={CHIBI_ASSETS.icons.kanban} alt="Kanban" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                          <span>
                            {isMyProject ? '🚀 Đi vào Bảng việc Kanban của bạn →' : '👀 Xem Tiến độ & Bảng việc của nhóm này →'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      /* Trường hợp B: Đề tài còn trống */
                      <div style={{ paddingTop: '10px', borderTop: '1px dashed var(--border)' }}>
                        {!hasEnrolledProject ? (
                          isSolo ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenSoloConfirm(t)}
                              style={{ width: '100%', justifyContent: 'center', background: '#0284c7', borderColor: '#0284c7', fontWeight: 700, gap: '6px' }}
                            >
                              <img src={CHIBI_ASSETS.characters.coding} alt="Solo" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                              <span>⚡ Nhận đề tài cá nhân này</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenTeamModal(t)}
                              style={{ width: '100%', justifyContent: 'center', background: '#7c3aed', borderColor: '#7c3aed', fontWeight: 700, gap: '6px' }}
                            >
                              <img src={CHIBI_ASSETS.characters.chiaTask} alt="Team" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                              <span>👥 Lập nhóm để làm đề tài này</span>
                            </button>
                          )
                        ) : (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)', textAlign: 'center', padding: '4px 0' }}>
                            🟢 Đề tài đang mở chờ sinh viên khác trong lớp chọn
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL A: TẠO LỚP MÔN HỌC MỚI (DÀNH CHO GVPTMH)
         ===================================================================== */}
      {isCreateClassModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateClassModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>🏫 Giảng viên Tạo Lớp Môn học Mới</h3>
              <button className="drawer-close-btn" onClick={() => setIsCreateClassModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateClassSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Mã lớp học phần (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: 21DTHC6 hoặc 22DTHE9"
                    value={classForm.ma_lop}
                    onChange={e => setClassForm(prev => ({ ...prev, ma_lop: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên môn học</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.ten_mon_hoc}
                    onChange={e => setClassForm(prev => ({ ...prev, ten_mon_hoc: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Học kỳ / Niên khóa</label>
                  <input
                    type="text"
                    className="form-input"
                    value={classForm.hoc_ky}
                    onChange={e => setClassForm(prev => ({ ...prev, hoc_ky: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả lớp học phần</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Mô tả thông tin phòng máy, lịch học..."
                    value={classForm.mo_ta}
                    onChange={e => setClassForm(prev => ({ ...prev, mo_ta: e.target.value }))}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsCreateClassModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : '+ Hoàn tất Tạo Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL B: GIẢNG VIÊN TẠO NHIỀU ĐỀ TÀI CÙNG LÚC VÀO NGÂN HÀNG CỦA LỚP
         ===================================================================== */}
      {isCreateTopicModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateTopicModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw' }}>
            <div className="modal-header" style={{ paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  📚 GVPTMH Thêm Đề tài vào Ngân hàng ({currentClassInfo.ten_lop})
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cho phép nhập nhiều đề tài cùng lúc để sinh viên trong lớp chọn làm đề tài Cá nhân (1 SV) hoặc Nhóm (2-3 SV).
                </p>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsCreateTopicModalOpen(false)}>✕</button>
            </div>

            {/* Thanh chuyển chế độ nhập: Nhập danh sách vs Dán hàng loạt */}
            <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', paddingTop: '8px', paddingBottom: '8px' }}>
                <button
                  type="button"
                  className={`tab-btn ${topicInputMode === 'rows' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('rows')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📝 Nhập theo danh sách ({topicRows.length} dòng)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${topicInputMode === 'bulk' ? 'active' : ''}`}
                  onClick={() => setTopicInputMode('bulk')}
                  style={{ fontSize: '12px', padding: '5px 12px', fontWeight: 600 }}
                >
                  📋 Dán nhanh hàng loạt (Bulk Paste)
                </button>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLoadSampleTopics}
                title="Tự động điền 4 đề tài mẫu thực tế chuẩn Công nghệ phần mềm"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#2563eb',
                  borderColor: '#bfdbfe',
                  background: '#eff6ff',
                  padding: '4px 10px'
                }}
              >
                ✨ Nạp 4 đề tài mẫu gợi ý
              </button>
            </div>

            <form onSubmit={handleCreateTopicSubmit}>
              <div className="modal-body" style={{ maxHeight: '56vh', overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* ---------------- CHẾ ĐỘ 1: NHẬP THEO DANH SÁCH TỪNG DÒNG ---------------- */}
                {topicInputMode === 'rows' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                        Danh sách các đề tài chuẩn bị công bố:
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleAddTopicRow}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8', background: '#eff6ff' }}
                      >
                        + Thêm dòng đề tài
                      </button>
                    </div>

                    {topicRows.map((row, idx) => (
                      <div
                        key={row.id}
                        style={{
                          background: 'var(--surface-raised)',
                          border: '1px solid var(--border)',
                          borderLeft: row.quy_mo === 'ca_nhan' ? '4px solid #0284c7' : '4px solid #7c3aed',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        {/* Header của từng dòng đề tài: STT + Chọn Quy mô + Nút Xóa */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>
                            Đề tài #{idx + 1}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Toggle Quy mô */}
                            <div style={{ display: 'inline-flex', background: 'var(--surface-subtle)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateTopicRow(row.id, 'quy_mo', 'nhom')}
                                style={{
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: row.quy_mo === 'nhom' ? 700 : 500,
                                  background: row.quy_mo === 'nhom' ? '#7c3aed' : 'transparent',
                                  color: row.quy_mo === 'nhom' ? '#ffffff' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                👥 Nhóm (2-3 SV)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateTopicRow(row.id, 'quy_mo', 'ca_nhan')}
                                style={{
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '3px 8px',
                                  fontSize: '11px',
                                  fontWeight: row.quy_mo === 'ca_nhan' ? 700 : 500,
                                  background: row.quy_mo === 'ca_nhan' ? '#0284c7' : 'transparent',
                                  color: row.quy_mo === 'ca_nhan' ? '#ffffff' : 'var(--text-muted)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                👤 Cá nhân (1 SV)
                              </button>
                            </div>

                            {/* Nút xóa dòng nếu có từ 2 dòng trở lên */}
                            {topicRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveTopicRow(row.id)}
                                title="Xóa dòng đề tài này"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Tên đề tài */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Tên đề tài đồ án môn học (*)..."
                            value={row.ten_do_an}
                            onChange={e => handleUpdateTopicRow(row.id, 'ten_do_an', e.target.value)}
                            required
                            style={{ fontWeight: 600 }}
                          />
                        </div>

                        {/* Mô tả ngắn */}
                        <div>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Mô tả mục tiêu / yêu cầu chính (tùy chọn)..."
                            value={row.noi_dung_muc_tieu}
                            onChange={e => handleUpdateTopicRow(row.id, 'noi_dung_muc_tieu', e.target.value)}
                            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={handleAddTopicRow}
                      style={{
                        borderStyle: 'dashed',
                        borderColor: '#93c5fd',
                        color: '#2563eb',
                        justifyContent: 'center',
                        fontWeight: 700,
                        padding: '10px'
                      }}
                    >
                      + Thêm dòng đề tài thứ {topicRows.length + 1}
                    </button>
                  </div>
                )}

                {/* ---------------- CHẾ ĐỘ 2: DÁN VĂN BẢN HÀNG LOẠT ---------------- */}
                {topicInputMode === 'bulk' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1d4ed8' }}>
                      💡 <strong>Mẹo giảng viên:</strong> Copy danh sách đề tài từ Word/Excel hoặc File ghi chú rồi dán vào khung dưới đây. Hệ thống sẽ tự động bóc tách từng dòng thành các đề tài riêng biệt!
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Quy mô áp dụng mặc định:</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'nhom' ? '2px solid #7c3aed' : '1px solid var(--border)', background: bulkDefaultScale === 'nhom' ? '#faf5ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'nhom'} onChange={() => setBulkDefaultScale('nhom')} />
                          <span>👥 Tất cả là Nhóm</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'ca_nhan' ? '2px solid #0284c7' : '1px solid var(--border)', background: bulkDefaultScale === 'ca_nhan' ? '#f0f9ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'ca_nhan'} onChange={() => setBulkDefaultScale('ca_nhan')} />
                          <span>👤 Tất cả là Cá nhân</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'alternate' ? '2px solid #2563eb' : '1px solid var(--border)', background: bulkDefaultScale === 'alternate' ? '#eff6ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale" checked={bulkDefaultScale === 'alternate'} onChange={() => setBulkDefaultScale('alternate')} />
                          <span>⚡ Đan xen 50/50</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dán danh sách đề tài (mỗi dòng 1 đề tài):</label>
                      <textarea
                        className="form-textarea"
                        rows="7"
                        placeholder="Ví dụ:&#10;1. Xây dựng cổng tra cứu thông tin học vụ và lịch thi&#10;2. Hệ thống quản lý điểm rèn luyện sinh viên&#10;3. Ứng dụng theo dõi chứng chỉ tốt nghiệp cá nhân&#10;4. Nền tảng chia sẻ tài liệu ôn tập trực tuyến..."
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        style={{ fontFamily: 'monospace', fontSize: '12.5px', lineHeight: 1.5 }}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleParseBulkText}
                        style={{ fontWeight: 700, borderColor: '#2563eb', color: '#1d4ed8' }}
                      >
                        ⚡ Chuyển thành danh sách để xem & chỉnh sửa &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {topicInputMode === 'rows' ? (
                    <span>
                      Đang chuẩn bị <strong>{topicRows.filter(r => r.ten_do_an.trim()).length}</strong> đề tài cho lớp
                    </span>
                  ) : (
                    <span>
                      {bulkText.trim().split('\n').filter(l => l.trim()).length > 0
                        ? `Tìm thấy ${bulkText.trim().split('\n').filter(l => l.trim()).length} dòng đề tài`
                        : 'Chưa có nội dung dán'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateTopicModalOpen(false)}>
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang tạo...' : '+ Công bố Danh sách Đề tài'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL C: SINH VIÊN NHẬN ĐỀ TÀI CÁ NHÂN (1 NGƯỜI)
         ===================================================================== */}
      {soloConfirmTopic && (
        <div className="modal-backdrop open" onClick={() => setSoloConfirmTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>👤 Nhận Đề tài Cá nhân (1 Sinh viên)</h3>
              <button className="drawer-close-btn" onClick={() => setSoloConfirmTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleConfirmSoloSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
                    Đề tài Cá nhân (1 Người thực hiện)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0c4a6e', marginTop: '4px' }}>
                    {soloConfirmTopic.ten_do_an}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Sinh viên nhận đề tài này về cho mình:</label>
                  <select
                    className="form-select"
                    value={soloStudentId}
                    onChange={e => setSoloStudentId(e.target.value)}
                    required
                  >
                    {students.map(s => (
                      <option key={s.ma_nguoi_dung} value={s.ma_nguoi_dung}>
                        {s.ho_ten} ({s.email}) {s.da_co_nhom ? '— Đã có đề tài' : '— Chưa có đề tài'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: '8px' }}>
                  ℹ️ Bạn sẽ là người duy nhất quản lý tiến độ cho đề tài này và làm việc trực tiếp với Giảng viên.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSoloConfirmTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
                  {submitting ? 'Đang xử lý...' : '⚡ Xác nhận Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL D: SINH VIÊN LẬP NHÓM & ĐĂNG KÝ ĐỀ TÀI NHÓM
         ===================================================================== */}
      {teamModalTopic && (
        <div className="modal-backdrop open" onClick={() => setTeamModalTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>👥 Thiết lập Nhóm & Đăng ký Đề tài</h3>
              <button className="drawer-close-btn" onClick={() => setTeamModalTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                    Đề tài Nhóm (2 - 3 Sinh viên)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#4c1d95', marginTop: '3px' }}>
                    {teamModalTopic.ten_do_an}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">1. Đặt Tên Nhóm Đồ án (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nhóm Đồ án Môn học 06"
                    value={teamForm.ten_nhom}
                    onChange={e => setTeamForm(prev => ({ ...prev, ten_nhom: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">2. Chọn Thành viên & Chỉ định ai là Nhóm trưởng (*)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {students.map(sv => {
                      const isSelected = teamForm.memberIds.includes(sv.ma_nguoi_dung);
                      const isLeaderSelected = teamForm.leaderId === sv.ma_nguoi_dung;
                      return (
                        <div
                          key={sv.ma_nguoi_dung}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border)',
                            background: isSelected ? '#faf5ff' : 'var(--surface)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleMember(sv.ma_nguoi_dung)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => { }}
                              style={{ accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px' }}>{sv.ho_ten}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sv.email}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <div onClick={e => e.stopPropagation()}>
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 700, color: isLeaderSelected ? '#b45309' : '#475569', cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="portalLeaderRadio"
                                  checked={isLeaderSelected}
                                  onChange={() => setTeamForm(prev => ({ ...prev, leaderId: sv.ma_nguoi_dung }))}
                                  style={{ accentColor: '#d97706' }}
                                />
                                <span>{isLeaderSelected ? '⭐ Nhóm trưởng' : 'Làm Nhóm trưởng'}</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setTeamModalTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#7c3aed', borderColor: '#7c3aed' }}>
                  {submitting ? 'Đang tạo...' : '🚀 Hoàn tất Lập Nhóm & Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
