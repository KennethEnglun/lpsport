import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
// 導入頁面
// import Home, ScoreInput 等

function App() {
  return (
    <Router>
      <div className="app" style={{ background: '#1A1A1A', color: '#FFFF00', fontFamily: 'monospace' }}>
        <Routes>
          {/* 路由 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App; 