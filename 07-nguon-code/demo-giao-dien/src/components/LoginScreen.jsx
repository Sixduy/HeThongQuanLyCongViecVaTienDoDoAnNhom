import React, { useState } from 'react';
import { CHIBI_ASSETS } from '../constants/chibiAssets.js';

// Danh sách 4 tài khoản mẫu chuẩn @gmail.com tương ứng đầy đủ 4 vai trò trong hệ thống
const DEMO_ACCOUNTS = [
  {
    email: 'khuyenbp@gmail.com',
    ho_ten: 'ThS. Bùi Phú Khuyên',
    vai_tro: 'Giảng viên phụ trách (GVPTMH)',
    color: '#7c3aed',
    bg: '#faf5ff'
  },
  {
    email: '2180606023@gmail.com',
    ho_ten: 'Đỗ Minh Trực',
    vai_tro: 'Nhóm trưởng (Nhóm 05)',
    color: '#1d4ed8',
    bg: '#eff6ff'
  },
  {
    email: '2280600494@gmail.com',
    ho_ten: 'Trần Minh Duy',
    vai_tro: 'Thành viên (Nhóm 05)',
    color: '#0f766e',
    bg: '#f0fdfa'
  },
  {
    email: '2280601508@gmail.com',
    ho_ten: 'Phạm Quỳnh Như',
    vai_tro: 'Sinh viên Chọn đề tài (Chưa có nhóm)',
    color: '#b45309',
    bg: '#fef3c7'
  }
];

export default function LoginScreen({ onLoginSuccess, onClose, canClose = true }) {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function submitLogin(loginEmail, loginPass) {
    if (!loginEmail.trim()) {
      setError('Vui lòng nhập email đăng nhập.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), mat_khau: loginPass })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại.');
        return;
      }
      onLoginSuccess(data.user);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Hãy kiểm tra server.js đang chạy.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    submitLogin(email, matKhau);
  }

  function handleQuickLogin(acc) {
    setEmail(acc.email);
    setMatKhau('demo');
    setError('');
  }

  return (
    <div
      className="login-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && canClose && onClose) {
          onClose();
        }
      }}
    >
      <div className="login-card" style={{ position: 'relative' }}>
        {canClose && onClose && (
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            title="Đóng cửa sổ đăng nhập"
            style={{ position: 'absolute', top: '14px', right: '16px' }}
          >
            ✕
          </button>
        )}

        {/* Logo + Tiêu đề chuẩn TasteSkill v2 / Linear nền sáng */}
        <div className="login-header">
          <img
            src={CHIBI_ASSETS.logos.gearTick}
            alt="DACS Logo"
            className="login-logo"
          />
          <h1 className="login-title">Đăng nhập Hệ thống</h1>
          <p className="login-subtitle">QUẢN LÝ CÔNG VIỆC &amp; TIẾN ĐỘ ĐỒ ÁN MÔN HỌC</p>
        </div>

        {/* Chọn nhanh tài khoản demo */}
        <div className="login-quick-section">
          <span className="login-quick-label">Chọn nhanh tài khoản demo:</span>
          <div className="login-quick-buttons">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                className={`login-quick-btn ${email === acc.email ? 'selected' : ''}`}
                style={{
                  borderColor: email === acc.email ? acc.color : '#e4e4e7',
                  background: email === acc.email ? acc.bg : '#fafafa',
                  color: acc.color
                }}
                onClick={() => handleQuickLogin(acc)}
              >
                <span className="login-quick-role">{acc.vai_tro}</span>
                <span className="login-quick-name">
                  {acc.ho_ten} <span style={{ fontWeight: 400, fontSize: '11.5px', color: '#71717a' }}>({acc.email})</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-divider"><span>hoặc nhập email trực tiếp</span></div>

        {/* Form đăng nhập */}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email (@gmail.com)</label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="example@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-pass">Mật khẩu</label>
            <div className="login-pass-wrap">
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                className="login-input"
                placeholder="Nhập mật khẩu (demo: bất kỳ)"
                value={matKhau}
                onChange={e => setMatKhau(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="login-show-pass"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
                title={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            <span className="login-hint">Môi trường demo học thuật: nhập mật khẩu bất kỳ đều hợp lệ.</span>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập vào Cổng Môn học →'}
          </button>
        </form>

        <p className="login-footer">
          Đồ án Cơ sở 2026 · Hệ thống Quản lý Đồ án Môn học
        </p>
      </div>
    </div>
  );
}
