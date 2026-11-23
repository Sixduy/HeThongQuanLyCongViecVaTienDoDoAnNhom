import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function TopicsBankView() {
  const {
    topics,
    users,
    currentUser,
    currentUserId,
    setCurrentUserId,
    activeProjectId,
    isLecturer,
    chibiMode,
    switchProject,
    createTopic,
    registerSoloTopic,
    registerTeamTopic,
    resetTopicRegistration
  } = useProject();

  const [scaleFilter, setScaleFilter] = useState('all'); // 'all' | 'ca_nhan' | 'nhom' | 'open'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamModalTopic, setTeamModalTopic] = useState(null);
  const [soloConfirmTopic, setSoloConfirmTopic] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Chế độ nhập đề tài: 'rows' (Nhiều dòng linh hoạt) | 'bulk' (Dán danh sách nhanh từ Word/Excel)
  const [topicInputMode, setTopicInputMode] = useState('rows');

  // Danh sách các dòng đề tài nhập cùng lúc
  const [topicRows, setTopicRows] = useState([
    { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
    { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
  ]);

  // Văn bản dán nhanh hàng loạt
  const [bulkText, setBulkText] = useState('');
  const [bulkDefaultScale, setBulkDefaultScale] = useState('nhom');

  // State tương thích
  const [newTopicForm, setNewTopicForm] = useState({
    ten_do_an: '',
    quy_mo: 'nhom',
    ten_mon_hoc: 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
    noi_dung_muc_tieu: ''
  });

  // State cho Form Sinh viên lập nhóm & chọn nhóm trưởng
  const [teamForm, setTeamForm] = useState({
    ten_nhom: '',
    leaderId: '',
    memberIds: []
  });

  // State cho Modal nhận đề tài cá nhân (1 người)
  const [soloStudentId, setSoloStudentId] = useState('');

  // Danh sách sinh viên trong lớp học phần
  const students = useMemo(() => {
    return users.filter(u => u.vai_tro_he_thong === 'sinhvien');
  }, [users]);

  // Thống kê lớp học phần
  const stats = useMemo(() => {
    const total = topics.length;
    const registered = topics.filter(t => t.da_dang_ky).length;
    const open = total - registered;
    const soloCount = topics.filter(t => t.quy_mo === 'ca_nhan').length;
    const teamCount = topics.filter(t => t.quy_mo === 'nhom').length;
    const assignedStudents = students.filter(s => s.da_co_nhom).length;
    return { total, registered, open, soloCount, teamCount, totalStudents: students.length, assignedStudents };
  }, [topics, students]);

  // Lọc danh sách đề tài
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      if (scaleFilter === 'ca_nhan') return t.quy_mo === 'ca_nhan';
      if (scaleFilter === 'nhom') return t.quy_mo === 'nhom';
      if (scaleFilter === 'open') return !t.da_dang_ky;
      return true;
    });
  }, [topics, scaleFilter]);

  // Mở Modal nhận đề tài cá nhân (1 người)
  const handleOpenSoloConfirm = (topic) => {
    // Ưu tiên chọn sinh viên hiện tại (nếu là SV), nếu đang ở vai trò GV thì gợi ý SV chưa có nhóm
    const unassignedSv = students.find(s => !s.da_co_nhom) || students[0];
    const defaultSvId = !isLecturer && currentUser ? currentUser.ma_nguoi_dung : (unassignedSv?.ma_nguoi_dung || 'u-sv-04');
    setSoloStudentId(defaultSvId);
    setSoloConfirmTopic(topic);
  };

  // Xác nhận nhận đề tài cá nhân
  const handleConfirmSoloSubmit = async (e) => {
    e.preventDefault();
    if (!soloConfirmTopic || !soloStudentId) return;
    try {
      setSubmitting(true);
      await registerSoloTopic(soloConfirmTopic.ma_do_an, soloStudentId);
      if (!isLecturer) {
        setCurrentUserId(soloStudentId);
      }
      setSoloConfirmTopic(null);
    } catch (err) {
      alert(`Lỗi nhận đề tài cá nhân: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở Modal Lập nhóm & Chọn Nhóm trưởng cho đề tài nhóm
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
    } else if (students.length >= 2) {
      defaultLeader = students[0].ma_nguoi_dung;
      defaultMembers = [students[0].ma_nguoi_dung, students[1].ma_nguoi_dung];
    }

    const nextGroupNumber = topics.filter(t => t.da_dang_ky && t.quy_mo === 'nhom').length + 5;
    setTeamForm({
      ten_nhom: `Nhóm Đồ án Môn học 0${nextGroupNumber}`,
      leaderId: defaultLeader,
      memberIds: defaultMembers
    });
    setTeamModalTopic(topic);
  };

  // Toggle chọn thành viên trong Modal lập nhóm
  const handleToggleMember = (studentId) => {
    setTeamForm(prev => {
      const exists = prev.memberIds.includes(studentId);
      let nextMembers;
      if (exists) {
        nextMembers = prev.memberIds.filter(id => id !== studentId);
      } else {
        if (prev.memberIds.length >= 3) {
          alert('Đề tài nhóm môn học giới hạn tối đa 3 thành viên!');
          return prev;
        }
        nextMembers = [...prev.memberIds, studentId];
      }
      // Đảm bảo luôn có leaderId hợp lệ nằm trong danh sách thành viên đã chọn
      let nextLeader = prev.leaderId;
      if (!nextMembers.includes(nextLeader)) {
        nextLeader = nextMembers[0] || '';
      }
      return { ...prev, memberIds: nextMembers, leaderId: nextLeader };
    });
  };

  // Xác nhận lập nhóm và đăng ký đề tài
  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamModalTopic) return;
    if (!teamForm.ten_nhom.trim()) {
      alert('Vui lòng đặt tên nhóm!');
      return;
    }
    if (teamForm.memberIds.length < 2) {
      alert('Đề tài nhóm cần tối thiểu 2 sinh viên tham gia (1 Nhóm trưởng và ít nhất 1 Thành viên). Nếu làm 1 mình, vui lòng chọn Đề tài Cá nhân!');
      return;
    }
    if (!teamForm.leaderId) {
      alert('Vui lòng chỉ định ai là Nhóm trưởng!');
      return;
    }
    try {
      setSubmitting(true);
      await registerTeamTopic(teamModalTopic.ma_do_an, {
        ten_nhom: teamForm.ten_nhom.trim(),
        leaderId: teamForm.leaderId,
        memberIds: teamForm.memberIds
      });
      if (!isLecturer) {
        setCurrentUserId(teamForm.leaderId);
      }
      setTeamModalTopic(null);
    } catch (err) {
      alert(`Lỗi đăng ký đề tài nhóm: ${err.message}`);
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

  // Giảng viên tạo đề tài mới - Hỗ trợ NHIỀU ĐỀ TÀI CÙNG LÚC
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
        ten_mon_hoc: 'Môn: Công nghệ phần mềm • Lớp 21DTHC5',
        ma_giang_vien: 'u-gv-01',
        topics: validRows.map(r => ({
          ten_do_an: r.ten_do_an.trim(),
          quy_mo: r.quy_mo,
          noi_dung_muc_tieu: r.noi_dung_muc_tieu ? r.noi_dung_muc_tieu.trim() : undefined
        }))
      };

      await createTopic(payload);
      
      setTopicRows([
        { id: 1, ten_do_an: '', quy_mo: 'nhom', noi_dung_muc_tieu: '' },
        { id: 2, ten_do_an: '', quy_mo: 'ca_nhan', noi_dung_muc_tieu: '' }
      ]);
      setBulkText('');
      setIsCreateModalOpen(false);
    } catch (err) {
      alert(`Lỗi tạo đề tài: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="topics-bank-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>
      {/* 1. Banner Tổng quan Lớp học phần & Hướng dẫn Quy trình (Chuẩn TasteSkill v2 / Linear nền sáng) */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderTop: '3px solid #2563eb',
          borderRadius: '14px',
          padding: '22px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1, flex: '1 1 460px' }}>
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.characters.gvReview}
              alt="Lớp học phần"
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
                LỚP HỌC PHẦN: 21DTHC5
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
                Môn: Công nghệ phần mềm
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
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>
              Ngân hàng Đề tài Đồ án Môn học & Đăng ký Nhóm / Cá nhân
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {isLecturer
                ? 'Giảng viên khởi tạo đề tài (quy mô Cá nhân 1 người hoặc Nhóm 2-3 người) và giám sát tiến độ toàn bộ các nhóm trong lớp học phần.'
                : 'Sinh viên chọn Đề tài Cá nhân (1 người làm độc lập) để nhận ngay, hoặc chọn Đề tài Nhóm để tự lập nhóm, đặt tên nhóm và phân công Nhóm trưởng.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 1 }}>
          {isLecturer ? (
            <button
              className="btn btn-primary"
              id="btn-open-create-topic"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: '#2563eb',
                borderColor: '#2563eb',
                color: '#ffffff',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>+ Giảng viên Tạo Đề tài Mới</span>
            </button>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.14)', fontSize: '12px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Đang thao tác với tư cách Sinh viên:</div>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentUser?.ho_ten}</span>
                {currentUser?.da_co_nhom ? (
                  <span style={{ background: '#059669', color: '#fff', fontSize: '10.5px', padding: '1px 7px', borderRadius: '99px' }}>
                    Đã có đề tài
                  </span>
                ) : (
                  <span style={{ background: '#d97706', color: '#fff', fontSize: '10.5px', padding: '1px 7px', borderRadius: '99px' }}>
                    Chưa có nhóm
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Thẻ chỉ số Thống kê Lớp học phần */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', borderTop: '3px solid #2563eb' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng Đề tài Lớp học phần</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text)', margin: '4px 0' }}>{stats.total}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
            {stats.teamCount} Đề tài nhóm &bull; {stats.soloCount} Đề tài cá nhân
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', borderTop: '3px solid #16a34a' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Đã có Nhóm / SV Nhận</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>{stats.registered}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
            Đang triển khai trên bảng Kanban
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', borderTop: '3px solid #d97706' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Đề tài Đang mở Đăng ký</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#b45309', margin: '4px 0' }}>{stats.open}</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
            Sẵn sàng để SV nhận hoặc lập nhóm
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', borderTop: '3px solid #7c3aed' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sĩ số Sinh viên trong Lớp</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#6d28d9', margin: '4px 0' }}>
            {stats.assignedStudents}/{stats.totalStudents}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
            {stats.totalStudents - stats.assignedStudents} sinh viên chưa vào nhóm
          </div>
        </div>
      </div>

      {/* 3. Thanh Bộ lọc Ngân hàng Đề tài */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'var(--surface)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>Lọc theo loại đề tài:</span>
          {[
            { id: 'all', label: `Tất cả đề tài (${stats.total})` },
            { id: 'nhom', label: `👥 Đề tài Nhóm 2-3 người (${stats.teamCount})` },
            { id: 'ca_nhan', label: `👤 Đề tài Cá nhân 1 người (${stats.soloCount})` },
            { id: 'open', label: `🟢 Còn trống chờ đăng ký (${stats.open})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setScaleFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: scaleFilter === tab.id ? '1px solid #2563eb' : '1px solid var(--border)',
                background: scaleFilter === tab.id ? '#eff6ff' : 'var(--surface-subtle)',
                color: scaleFilter === tab.id ? '#1d4ed8' : 'var(--text)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          💡 Nhấn <strong>"Mở Không gian Kanban"</strong> trên bất kỳ đề tài nào để chuyển sang quản lý công việc của đề tài đó.
        </div>
      </div>

      {/* 4. Lưới Danh sách Đề tài trong Lớp học phần */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '18px' }}>
        {filteredTopics.map(topic => {
          const isSolo = topic.quy_mo === 'ca_nhan';
          const isCurrentActive = topic.ma_do_an === activeProjectId;
          const leader = topic.team?.members?.find(m => m.vai_tro_trong_nhom === 'nhom_truong');
          const otherMembers = topic.team?.members?.filter(m => m.vai_tro_trong_nhom !== 'nhom_truong') || [];

          return (
            <div
              key={topic.ma_do_an}
              className="topic-card"
              style={{
                background: 'var(--surface)',
                border: isCurrentActive ? '2px solid #2563eb' : '1px solid var(--border)',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: isCurrentActive ? '0 8px 24px rgba(37, 99, 235, 0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Hàng Badge Quy mô & Trạng thái */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: isSolo ? '#e0f2fe' : '#f3e8ff',
                        color: isSolo ? '#0369a1' : '#6d28d9',
                        border: isSolo ? '1px solid #bae6fd' : '1px solid #e9d5ff'
                      }}
                    >
                      <span>{isSolo ? '👤 Đề tài Cá nhân (1 SV)' : '👥 Đề tài Nhóm (2 - 3 SV)'}</span>
                    </span>

                    {isCurrentActive && (
                      <span style={{ background: '#2563eb', color: '#fff', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px' }}>
                        Đang mở Workspace
                      </span>
                    )}
                  </div>

                  {topic.da_dang_ky ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <span>✓ Đã đăng ký &bull; {Number(topic.tien_do_tong || 0).toFixed(0)}%</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: '#fef3c7',
                        color: '#b45309',
                        border: '1px solid #fde68a'
                      }}
                    >
                      <span>🟢 Đang mở chờ SV chọn</span>
                    </span>
                  )}
                </div>

                {/* Tiêu đề & Mô tả đề tài */}
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
                  {topic.ten_do_an}
                </h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                  {topic.mo_ta_sach}
                </p>

                {/* Thông tin phụ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11.5px', color: 'var(--text-subtle)', flexWrap: 'wrap' }}>
                  <span>👨‍🏫 GV ra đề: <strong>{topic.ten_giang_vien || 'ThS. Bùi Phú Khuyên'}</strong></span>
                  <span>&bull;</span>
                  <span>🚩 {topic.so_moc} Mốc bàn giao</span>
                  <span>&bull;</span>
                  <span>📋 {topic.so_cong_viec} Công việc</span>
                </div>
              </div>

              {/* Khu vực Nhóm thực hiện HOẶC Nút Đăng ký */}
              {topic.da_dang_ky && topic.team ? (
                <div
                  style={{
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{isSolo ? '👤 Thực hiện độc lập:' : '🛡️ Nhóm phụ trách:'}</span>
                      <span style={{ color: '#1d4ed8' }}>{topic.team.ten_nhom}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {topic.team.members?.length || 1}/{topic.so_luong_toi_da} SV
                    </span>
                  </div>

                  {/* Danh sách Nhóm trưởng & Thành viên */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    {leader && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getInitials(leader.ho_ten)}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leader.ho_ten}</span>
                        <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '10.5px', fontWeight: 700, padding: '1px 7px', borderRadius: '99px' }}>
                          {isSolo ? '⭐ Chủ nhiệm đề tài (1 người)' : '⭐ Nhóm trưởng'}
                        </span>
                      </div>
                    )}

                    {otherMembers.map(mem => (
                      <div key={mem.ma_nguoi_dung} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: '#64748b',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getInitials(mem.ho_ten)}
                        </span>
                        <span style={{ color: 'var(--text)' }}>{mem.ho_ten}</span>
                        <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '10.5px', fontWeight: 600, padding: '1px 7px', borderRadius: '99px' }}>
                          Thành viên
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Nút mở Workspace Kanban + Nút Reset Demo */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => switchProject(topic.ma_do_an, true)}
                      style={{ flex: 1, justifyContent: 'center', fontWeight: 600 }}
                    >
                      <span>{isCurrentActive ? '✓ Đang ở Workspace này (Xem Kanban)' : '🚀 Mở Không gian Kanban của Đề tài →'}</span>
                    </button>

                    {topic.ma_do_an !== 'da-dacs-01' && (
                      <button
                        className="btn btn-outline btn-sm"
                        title="Hủy đăng ký để demo lại luồng chọn đề tài từ đầu"
                        onClick={() => {
                          if (window.confirm(`Đặt lại đề tài "${topic.ten_do_an}" về trạng thái trống chưa đăng ký để bạn có thể demo lại?`)) {
                            resetTopicRegistration(topic.ma_do_an);
                          }
                        }}
                        style={{ fontSize: '11px', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                      >
                        Đặt lại trống
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: isSolo ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' : 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                    border: isSolo ? '1px dashed #38bdf8' : '1px dashed #a855f7',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: isSolo ? '#0c4a6e' : '#581c87', lineHeight: 1.45 }}>
                    {isSolo ? (
                      <>
                        <strong>Quy định Đề tài 1 người:</strong> Sinh viên không cần lập nhóm, chỉ cần bấm chọn để nhận trực tiếp đề tài về cho cá nhân mình thực hiện.
                      </>
                    ) : (
                      <>
                        <strong>Quy định Đề tài Nhóm (2-3 SV):</strong> Sinh viên cần thực hiện <strong>tạo nhóm</strong>, <strong>đặt tên nhóm</strong>, chỉ định <strong>ai là Nhóm trưởng</strong> và chọn thành viên cùng làm.
                      </>
                    )}
                  </div>

                  {isSolo ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenSoloConfirm(topic)}
                      style={{
                        background: '#0284c7',
                        borderColor: '#0284c7',
                        justifyContent: 'center',
                        fontWeight: 700,
                        padding: '8px 14px'
                      }}
                    >
                      <span>⚡ Chọn & Nhận Đề tài Cá nhân về cho mình (1 người)</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenTeamModal(topic)}
                      style={{
                        background: '#7c3aed',
                        borderColor: '#7c3aed',
                        justifyContent: 'center',
                        fontWeight: 700,
                        padding: '8px 14px'
                      }}
                    >
                      <span>👥 Tạo Nhóm (Đặt tên & Phân Nhóm trưởng) để chọn Đề tài này</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Bảng Danh sách Sinh viên trong Lớp học phần & Trạng thái Phân nhóm */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
              📋 Danh sách Sinh viên Lớp học phần (21DTHC5) & Tình trạng Nhận Đề tài
            </h4>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Giảng viên và Sinh viên có thể theo dõi bạn nào đã có nhóm, bạn nào làm cá nhân 1 mình hoặc bạn nào còn trống để ghép nhóm.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '12px' }}>
                <th style={{ padding: '10px 12px' }}>Sinh viên</th>
                <th style={{ padding: '10px 12px' }}>Email học vụ</th>
                <th style={{ padding: '10px 12px' }}>Trạng thái Nhóm / Cá nhân</th>
                <th style={{ padding: '10px 12px' }}>Vai trò đảm nhiệm</th>
                <th style={{ padding: '10px 12px' }}>Đề tài đang thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {students.map(sv => {
                const membership = sv.danh_sach_nhom?.[0] || null;
                const isSoloGroup = membership?.ten_nhom?.startsWith('Cá nhân');
                return (
                  <tr key={sv.ma_nguoi_dung} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: membership ? '#1e293b' : '#94a3b8',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {getInitials(sv.ho_ten)}
                      </span>
                      <span>{sv.ho_ten}</span>
                      {sv.ma_nguoi_dung === currentUserId && (
                        <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>
                          Bạn
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{sv.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {membership ? (
                        <span
                          style={{
                            background: isSoloGroup ? '#e0f2fe' : '#f3e8ff',
                            color: isSoloGroup ? '#0369a1' : '#6d28d9',
                            padding: '2px 9px',
                            borderRadius: '99px',
                            fontSize: '11.5px',
                            fontWeight: 700
                          }}
                        >
                          {membership.ten_nhom}
                        </span>
                      ) : (
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 9px', borderRadius: '99px', fontSize: '11.5px', fontWeight: 600 }}>
                          Chưa có nhóm / Chờ chọn đề tài
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {membership ? (
                        membership.vai_tro_trong_nhom === 'nhom_truong' ? (
                          <span style={{ color: '#b45309', fontWeight: 700, fontSize: '12px' }}>
                            {isSoloGroup ? '👤 Cá nhân tự chủ (1 người)' : '⭐ Nhóm trưởng'}
                          </span>
                        ) : (
                          <span style={{ color: '#475569', fontWeight: 600, fontSize: '12px' }}>Thành viên nhóm</span>
                        )
                      ) : (
                        <span style={{ color: 'var(--text-subtle)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                      {membership ? (
                        <span
                          onClick={() => switchProject(membership.ma_do_an, true)}
                          style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                          title="Nhấn để mở bảng Kanban của đề tài này"
                        >
                          {membership.ten_do_an}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic' }}>Chưa đăng ký đề tài</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================================
          MODAL 1: SINH VIÊN CHỌN & NHẬN ĐỀ TÀI CÁ NHÂN (1 NGƯỜI)
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
                    Đề tài Cá nhân (Không cần tạo nhóm nhiều người)
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0c4a6e', marginTop: '4px' }}>
                    {soloConfirmTopic.ten_do_an}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
                    {soloConfirmTopic.mo_ta_sach}
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
                        {s.ho_ten} ({s.email}) {s.da_co_nhom ? '— Đã có đề tài khác' : '— Chưa có đề tài (Khuyên chọn)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface-subtle)', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.5 }}>
                  ℹ️ Hệ thống sẽ tự động gán đề tài này cho cá nhân bạn, khởi tạo không gian Kanban riêng và bạn toàn quyền tự quản lý tiến độ công việc để báo cáo Giảng viên.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setSoloConfirmTopic(null)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#0284c7', borderColor: '#0284c7' }}>
                  {submitting ? 'Đang xử lý...' : '⚡ Xác nhận Lấy Đề tài về cho mình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: SINH VIÊN TẠO NHÓM, ĐẶT TÊN NHÓM, CHỌN NHÓM TRƯỞNG & ĐĂNG KÝ
         ===================================================================== */}
      {teamModalTopic && (
        <div className="modal-backdrop open" onClick={() => setTeamModalTopic(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>👥 Thiết lập Nhóm & Đăng ký Đề tài Nhóm</h3>
              <button className="drawer-close-btn" onClick={() => setTeamModalTopic(null)}>✕</button>
            </div>
            <form onSubmit={handleTeamSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Thông tin đề tài đang chọn */}
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
                    Đề tài Nhóm (2 - 3 Sinh viên)
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#4c1d95', marginTop: '3px' }}>
                    {teamModalTopic.ten_do_an}
                  </div>
                </div>

                {/* Bước 1: Đặt tên nhóm */}
                <div className="form-group">
                  <label className="form-label">1. Đặt Tên Nhóm Đồ án (*)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Nhóm Đồ án Môn học 06 - Alpha Team"
                    value={teamForm.ten_nhom}
                    onChange={e => setTeamForm(prev => ({ ...prev, ten_nhom: e.target.value }))}
                    required
                  />
                </div>

                {/* Bước 2: Chọn thành viên và Phân công ai là Nhóm trưởng */}
                <div className="form-group">
                  <label className="form-label">
                    2. Chọn Thành viên (2-3 SV) & Chỉ định ai là Nhóm trưởng (*)
                  </label>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Tích chọn các sinh viên tham gia nhóm, sau đó bấm chọn <strong>"Làm Nhóm trưởng"</strong> cho 1 người:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
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
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #7c3aed' : '1px solid var(--border)',
                            background: isSelected ? '#faf5ff' : 'var(--surface)',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleMember(sv.ma_nguoi_dung)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                                {sv.ho_ten}
                                {!sv.da_co_nhom && (
                                  <span style={{ marginLeft: '6px', fontSize: '10.5px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '99px', fontWeight: 700 }}>
                                    Đang trống nhóm
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sv.email}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <div onClick={e => e.stopPropagation()}>
                              <label
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '99px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  background: isLeaderSelected ? '#fef3c7' : '#f1f5f9',
                                  color: isLeaderSelected ? '#b45309' : '#475569',
                                  border: isLeaderSelected ? '1px solid #f59e0b' : '1px solid #cbd5e1'
                                }}
                              >
                                <input
                                  type="radio"
                                  name="teamLeaderRadio"
                                  checked={isLeaderSelected}
                                  onChange={() => setTeamForm(prev => ({ ...prev, leaderId: sv.ma_nguoi_dung }))}
                                  style={{ accentColor: '#d97706' }}
                                />
                                <span>{isLeaderSelected ? '⭐ Nhóm trưởng' : 'Chọn làm Nhóm trưởng'}</span>
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
                  {submitting ? 'Đang tạo nhóm...' : '🚀 Xác nhận Lập Nhóm & Nhận Đề tài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: GIẢNG VIÊN TẠO NHIỀU ĐỀ TÀI CÙNG LÚC TRONG LỚP HỌC PHẦN
         ===================================================================== */}
      {isCreateModalOpen && (
        <div className="modal-backdrop open" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '92vw' }}>
            <div className="modal-header" style={{ paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                  👨‍🏫 GVPTMH Thêm Đề tài vào Ngân hàng Đề tài Môn học
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cho phép thêm nhiều đề tài cùng lúc cho lớp học phần để sinh viên lựa chọn làm Nhóm (2-3 SV) hoặc Cá nhân (1 SV).
                </p>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsCreateModalOpen(false)}>✕</button>
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>
                            Đề tài #{idx + 1}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <input type="radio" name="bulkScale2" checked={bulkDefaultScale === 'nhom'} onChange={() => setBulkDefaultScale('nhom')} />
                          <span>👥 Tất cả là Nhóm</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'ca_nhan' ? '2px solid #0284c7' : '1px solid var(--border)', background: bulkDefaultScale === 'ca_nhan' ? '#f0f9ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale2" checked={bulkDefaultScale === 'ca_nhan'} onChange={() => setBulkDefaultScale('ca_nhan')} />
                          <span>👤 Tất cả là Cá nhân</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', border: bulkDefaultScale === 'alternate' ? '2px solid #2563eb' : '1px solid var(--border)', background: bulkDefaultScale === 'alternate' ? '#eff6ff' : 'var(--surface)', cursor: 'pointer' }}>
                          <input type="radio" name="bulkScale2" checked={bulkDefaultScale === 'alternate'} onChange={() => setBulkDefaultScale('alternate')} />
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
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>
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
      )}
    </div>
  );
}
