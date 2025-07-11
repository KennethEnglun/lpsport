import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ScoreInput.css';
import { API_BASE_URL } from '../config';

interface Student {
  id: number;
  name_zh: string;
  name_en: string;
  student_number: string;
  class_id: number;
}

interface Sport {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

const ScoreInput: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentNumber, setStudentNumber] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [timeMin, setTimeMin] = useState<string>('');
  const [timeSec, setTimeSec] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClass && studentNumber) {
      findStudent();
    } else {
      setSelectedStudent(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, studentNumber]);

  const fetchData = async () => {
    try {
      const [classesRes, sportsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/classes`),
        fetch(`${API_BASE_URL}/api/sports`)
      ]);
      
      const classesData = await classesRes.json();
      const sportsData = await sportsRes.json();
      
      setClasses(classesData);
      setSports(sportsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const findStudent = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/search?class_id=${selectedClass}&student_number=${studentNumber}`);
      if (response.ok) {
        const student = await response.json();
        setSelectedStudent(student);
      } else {
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error finding student:', error);
      setSelectedStudent(null);
    }
  }, [selectedClass, studentNumber]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent || !selectedSport || !timeMin || !timeSec) {
      setMessage('請填寫所有必要資料');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('student_id', selectedStudent.id.toString());
      formData.append('sport_id', selectedSport);
      formData.append('time_min', timeMin);
      formData.append('time_sec', timeSec);
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch(`${API_BASE_URL}/api/results`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('成績已成功提交！');
        // 重置表單
        setSelectedClass('');
        setStudentNumber('');
        setSelectedStudent(null);
        setSelectedSport('');
        setTimeMin('');
        setTimeSec('');
        setPhoto(null);
        setPhotoPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setMessage(result.error || '提交失敗');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      setMessage('提交失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="score-input">
      <div className="score-input-container">
        <h1 className="page-title">成績登記</h1>
        
        <form onSubmit={handleSubmit} className="score-form">
          <div className="form-group">
            <label>班別：</label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">選擇班別</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>學號：</label>
            <input
              type="text"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
              placeholder="輸入學號"
              required
            />
          </div>

          {selectedStudent && (
            <div className="student-info">
              <h3>學生資料：</h3>
              <p><strong>姓名：</strong> {selectedStudent.name_zh}</p>
              <p><strong>班別：</strong> {classes.find(c => c.id === selectedStudent.class_id)?.name}</p>
              <p><strong>學號：</strong> {selectedStudent.student_number}</p>
            </div>
          )}

          <div className="form-group">
            <label>運動類型：</label>
            <select 
              value={selectedSport} 
              onChange={(e) => setSelectedSport(e.target.value)}
              required
            >
              <option value="">選擇運動類型</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <div className="time-input">
            <label>成績時間：</label>
            <div className="time-fields">
              <input
                type="number"
                value={timeMin}
                onChange={(e) => setTimeMin(e.target.value)}
                placeholder="分"
                min="0"
                max="59"
                required
              />
              <span>:</span>
              <input
                type="number"
                value={timeSec}
                onChange={(e) => setTimeSec(e.target.value)}
                placeholder="秒"
                min="0"
                max="59"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>照片（可選）：</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              ref={fileInputRef}
            />
            {photoPreview && (
              <div className="photo-preview">
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '提交中...' : '提交成績'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreInput; 