import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 基本頁面組件
const Home = () => (
  <div className="page home-page">
    <h1 className="neon-text">LP ESports Stadium</h1>
    <p>歡迎來到運動成績管理系統</p>
    <div className="nav-buttons">
      <button className="neon-button">成績輸入</button>
      <button className="neon-button">排行榜</button>
      <button className="neon-button">展示模式</button>
      <button className="neon-button">管理員登入</button>
    </div>
  </div>
);

const ScoreInput = () => (
  <div className="page">
    <h2 className="neon-text">成績輸入</h2>
    <p>選擇學生和運動項目，輸入成績</p>
  </div>
);

const Leaderboard = () => (
  <div className="page">
    <h2 className="neon-text">排行榜</h2>
    <p>查看各項運動的成績排行</p>
  </div>
);

const Showcase = () => (
  <div className="page">
    <h2 className="neon-text">展示模式</h2>
    <p>分組顯示運動成績</p>
  </div>
);

const AdminLogin = () => (
  <div className="page">
    <h2 className="neon-text">管理員登入</h2>
    <form className="login-form">
      <input type="text" placeholder="使用者名稱" className="neon-input" />
      <input type="password" placeholder="密碼" className="neon-input" />
      <button type="submit" className="neon-button">登入</button>
    </form>
  </div>
);

const AdminDashboard = () => (
  <div className="page">
    <h2 className="neon-text">管理員面板</h2>
    <p>管理班級、學生、運動項目</p>
    <div className="admin-buttons">
      <button className="neon-button">下載CSV模板</button>
      <button className="neon-button">匯入CSV</button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="neon-nav">
          <a href="/" className="neon-link">首頁</a>
          <a href="/score-input" className="neon-link">成績輸入</a>
          <a href="/leaderboard" className="neon-link">排行榜</a>
          <a href="/showcase" className="neon-link">展示模式</a>
          <a href="/admin" className="neon-link">管理員</a>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/score-input" element={<ScoreInput />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
