import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate, getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function TeamView() {
  const { teamMembers, project, chibiMode } = useProject();

  const instructor = teamMembers?.instructor || project?.instructor;
  const members = teamMembers?.members || [];
  const team = project?.team;

  return (
    <div id="view-team-container" className="view-container">
      <div id="team-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Giảng viên hướng dẫn */}
        <div className="kpi-card" style={{ padding: '18px 20px', position: 'relative' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Giảng viên hướng dẫn
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
                <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '13px', position: 'absolute', top: '3px', left: '3px' }}>
                  GV
                </div>
                {chibiMode && (
                  <img
                    src={CHIBI_ASSETS.avatarFrames.gv}
                    alt="Khung GV"
                    style={{ position: 'absolute', top: '-4px', left: '-4px', width: '54px', height: '54px', pointerEvents: 'none' }}
                  />
                )}
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{instructor?.ho_ten || 'ThS. Bùi Phú Khuyên'}</span>
                  {chibiMode && (
                    <img src={CHIBI_ASSETS.badges.review10} alt="Review 10" title="Đánh giá đồ án" style={{ width: '18px', height: '18px' }} />
                  )}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{instructor?.email || 'bpkhuyen@hutech.edu.vn'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {chibiMode && (
                <img
                  src={CHIBI_ASSETS.characters.gvReview}
                  alt="GV Review"
                  style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                />
              )}
              <span className="meta-pill" style={{ background: '#f1f5f9', fontWeight: 600 }}>Phụ trách đồ án</span>
            </div>
          </div>
        </div>

        {/* Thành viên nhóm sinh viên */}
        <div className="kpi-card" style={{ padding: '18px 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Thành viên nhóm sinh viên ({team?.ten_nhom || 'Nhóm'})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {members.map(tv => {
              const isLeader = tv.vai_tro_trong_nhom === 'nhom_truong';
              const frame = isLeader ? CHIBI_ASSETS.avatarFrames.leader : CHIBI_ASSETS.avatarFrames.member;
              const badge = isLeader ? CHIBI_ASSETS.badges.leader : CHIBI_ASSETS.badges.onTime;
              const charImg = isLeader ? CHIBI_ASSETS.characters.ganhTa : CHIBI_ASSETS.characters.coding;

              return (
                <div
                  key={tv.ma_thanh_vien || tv.ma_nguoi_dung}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '12.5px', position: 'absolute', top: '3px', left: '3px' }}>
                        {getInitials(tv.ho_ten)}
                      </div>
                      {chibiMode && (
                        <img
                          src={frame}
                          alt="Frame"
                          style={{ position: 'absolute', top: '-4px', left: '-4px', width: '50px', height: '50px', pointerEvents: 'none' }}
                        />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{tv.ho_ten}</span>
                        {chibiMode && (
                          <img src={badge} alt="Badge" title={isLeader ? 'Gánh đội' : 'Nộp đúng hạn'} style={{ width: '16px', height: '16px' }} />
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {tv.email} &bull; Tham gia: {formatDate(tv.thoi_gian_tham_gia)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {chibiMode && (
                      <img
                        src={charImg}
                        alt="Mascot"
                        title={isLeader ? 'Nhóm trưởng gánh tạ' : 'Thành viên coding'}
                        style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                      />
                    )}
                    <span
                      className="meta-pill"
                      style={isLeader ? { background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 600 } : {}}
                    >
                      {isLeader ? '★ Nhóm trưởng' : 'Thành viên'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
