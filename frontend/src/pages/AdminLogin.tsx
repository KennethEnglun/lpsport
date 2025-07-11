import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('密碼錯誤');
    }
    setLoading(false);
  };

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <h1 className="page-title">管理員登入</h1>
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>管理員密碼：</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入管理員密碼"
                required
              />
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? '登入中...' : '登入'}
            </button>
          </form>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="login-info">
            <p>暫時密碼: admin123</p>
            <small>未來將整合Microsoft Teams登入</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 