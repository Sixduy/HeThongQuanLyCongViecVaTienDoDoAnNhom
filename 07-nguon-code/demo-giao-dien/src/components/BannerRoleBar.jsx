import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function BannerRoleBar() {
  const { currentUserId, setCurrentUserId, isLecturer, isLeader, chibiMode, toggleChibiMode } = useProject();

  let permissionHint = '';
  if (isLecturer) {
    permissionHint = 'Quyền hạn: Xem toàn cảnh đồ án, đánh giá mốc Milestone & khóa tiến độ';
  } else if (isLeader) {
    permissionHint = 'Quyền hạn: Quản trị nhóm, phân việc, tự chấm tiến độ & chốt khóa';
  } else {
    permissionHint = 'Quyền hạn: Tự chấm tiến độ cho bản thân (25%-100%), gửi phản hồi sticker & nộp tệp';
  }

  return (
    <div className="demo-role-banner">
      <div className="banner-title">
        {chibiMode && (
          <img
            src={CHIBI_ASSETS.logos.gearTick}
            alt="DACS Logo"
            style={{ width: '30px', height: '30px', marginRight: '8px', objectFit: 'contain' }}
          />
        )}
        <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.4px' }}>HỆ THỐNG QUẢN LÝ ĐỒ ÁN MÔN HỌC</span>
        <span className="banner-hint-text" style={{ fontSize: '11.5px', color: '#a1a1aa', marginLeft: '8px' }}>
          &bull; {permissionHint}
        </span>
      </div>

      <div className="role-switch-buttons">
        <span style={{ alignSelf: 'center', color: '#a1a1aa', fontSize: '11.5px', marginRight: '4px' }}>
          Vai trò:
        </span>
        <button
          className={`btn-role-tab ${currentUserId === 'u-gv-01' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-gv-01')}
          title="Xem với vai trò Giảng viên hướng dẫn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.badges.review10}
              alt="GV"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          )}
          <span>ThS. Bùi Phú Khuyên (GVHD)</span>
        </button>
        <button
          className={`btn-role-tab ${currentUserId === 'u-sv-01' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-sv-01')}
          title="Xem với vai trò Nhóm trưởng (Tự chấm & Quản lý)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.badges.leader}
              alt="Leader"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          )}
          <span>Đỗ Minh Trực (Nhóm trưởng)</span>
        </button>
        <button
          className={`btn-role-tab ${currentUserId === 'u-sv-02' ? 'active' : ''}`}
          onClick={() => setCurrentUserId('u-sv-02')}
          title="Xem với vai trò Thành viên (Tự chấm tiến độ bản thân)"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.badges.fresher}
              alt="Member"
              style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          )}
          <span>Trần Minh Duy (Thành viên)</span>
        </button>

        {/* Chibi Mascot Mode Toggle Button */}
        <button
          className={`btn-chibi-toggle ${chibiMode ? 'active' : ''}`}
          onClick={toggleChibiMode}
          title={chibiMode ? 'Chuyển sang giao diện Tối giản (Minimalist)' : 'Bật giao diện Chibi Mascot sinh động'}
          style={{
            marginLeft: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            border: chibiMode ? '1px solid #f59e0b' : '1px solid #3f3f46',
            background: chibiMode ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#27272a',
            color: chibiMode ? '#92400e' : '#a1a1aa',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{chibiMode ? '✨ Chibi: BẬT' : '🌿 Tối giản'}</span>
        </button>
      </div>
    </div>
  );
}
