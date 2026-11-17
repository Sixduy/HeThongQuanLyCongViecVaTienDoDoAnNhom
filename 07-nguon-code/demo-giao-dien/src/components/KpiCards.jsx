import React from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

export default function KpiCards() {
  const { filteredTasks, chibiMode } = useProject();

  const inProgress = filteredTasks.filter(t => t.trang_thai === 'dang_lam').length;
  const completed = filteredTasks.filter(t => t.trang_thai === 'hoan_thanh').length;
  const overdue = filteredTasks.filter(t => t.trang_thai === 'tre_han').length;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Tổng số công việc</span>
            <span className="kpi-value num-tabular" id="kpi-total-tasks">{filteredTasks.length}</span>
            <span className="kpi-subtext">Trong 4 mốc tiến độ</span>
          </div>
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.icons.checklist}
              alt="Tổng việc"
              className="kpi-chibi-img"
            />
          )}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Đang thực hiện</span>
            <span className="kpi-value num-tabular" style={{ color: '#1d4ed8' }} id="kpi-in-progress">
              {inProgress}
            </span>
            <span className="kpi-subtext">Đang trong hạn quy định</span>
          </div>
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.characters.coding}
              alt="Đang thực hiện"
              className="kpi-chibi-img"
            />
          )}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Đã hoàn thành</span>
            <span className="kpi-value num-tabular" style={{ color: '#15803d' }} id="kpi-completed">
              {completed}
            </span>
            <span className="kpi-subtext">Đã chốt tiến độ</span>
          </div>
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.icons.trophy}
              alt="Hoàn thành"
              className="kpi-chibi-img"
            />
          )}
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-inner">
          <div className="kpi-card-text">
            <span className="kpi-label">Cảnh báo trễ hạn</span>
            <span className="kpi-value num-tabular" style={{ color: '#b91c1c' }} id="kpi-overdue">
              {overdue}
            </span>
            <span className="kpi-subtext">Cần xử lý gấp</span>
          </div>
          {chibiMode && (
            <img
              src={CHIBI_ASSETS.characters.tieuChay}
              alt="Trễ hạn"
              className="kpi-chibi-img"
            />
          )}
        </div>
      </div>
    </div>
  );
}
