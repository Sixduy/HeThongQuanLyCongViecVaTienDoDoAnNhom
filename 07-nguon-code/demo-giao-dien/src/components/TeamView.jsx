import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate, getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function TeamView() {
  const { teamMembers, project, chibiMode, tasks } = useProject();

  const instructor = teamMembers?.instructor || project?.instructor;
  const members = teamMembers?.members || [];
  const team = project?.team;

  return (
    <div id="view-team-container" className="view-container">
      <div id="team-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. Giảng viên hướng dẫn - Thẻ Mentor Học Thuật */}
        <div className="kpi-card hero-mentor-card">
          <div className="hero-card-header-bar">
            <span className="hero-mentor-ribbon">Giảng viên hướng dẫn &bull; Hội đồng đánh giá</span>
          </div>

          <div className="hero-mentor-body">
            <div className="hero-mentor-left">
              <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                <div className="user-avatar hero-mentor-avatar">
                  GV
                </div>
                {chibiMode && (
                  <img
                    src={CHIBI_ASSETS.avatarFrames.gv}
                    alt="Khung GV"
                    className="hero-avatar-frame"
                  />
                )}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{instructor?.ho_ten || 'ThS. Bùi Phú Khuyên'}</span>
                  {chibiMode && (
                    <img src={CHIBI_ASSETS.badges.review10} alt="Review 10" title="Đánh giá đồ án" style={{ width: '22px', height: '22px' }} />
                  )}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {instructor?.email || 'khuyenbp@huflit.edu.vn'} &bull; Khoa Công nghệ thông tin
                </div>
                <div className="hero-mentor-quote">
                  "Đồng hành, định hướng kiến trúc chuẩn hóa CSDL và theo sát tiến độ 10 tuần của nhóm sinh viên."
                </div>
              </div>
            </div>

            {chibiMode && (
              <div className="hero-mentor-watermark">
                <img
                  src={CHIBI_ASSETS.characters.gvReview}
                  alt="GV Review"
                />
              </div>
            )}
          </div>
        </div>

        {/* 2. Thành viên nhóm sinh viên - Thẻ Hero Cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Thành viên nhóm sinh viên ({team?.ten_nhom || 'Nhóm Đồ án Môn học 05'})
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Mô hình phối hợp 2 thành viên</span>
          </div>

          <div className="hero-members-grid">
            {members.map(tv => {
              const isLeader = tv.vai_tro_trong_nhom === 'nhom_truong';
              const frame = isLeader ? CHIBI_ASSETS.avatarFrames.leader : CHIBI_ASSETS.avatarFrames.member;
              const badge = isLeader ? CHIBI_ASSETS.badges.leader : CHIBI_ASSETS.badges.onTime;
              const charImg = isLeader ? CHIBI_ASSETS.characters.ganhTa : CHIBI_ASSETS.characters.coding;

              const memberTasks = tasks?.filter(t => t.ma_nguoi_thuc_hien === tv.ma_nguoi_dung) || [];
              const doneTasks = memberTasks.filter(t => t.trang_thai === 'hoan_thanh').length;

              return (
                <div
                  key={tv.ma_thanh_vien || tv.ma_nguoi_dung}
                  className={`kpi-card hero-member-card ${isLeader ? 'card-hero-leader' : 'card-hero-member'}`}
                >
                  <div className="hero-member-header">
                    <span className={`hero-role-pill ${isLeader ? 'pill-leader' : 'pill-member'}`}>
                      {isLeader ? '★ Nhóm trưởng (Gánh Vác)' : '⚡ Lập trình viên (Chiến Binh)'}
                    </span>
                    {chibiMode && (
                      <img src={badge} alt="Badge" title={isLeader ? 'Thủ lĩnh' : 'Đúng hạn'} style={{ width: '22px', height: '22px' }} />
                    )}
                  </div>

                  <div className="hero-member-profile">
                    <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                      <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '14px', position: 'absolute', top: '4px', left: '4px' }}>
                        {getInitials(tv.ho_ten)}
                      </div>
                      {chibiMode && (
                        <img
                          src={frame}
                          alt="Frame"
                          style={{ position: 'absolute', top: '-4px', left: '-4px', width: '60px', height: '60px', pointerEvents: 'none' }}
                        />
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tv.ho_ten}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {tv.email}
                      </p>
                    </div>
                  </div>

                  <div className="hero-member-footer">
                    <div className="hero-stat-box">
                      <span className="stat-label">Công việc đảm nhiệm</span>
                      <span className="stat-value">{memberTasks.length} việc ({doneTasks} xong)</span>
                    </div>
                    <div className="hero-duty-text">
                      {isLeader
                        ? 'Phụ trách: CSDL chuẩn BCNF, Backend Node.js & Điều phối'
                        : 'Phụ trách: Giao diện React, Thuyết minh báo cáo & Kiểm thử'}
                    </div>
                  </div>

                  {/* Character Illustration Watermark */}
                  {chibiMode && (
                    <div className="hero-character-watermark">
                      <img
                        src={charImg}
                        alt="Hero Mascot"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
