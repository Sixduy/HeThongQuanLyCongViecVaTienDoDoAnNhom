import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function NotificationCenter() {
  const { notifications, chibiMode } = useProject();

  return (
    <div id="view-notifications-container" className="view-container">
      <div id="notifications-list-render" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div className="kpi-card" style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {chibiMode && (
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <img src={CHIBI_ASSETS.characters.notify} alt="Thông báo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                <img src={CHIBI_ASSETS.icons.boba} alt="Trà sữa" style={{ width: '42px', height: '42px', objectFit: 'contain', alignSelf: 'flex-end' }} />
              </div>
            )}
            <h4 style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>Không có thông báo mới</h4>
            <p style={{ fontSize: '12.5px' }}>
              Bạn đã xử lý hết mọi công việc hiện tại. Hãy nghỉ ngơi hoặc xem lại các mốc đồ án nhé!
            </p>
          </div>
        ) : (
          notifications.map(tb => {
            const isOverdue = tb.loai_thong_bao === 'canh_bao_tre_han';
            return (
              <div
                key={tb.ma_thong_bao}
                className="comment-card"
                style={{
                  background: tb.trang_thai_doc ? 'var(--ground)' : 'var(--surface)',
                  borderLeft: isOverdue ? '3px solid #b91c1c' : '3px solid #18181b',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}
              >
                {chibiMode && (
                  <img
                    src={isOverdue ? CHIBI_ASSETS.icons.flame : CHIBI_ASSETS.icons.bell}
                    alt="Icon"
                    style={{ width: '28px', height: '28px', objectFit: 'contain', flexShrink: 0, marginTop: '2px' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: isOverdue ? '#b91c1c' : 'var(--text)' }}>
                      {tb.tieu_de}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                      {formatDate(tb.thoi_gian_tao)}
                    </span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {tb.noi_dung || ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
