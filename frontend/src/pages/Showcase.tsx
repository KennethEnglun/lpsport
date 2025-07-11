import React, { useState, useEffect } from 'react';
import './Showcase.css';
import { API_BASE_URL } from '../config';

interface ShowcaseData {
  sport_id: number;
  sport_name: string;
  results: Array<{
    id: number;
    time_min: number;
    time_sec: number;
    name_zh: string;
    name_en: string;
    student_number: string;
    class_name: string;
    photo_path: string;
  }>;
}

const Showcase: React.FC = () => {
  const [showcaseData, setShowcaseData] = useState<ShowcaseData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchShowcaseData();
  }, []);

  useEffect(() => {
    if (showcaseData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseData.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showcaseData.length]);

  const fetchShowcaseData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/showcase`);
      const data = await response.json();
      setShowcaseData(data);
    } catch (error) {
      console.error('Error fetching showcase data:', error);
    }
  };

  const enterFullscreen = () => {
    setIsFullscreen(true);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const formatTime = (min: number, sec: number) => {
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (showcaseData.length === 0) {
    return (
      <div className="showcase">
        <div className="showcase-container">
          <h1 className="page-title">展示模式</h1>
          <p className="no-data">暫無數據</p>
        </div>
      </div>
    );
  }

  const currentSport = showcaseData[currentIndex];

  return (
    <div className={`showcase ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="showcase-container">
        {!isFullscreen && (
          <div className="showcase-header">
            <h1 className="page-title">展示模式</h1>
            <button className="fullscreen-button" onClick={enterFullscreen}>
              進入全螢幕
            </button>
          </div>
        )}

        {isFullscreen && (
          <button className="exit-fullscreen" onClick={exitFullscreen}>
            ✕
          </button>
        )}

        <div className="showcase-content">
          <div className="sport-header">
            <h2 className="sport-title">{currentSport.sport_name}</h2>
            <div className="sport-subtitle">全校排行榜</div>
          </div>

          <div className="leaderboard-showcase">
            {currentSport.results.length === 0 ? (
              <p className="no-results">暫無成績</p>
            ) : (
              <div className="results-grid">
                {currentSport.results.slice(0, 10).map((result, index) => (
                  <div key={result.id} className={`result-card ${index < 3 ? 'podium' : ''}`}>
                    <div className="rank">
                      #{index + 1}
                      {index === 0 && <span className="medal">🥇</span>}
                      {index === 1 && <span className="medal">🥈</span>}
                      {index === 2 && <span className="medal">🥉</span>}
                    </div>
                    {result.photo_path && index < 5 && (
                      <div className="photo-container">
                        <img 
                          src={`${API_BASE_URL}/${result.photo_path}`} 
                          alt={result.name_zh}
                          className="student-photo"
                        />
                      </div>
                    )}
                    <div className="student-info">
                      <div className="student-name">{result.name_zh}</div>
                      <div className="student-details">
                        <span className="class">{result.class_name}</span>
                        <span className="student-number">{result.student_number}</span>
                      </div>
                    </div>
                    <div className="time">
                      {formatTime(result.time_min, result.time_sec)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="showcase-footer">
            <div className="progress-indicator">
              {showcaseData.map((_, index) => (
                <div 
                  key={index} 
                  className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
            <div className="sport-counter">
              {currentIndex + 1} / {showcaseData.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase; 