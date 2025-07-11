import React, { useState, useEffect } from 'react';
import './Leaderboard.css';
import { API_BASE_URL } from '../config';

interface Student {
  id: number;
  name_zh: string;
  name_en: string;
  student_number: string;
  class_name: string;
}

interface Sport {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

interface LeaderboardEntry {
  id: number;
  student_id: number;
  sport_id: number;
  time_min: number;
  time_sec: number;
  photo_path: string;
  name_zh: string;
  name_en: string;
  student_number: string;
  class_name: string;
  sport_name: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSport, selectedClass]);

  const fetchData = async () => {
    try {
      const [sportsRes, classesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/sports`),
        fetch(`${API_BASE_URL}/api/classes`)
      ]);
      
      const sportsData = await sportsRes.json();
      const classesData = await classesRes.json();
      
      setSports(sportsData);
      setClasses(classesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSport) params.append('sport_id', selectedSport);
      if (selectedClass) params.append('class_id', selectedClass);
      
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?${params}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const formatTime = (min: number, sec: number) => {
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-container">
        <h1 className="page-title">排行榜</h1>
        
        <div className="filters">
          <div className="filter-group">
            <label>運動類型：</label>
            <select 
              value={selectedSport} 
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              <option value="">全部</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>班別：</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">全部</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="leaderboard-table">
          {leaderboard.length === 0 ? (
            <p className="no-data">暫無成績記錄</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>照片</th>
                  <th>姓名</th>
                  <th>班別</th>
                  <th>學號</th>
                  <th>運動類型</th>
                  <th>成績</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={index < 5 ? 'top-five' : ''}>
                    <td className="rank">
                      {index + 1}
                      {index === 0 && <span className="medal gold">🥇</span>}
                      {index === 1 && <span className="medal silver">🥈</span>}
                      {index === 2 && <span className="medal bronze">🥉</span>}
                    </td>
                    <td className="photo">
                      {entry.photo_path && index < 5 ? (
                        <img 
                          src={`${API_BASE_URL}/${entry.photo_path}`} 
                          alt={entry.name_zh}
                          className="student-photo"
                        />
                      ) : (
                        <div className="no-photo">📷</div>
                      )}
                    </td>
                    <td className="name">{entry.name_zh}</td>
                    <td className="class">{entry.class_name}</td>
                    <td className="student-id">{entry.student_number}</td>
                    <td className="sport">{entry.sport_name}</td>
                    <td className="time">{formatTime(entry.time_min, entry.time_sec)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 