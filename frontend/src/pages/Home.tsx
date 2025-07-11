import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="home-container">
        <div className="logo-section">
          <img src="/logo192.png" alt="李炳運動電競館 LOGO" className="main-logo" />
          <p className="subtitle">李炳運動電競館龍虎榜</p>
          <div className="lightning-bolt">⚡</div>
        </div>

        <div className="menu-buttons">
          <Link to="/leaderboard" className="menu-button">
            <div className="button-icon">🏆</div>
            <span>排行榜</span>
          </Link>
          
          <Link to="/score-input" className="menu-button">
            <div className="button-icon">📝</div>
            <span>成績登記</span>
          </Link>
          
          <Link to="/showcase" className="menu-button">
            <div className="button-icon">🎮</div>
            <span>展示模式</span>
          </Link>
          
          <Link to="/admin" className="menu-button admin-button">
            <div className="button-icon">⚙️</div>
            <span>管理員登入</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 