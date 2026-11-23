import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { apiService } from '../services/apiService.js';
import { getInitials } from '../utils/formatters.js';

function formatRelativeTime(isoStr) {
  if (!isoStr) return 'Chưa rõ';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  const diffDays = Math.floor(diffSec / 86400);
  if (diffDays <= 30) return `${diffDays} ngày trước`;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDayGroup(isoStr) {
  if (!isoStr) return 'Không rõ ngày';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatTimeOnly(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function GitHubDashboardView() {
  const { activeProjectId, teamMembers, reload } = useProject();

  const [ghState, setGhState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  // Form kết nối / cấu hình
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [repoUrlInput, setRepoUrlInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [mappingDraft, setMappingDraft] = useState({});

  // Bộ lọc dòng thời gian
  const [memberFilter, setMemberFilter] = useState('all'); // 'all' | 'unmapped' | userId
  const [searchQuery, setSearchQuery] = useState('');

  const loadGithubDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getGithubDashboard(activeProjectId);
      setGhState(data);
      if (data?.config) {
        setRepoUrlInput(data.config.repo_url || '');
        setMappingDraft(data.config.member_mapping || {});
      } else {
        setRepoUrlInput('');
        setMappingDraft({});
      }
      setMemberFilter('all');
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu GitHub Dashboard');
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    loadGithubDashboard();
  }, [loadGithubDashboard]);

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrlInput.trim()) {
      setError('Vui lòng nhập đường dẫn Repository GitHub (ví dụ: https://github.com/owner/repo).');
      return;
    }
    try {
      setSyncing(true);
      setError('');
      const data = await apiService.connectGithub({
        projectId: activeProjectId,
        repoUrl: repoUrlInput.trim(),
        accessToken: tokenInput.trim() || undefined,
        memberMapping: mappingDraft
      });
      setGhState(data);
      setTokenInput('');
      setShowConfigPanel(false);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      setError('');
      const data = await apiService.syncGithub(activeProjectId);
      setGhState(data);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMapping = async () => {
    try {
      setSyncing(true);
      setError('');
      const data = await apiService.saveGithubMapping(activeProjectId, mappingDraft);
      setGhState(data);
      setShowConfigPanel(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Bạn muốn ngắt kết nối Repository GitHub khỏi đề tài này?')) return;
    try {
      setSyncing(true);
      await apiService.disconnectGithub(activeProjectId);
      setGhState({ connected: false, config: null, dashboard: null });
      setRepoUrlInput('');
      setMappingDraft({});
      setShowConfigPanel(false);
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const dashboard = ghState?.dashboard || null;
  const config = ghState?.config || null;
  const members = teamMembers?.members || [];

  // Danh sách các GitHub username phát hiện từ repo để gợi ý gắn cho thành viên
  const detectedLogins = useMemo(() => {
    const set = new Set();
    (dashboard?.contributors || []).forEach(c => c.login && set.add(c.login));
    (dashboard?.commits || []).forEach(c => c.authorLogin && set.add(c.authorLogin));
    return Array.from(set);
  }, [dashboard]);

  // Lọc danh sách commit theo thành viên & từ khóa
  const filteredCommits = useMemo(() => {
    const list = dashboard?.commits || [];
    return list.filter(c => {
      if (memberFilter === 'unmapped' && c.mappedUserId) return false;
      if (memberFilter !== 'all' && memberFilter !== 'unmapped' && c.mappedUserId !== memberFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${c.message} ${c.authorName} ${c.authorLogin || ''} ${c.mappedUserName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dashboard, memberFilter, searchQuery]);

  // Gom nhóm commit theo ngày cho Dòng thời gian (Timeline)
  const groupedTimeline = useMemo(() => {
    const groups = [];
    const byDay = new Map();
    filteredCommits.forEach(c => {
      const dayKey = formatDayGroup(c.date);
      if (!byDay.has(dayKey)) {
        const entry = { day: dayKey, items: [] };
        byDay.set(dayKey, entry);
        groups.push(entry);
      }
      byDay.get(dayKey).items.push(c);
    });
    return groups;
  }, [filteredCommits]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
        Đang tải dữ liệu kết nối GitHub Dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '32px' }} data-tour-id="tour-github-dashboard">
      {/* 1. THANH HEADER TRẠNG THÁI KẾT NỐI GITHUB */}
      <div
        style={{
          background: 'var(--surface-raised)',
          border: '1px solid var(--border)',
          borderTop: '3px solid #18181b',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '18px' }}>🐙</span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>
              {ghState?.connected ? `${config.repo_owner} / ${config.repo_name}` : 'Kết nối Repository GitHub Dự án'}
            </h3>
            {ghState?.connected && dashboard?.repo && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: dashboard.repo.visibility === 'private' ? '#fef3c7' : '#dcfce7',
                  color: dashboard.repo.visibility === 'private' ? '#b45309' : '#15803d',
                  border: dashboard.repo.visibility === 'private' ? '1px solid #fde68a' : '1px solid #bbf7d0'
                }}
              >
                {dashboard.repo.visibility === 'private' ? 'Private' : 'Public'} &bull; Nhánh: {dashboard.repo.defaultBranch}
              </span>
            )}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {ghState?.connected ? (
              <span>
                Đồng bộ lần cuối: <strong>{formatRelativeTime(config.last_synced_at)}</strong>
                {' '}&bull;{' '}
                <a href={config.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  Mở trên GitHub ↗
                </a>
              </span>
            ) : (
              'Gắn link Repository GitHub của nhóm để theo dõi dòng thời gian commit, các chức năng đã làm và tiến độ push code của từng thành viên.'
            )}
          </div>
        </div>

        {ghState?.connected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSyncNow}
              disabled={syncing}
              style={{ background: '#18181b', borderColor: '#18181b', fontWeight: 700 }}
            >
              {syncing ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ GitHub'}
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowConfigPanel(v => !v)}
              style={{ fontWeight: 600 }}
            >
              ⚙️ {showConfigPanel ? 'Đóng cấu hình' : 'Đổi Repo & Gắn thành viên'}
            </button>
          </div>
        )}
      </div>

      {/* Thông báo lỗi hoặc cảnh báo đồng bộ */}
      {(error || ghState?.syncWarning) && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600
          }}
        >
          ⚠️ {error || ghState?.syncWarning}
        </div>
      )}

      {/* 2. FORM KẾT NỐI HOẶC CẤU HÌNH MAPPING THÀNH VIÊN */}
      {(!ghState?.connected || showConfigPanel) && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <form onSubmit={handleConnectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
              {ghState?.connected ? 'Cập nhật Repository GitHub liên kết' : 'Bước 1: Nhập đường dẫn Repository GitHub của Nhóm'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">URL Repository GitHub (*)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrlInput}
                  onChange={e => setRepoUrlInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Personal Access Token (Tùy chọn cho Repo Private)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={config?.hasToken ? 'Đã lưu token (để trống nếu giữ nguyên)' : 'ghp_... (bỏ trống nếu Repo Public)'}
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                Repo Public không cần Token. Dữ liệu commit được lưu cache an toàn vào SQLite để cả Giảng viên và nhóm xem tức thì.
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {ghState?.connected && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleDisconnect} style={{ color: '#dc2626', borderColor: '#fecaca' }}>
                    Ngắt kết nối
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm" disabled={syncing} style={{ background: '#2563eb', fontWeight: 700 }}>
                  {syncing ? 'Đang kết nối...' : '🔗 Lưu & Đồng bộ dữ liệu GitHub'}
                </button>
              </div>
            </div>
          </form>

          {/* Bảng Gắn Tài khoản GitHub cho từng Thành viên */}
          {ghState?.connected && members.length > 0 && (
            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)' }}>
                    Ánh xạ Thành viên Nhóm &harr; GitHub Username
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Giúp hệ thống biết chính xác commit nào trên GitHub do sinh viên nào trong nhóm push lên.
                  </div>
                </div>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveMapping} disabled={syncing} style={{ fontWeight: 700 }}>
                  💾 Lưu ánh xạ thành viên
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '10px' }}>
                {members.map(m => (
                  <div
                    key={m.ma_nguoi_dung}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--surface-subtle)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text)' }}>
                        {m.ho_ten} {m.vai_tro_trong_nhom === 'nhom_truong' ? '⭐' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        {m.vai_tro_trong_nhom === 'nhom_truong' ? 'Nhóm trưởng' : 'Thành viên'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="text"
                        list={`gh-logins-${m.ma_nguoi_dung}`}
                        className="form-input"
                        placeholder="GitHub username..."
                        value={mappingDraft[m.ma_nguoi_dung] || ''}
                        onChange={e => setMappingDraft(prev => ({ ...prev, [m.ma_nguoi_dung]: e.target.value }))}
                        style={{ width: '150px', padding: '5px 8px', fontSize: '12px' }}
                      />
                      <datalist id={`gh-logins-${m.ma_nguoi_dung}`}>
                        {detectedLogins.map(lg => (
                          <option key={lg} value={lg} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. DASHBOARD CHÍNH KHI ĐÃ CÓ DỮ LIỆU GITHUB */}
      {ghState?.connected && dashboard && (
        <>
          {/* Hàng KPI tóm tắt Repo */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', borderTop: '3px solid #2563eb' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Commit Gần Đây</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>{dashboard.commits?.length || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Lần push gần nhất: {formatRelativeTime(dashboard.commits?.[0]?.date)}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', borderTop: '3px solid #16a34a' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Người Đóng Góp</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>{dashboard.contributors?.length || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Tài khoản GitHub đã push</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', borderTop: '3px solid #7c3aed' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Nhánh (Branches)</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#6d28d9', marginTop: '2px' }}>{dashboard.branches?.length || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Chính: {dashboard.repo?.defaultBranch}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', borderTop: '3px solid #d97706' }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Pull Requests</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309', marginTop: '2px' }}>{dashboard.pulls?.length || 0}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                {(dashboard.pulls || []).filter(p => p.state === 'merged').length} đã merge &bull; {(dashboard.pulls || []).filter(p => p.state === 'open').length} đang mở
              </div>
            </div>
          </div>

          {/* Đóng góp theo từng Thành viên trong Nhóm */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>
                👥 Mức độ Đóng góp &amp; Push Code của Thành viên
              </h4>
              <span style={{ fontSize: '11.5px', color: 'var(--text-subtle)' }}>
                Nhấn vào thẻ thành viên để lọc dòng thời gian bên dưới
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {(dashboard.memberStats || []).map(ms => {
                const isSelected = memberFilter === ms.ma_nguoi_dung;
                return (
                  <div
                    key={ms.ma_nguoi_dung}
                    onClick={() => setMemberFilter(prev => prev === ms.ma_nguoi_dung ? 'all' : ms.ma_nguoi_dung)}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid var(--border)',
                      background: isSelected ? '#eff6ff' : 'var(--surface-raised)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {ms.avatarUrl ? (
                          <img src={ms.avatarUrl} alt={ms.ho_ten} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#18181b', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getInitials(ms.ho_ten)}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ms.ho_ten} {ms.vai_tro_trong_nhom === 'nhom_truong' ? '⭐' : ''}
                          </div>
                          <div style={{ fontSize: '11px', color: ms.github_username ? '#2563eb' : 'var(--text-subtle)', fontWeight: 600 }}>
                            {ms.github_username ? `@${ms.github_username}` : 'Chưa gắn GitHub username'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: ms.recentCommitCount > 0 ? '#15803d' : '#b45309' }}>
                          {ms.recentCommitCount}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-subtle)' }}>commits ({ms.sharePercent}%)</div>
                      </div>
                    </div>

                    {/* Thanh tiến độ tỷ trọng đóng góp */}
                    <div style={{ height: '5px', background: '#e4e4e7', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ms.sharePercent}%`, background: '#2563eb' }} />
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ms.latestCommit
                        ? `Gần nhất (${formatRelativeTime(ms.latestCommit.date)}): ${ms.latestCommit.message.split('\n')[0]}`
                        : 'Chưa có commit gần đây được khớp với thành viên này'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. DÒNG THỜI GIAN LÀM VIỆC (TIMELINE) + PULL REQUESTS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)', gap: '16px', alignItems: 'start' }}>
            {/* Cột trái: Timeline "Đã làm được gì" */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: 'var(--text)' }}>
                  🕒 Dòng thời gian làm việc — Đã làm được gì ({filteredCommits.length})
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={memberFilter}
                    onChange={e => setMemberFilter(e.target.value)}
                    className="form-select"
                    style={{ width: 'auto', padding: '4px 10px', fontSize: '12px' }}
                  >
                    <option value="all">Tất cả thành viên</option>
                    {members.map(m => (
                      <option key={m.ma_nguoi_dung} value={m.ma_nguoi_dung}>{m.ho_ten}</option>
                    ))}
                    <option value="unmapped">Chưa gắn thành viên</option>
                  </select>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tìm nội dung commit..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '170px', padding: '4px 10px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {groupedTimeline.length === 0 ? (
                <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '12.5px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                  Không tìm thấy commit nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {groupedTimeline.map(group => (
                    <div key={group.day} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '999px', width: 'fit-content' }}>
                        📅 Ngày {group.day} ({group.items.length} commit)
                      </div>

                      <div style={{ borderLeft: '2px solid #e4e4e7', marginLeft: '10px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {group.items.map(c => {
                          const firstLine = (c.message || '').split('\n')[0];
                          return (
                            <div
                              key={c.sha}
                              style={{
                                position: 'relative',
                                background: 'var(--surface-raised)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                                {c.authorAvatar ? (
                                  <img src={c.authorAvatar} alt={c.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', marginTop: '2px' }} />
                                ) : (
                                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#3f3f46', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {getInitials(c.mappedUserName || c.authorName)}
                                  </div>
                                )}
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>
                                    {firstLine}
                                  </div>
                                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <strong style={{ color: c.mappedUserName ? '#1d4ed8' : 'var(--text)' }}>
                                      {c.mappedUserName || c.authorName}
                                    </strong>
                                    {c.authorLogin && <span>(@{c.authorLogin})</span>}
                                    <span>&bull;</span>
                                    <span>{formatTimeOnly(c.date)} ({formatRelativeTime(c.date)})</span>
                                  </div>
                                </div>
                              </div>

                              <a
                                href={c.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: '#2563eb',
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  flexShrink: 0
                                }}
                                title="Xem chi tiết commit này trên GitHub"
                              >
                                {c.shortSha} ↗
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cột phải: Branches & Pull Requests */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                  🔀 Pull Requests gần đây
                </h4>
                {(dashboard.pulls || []).length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Chưa có Pull Request nào.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {dashboard.pulls.slice(0, 6).map(pr => (
                      <a
                        key={pr.number}
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: 'none',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--surface-raised)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            #{pr.number} {pr.title}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '999px',
                              flexShrink: 0,
                              background: pr.state === 'merged' ? '#f3e8ff' : (pr.state === 'open' ? '#dcfce7' : '#f4f4f5'),
                              color: pr.state === 'merged' ? '#6d28d9' : (pr.state === 'open' ? '#15803d' : '#52525b')
                            }}
                          >
                            {pr.state}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                          bởi @{pr.userLogin} &bull; {formatRelativeTime(pr.createdAt)}
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                  🌿 Các Nhánh (Branches)
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(dashboard.branches || []).map(b => (
                    <span
                      key={b.name}
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '6px',
                        background: b.name === dashboard.repo?.defaultBranch ? '#eff6ff' : 'var(--surface-subtle)',
                        color: b.name === dashboard.repo?.defaultBranch ? '#1d4ed8' : 'var(--text)',
                        border: b.name === dashboard.repo?.defaultBranch ? '1px solid #bfdbfe' : '1px solid var(--border)'
                      }}
                    >
                      {b.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
