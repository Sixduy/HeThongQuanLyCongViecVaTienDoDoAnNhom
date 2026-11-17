import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getInitials } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';
import MiniCalendarWidget from './MiniCalendarWidget.jsx';

export default function KanbanBoard() {
  const { filteredTasks, setSelectedTaskId, selfRateTask, currentUserId, isLeader, isLecturer, chibiMode } = useProject();

  const columns = [
    { key: 'can_lam', label: 'Cần làm', badgeClass: 'badge-can-lam', icon: CHIBI_ASSETS.icons.todo },
    { key: 'dang_lam', label: 'Đang làm', badgeClass: 'badge-dang-lam', icon: CHIBI_ASSETS.icons.progress },
    { key: 'hoan_thanh', label: 'Hoàn thành', badgeClass: 'badge-hoan-thanh', icon: CHIBI_ASSETS.icons.done },
    { key: 'tre_han', label: 'Trễ hạn', badgeClass: 'badge-tre-han', icon: CHIBI_ASSETS.icons.flame }
  ];

  return (
    <div id="view-kanban-container" className="view-container">
      {/* Main Kanban Content Area with Permanent Mini Calendar */}
      <div className="kanban-layout-wrapper">
        <div className="kanban-board-container">
          <div className="kanban-board">
            {columns.map(col => {
              const colTasks = filteredTasks.filter(t => t.trang_thai === col.key);
              return (
                <div key={col.key} className="kanban-col" data-status={col.key}>
                  <div className="kanban-col-header">
                    <span className="kanban-col-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {chibiMode && (
                        <img
                          src={col.icon}
                          alt={col.label}
                          style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                        />
                      )}
                      <span className={`col-badge ${col.badgeClass}`}>{colTasks.length}</span>
                      <span>{col.label}</span>
                    </span>
                  </div>

                  <div className="kanban-cards-list" id={`list-${col.key}`}>
                    {colTasks.length === 0 ? (
                      <div className="kanban-empty-col" style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-subtle)' }}>
                        {chibiMode && (
                          <img
                            src={CHIBI_ASSETS.characters.emptyWait}
                            alt="Trống"
                            style={{ width: '72px', height: '72px', objectFit: 'contain', margin: '0 auto 10px', display: 'block', opacity: 0.85 }}
                          />
                        )}
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>Chưa có việc nào</span>
                      </div>
                    ) : (
                      colTasks.map(task => {
                        const initials = getInitials(task.ten_nguoi_thuc_hien);
                        const isLocked = Boolean(task.trang_thai_khoa);
                        const isOverdue = task.trang_thai === 'tre_han';
                        const shortName = task.ten_nguoi_thuc_hien
                          ? task.ten_nguoi_thuc_hien.trim().split(/\s+/).slice(-1)[0]
                          : 'Chưa gán';

                        // Quyền tự chấm tiến độ cho bản thân hoặc quản lý
                        const isMyTask = task.ma_nguoi_thuc_hien === currentUserId;
                        const canSelfRate = (isMyTask || isLeader || isLecturer) && !isLocked;

                        return (
                          <div
                            key={task.ma_cong_viec}
                            className={`task-card ${isMyTask ? 'my-task-card' : ''}`}
                            data-task-id={task.ma_cong_viec}
                            onClick={() => setSelectedTaskId(task.ma_cong_viec)}
                          >
                            <div className="task-card-header">
                              <span className="task-title">{task.tieu_de}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                {isLocked ? (
                                  chibiMode ? (
                                    <img src={CHIBI_ASSETS.labels.approved} alt="Approved" style={{ height: '22px', objectFit: 'contain' }} />
                                  ) : (
                                    <span className="lock-indicator">🔒 Đã khóa</span>
                                  )
                                ) : (
                                  chibiMode && (
                                    task.phan_tram_tien_do === 100 ? (
                                      <img src={CHIBI_ASSETS.labels.done} alt="Done" style={{ height: '20px', objectFit: 'contain' }} />
                                    ) : (
                                      isOverdue && (
                                        <img src={CHIBI_ASSETS.labels.chayDeadline} alt="Trễ hạn" style={{ height: '18px', objectFit: 'contain' }} />
                                      )
                                    )
                                  )
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                              <span className="task-milestone-tag" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {task.ten_moc || 'Chưa gán mốc'}
                              </span>
                              {isMyTask && (
                                <span className="my-task-pill" title="Công việc được giao cho bạn">
                                  ★ Của bạn
                                </span>
                              )}
                            </div>

                            {/* Dải nút Tự chấm tiến độ nhanh cho bản thân */}
                            {canSelfRate && (
                              <div
                                className="quick-self-rate-container"
                                onClick={(e) => e.stopPropagation()}
                                title="Tự chấm tiến độ cho công việc này"
                              >
                                <span className="rate-hint">Tự chấm %:</span>
                                {[25, 50, 75, 100].map(pct => (
                                  <button
                                    key={pct}
                                    className={`btn-quick-rate ${task.phan_tram_tien_do === pct ? 'active' : ''}`}
                                    onClick={() => selfRateTask(task.ma_cong_viec, pct)}
                                  >
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            )}

                            <div className="task-card-footer">
                              <div className="task-assignee">
                                <div className="avatar-tiny">{initials}</div>
                                <span>{shortName}</span>
                              </div>
                              <div className="task-progress-mini">
                                <div className="progress-mini-bar">
                                  <div
                                    className="progress-mini-fill"
                                    style={{
                                      width: `${task.phan_tram_tien_do}%`,
                                      backgroundColor: task.phan_tram_tien_do === 100 ? '#15803d' : '#1d4ed8'
                                    }}
                                  ></div>
                                </div>
                                <span className="num-tabular">{task.phan_tram_tien_do}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini Calendar Widget permanently visible on the right */}
        <MiniCalendarWidget />
      </div>
    </div>
  );
}
