import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>李炳運動電競館 LP ESports Stadium</h1>
        </Link>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            首頁
          </Link>
          <Link 
            to="/leaderboard" 
            className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
          >
            排行榜
          </Link>
          <Link 
            to="/score-input" 
            className={`nav-link ${location.pathname === '/score-input' ? 'active' : ''}`}
          >
            成績登記
          </Link>
          <Link 
            to="/showcase" 
            className={`nav-link ${location.pathname === '/showcase' ? 'active' : ''}`}
          >
            展示模式
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            管理員
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 