import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function MilestonesView() {
  const { milestones, chibiMode } = useProject();

  return (
    <div id="view-milestones-container" className="view-container">
      {/* Hành trình đồ án 10 tuần (Journey Map Banner) */}
      {chibiMode && (
        <div
          className="journey-map-banner"
          style={{
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '1px solid #bae6fd',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={CHIBI_ASSETS.icons.flag} alt="Flag" style={{ width: '22px', height: '22px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0369a1' }}>
                Bản đồ Hành trình Lộ trình Đồ án (10 Tuần)
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px', maxWidth: '540px', lineHeight: '1.4' }}>
              Theo dõi 4 cột mốc chính từ Khảo sát, Đặc tả BCNF đến Lập trình Fullstack và Hoàn thiện báo cáo nghiệm thu.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <img
              src={CHIBI_ASSETS.journey}
              alt="Hành trình Đồ án"
              style={{
                maxHeight: '75px',
                width: 'auto',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            />
          </div>
        </div>
      )}

      <div id="milestones-list-render" className="milestones-timeline-flow">
        {milestones.map((m, idx) => {
          const total = m.tong_so_viec || 0;
          const completed = m.so_viec_hoan_thanh || 0;
          const progress = total ? Math.round((completed / total) * 100) : 0;
          const isDone = progress === 100;
          const isActive = progress > 0 && progress < 100;

          return (
            <div
              key={m.ma_moc}
              className={`kpi-card milestone-timeline-card ${isDone ? 'milestone-card-done' : isActive ? 'milestone-card-active' : ''}`}
            >
              {/* Con dấu Mộc đỏ Nghiệm Thu khi hoàn thành 100% */}
              {chibiMode && isDone && (
                <div className="milestone-rubber-stamp-seal">
                  <img src={CHIBI_ASSETS.labels.approved} alt="Đạt chuẩn nghiệm thu" />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div className="milestone-step-badge">
                    <span>0{idx + 1}</span>
                  </div>
                  {chibiMode && (
                    <img
                      src={isDone ? CHIBI_ASSETS.icons.trophy : (isActive ? CHIBI_ASSETS.characters.milestoneFlag : CHIBI_ASSETS.icons.checklist)}
                      alt="Milestone"
                      style={{ width: '42px', height: '42px', objectFit: 'contain', flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{m.ten_moc}</h3>
                      {isActive && (
                        <span className="milestone-live-pill">
                          <span className="pulse-live-dot"></span> Đang chạy mốc này
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '580px' }}>
                      {m.noi_dung_mo_ta || ''}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className="meta-pill" style={{ fontWeight: 600 }}>
                    Hạn chót: {formatDate(m.han_hoan_thanh)}
                  </span>
                  {chibiMode && isDone && (
                    <img src={CHIBI_ASSETS.logos.stampOnTrack} alt="Đạt tiến độ" style={{ height: '22px', objectFit: 'contain' }} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
                <div className="progress-track" style={{ height: '8px', flex: 1, backgroundColor: '#e2e8f0' }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                      background: isDone ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'linear-gradient(90deg, #2563eb, #3b82f6)'
                    }}
                  ></div>
                </div>
                <span className="num-tabular" style={{ fontSize: '12.5px', fontWeight: 700, minWidth: '95px' }}>
                  {completed}/{total} việc ({progress}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
