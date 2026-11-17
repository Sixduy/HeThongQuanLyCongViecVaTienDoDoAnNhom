import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { formatDate } from '../utils/formatters.js';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function TableView() {
  const { filteredTasks, setSelectedTaskId, selfRateTask, currentUserId, isLeader, isLecturer, chibiMode } = useProject();

  return (
    <div id="view-table-container" className="view-container">
      <div className="table-view-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '36%' }}>Tiêu đề công việc</th>
              <th style={{ width: '18%' }}>Mốc trực thuộc</th>
              <th style={{ width: '16%' }}>Người phụ trách</th>
              <th style={{ width: '12%' }}>Hạn chót</th>
              <th style={{ width: '12%', textAlign: 'center' }}>% Tự chấm</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Khóa</th>
            </tr>
          </thead>
          <tbody id="table-tasks-body">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  {chibiMode && (
                    <img
                      src={CHIBI_ASSETS.characters.empty}
                      alt="Trống"
                      style={{ width: '48px', height: '48px', margin: '0 auto 8px', display: 'block' }}
                    />
                  )}
                  Không có công việc nào trong danh mục này.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => {
                const isLocked = Boolean(task.trang_thai_khoa);
                const isMyTask = task.ma_nguoi_thuc_hien === currentUserId;
                const canSelfRate = (isMyTask || isLeader || isLecturer) && !isLocked;

                return (
                  <tr
                    key={task.ma_cong_viec}
                    data-task-id={task.ma_cong_viec}
                    onClick={() => setSelectedTaskId(task.ma_cong_viec)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{task.tieu_de}</span>
                        {isLocked && <span style={{ fontSize: '11px', color: '#b45309' }}>&#128274;</span>}
                        {isMyTask && (
                          <span className="my-task-pill" style={{ fontSize: '10px', padding: '1px 5px' }}>
                            Của bạn
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{task.ten_moc || 'N/A'}</td>
                    <td>
                      {task.ten_nguoi_thuc_hien || (
                        <span style={{ color: 'var(--text-subtle)' }}>Chưa gán</span>
                      )}
                    </td>
                    <td className="date-cell">{formatDate(task.han_chot)}</td>
                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      {canSelfRate ? (
                        <select
                          className="table-rate-select"
                          value={task.phan_tram_tien_do}
                          onChange={(e) => selfRateTask(task.ma_cong_viec, Number(e.target.value))}
                          style={{
                            padding: '3px 6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            background: task.phan_tram_tien_do === 100 ? '#f0fdf4' : 'var(--surface)',
                            color: task.phan_tram_tien_do === 100 ? '#15803d' : 'var(--text)',
                            cursor: 'pointer'
                          }}
                          title="Tự chấm % tiến độ nhanh"
                        >
                          <option value="0">0%</option>
                          <option value="25">25%</option>
                          <option value="50">50%</option>
                          <option value="75">75%</option>
                          <option value="100">100%</option>
                        </select>
                      ) : (
                        <span style={{ fontWeight: 600 }} className="num-tabular">
                          {task.phan_tram_tien_do}%
                        </span>
                      )}
                      {chibiMode && task.phan_tram_tien_do === 100 && (
                        <img
                          src={CHIBI_ASSETS.labels.done}
                          alt="Done"
                          style={{ height: '12px', marginLeft: '4px', verticalAlign: 'middle' }}
                        />
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isLocked ? (
                        chibiMode ? (
                          <img src={CHIBI_ASSETS.labels.approved} alt="Locked" style={{ height: '14px' }} />
                        ) : '🔒'
                      ) : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
