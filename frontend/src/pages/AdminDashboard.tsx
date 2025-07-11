import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { API_BASE_URL } from '../config';

interface Class {
  id: number;
  name: string;
}

interface Sport {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name_zh: string;
  name_en: string;
  student_number: string;
  class_id: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [newSport, setNewSport] = useState({ name: '' });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [classError, setClassError] = useState('');
  const [sportError, setSportError] = useState('');

  const [newStudent, setNewStudent] = useState({
    class_id: '',
    student_number: '',
    name_zh: '',
    name_en: ''
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentError, setStudentError] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, sportsRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/classes`),
        fetch(`${API_BASE_URL}/api/sports`),
        fetch(`${API_BASE_URL}/api/students`)
      ]);
      const classesData = await classesRes.json();
      const sportsData = await sportsRes.json();
      const studentsData = await studentsRes.json();
      setClasses(classesData);
      setSports(sportsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassError('');
    if (!newClass.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClass })
      });
      if (response.ok) {
        const newClassData = await response.json();
        setClasses([...classes, newClassData]);
        setNewClass('');
      } else {
        const err = await response.json();
        setClassError(err.error || '新增失敗');
      }
    } catch (error) {
      setClassError('新增失敗');
    }
  };

  const handleEditClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingClass.name })
      });
      if (response.ok) {
        setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
        setEditingClass(null);
      }
    } catch (error) {
      console.error('Error editing class:', error);
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm('確定要刪除此班別嗎？')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/classes/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setClasses(classes.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const handleAddSport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSportError('');
    if (!newSport.name.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSport)
      });
      if (response.ok) {
        const newSportData = await response.json();
        setSports([...sports, newSportData]);
        setNewSport({ name: '' });
      } else {
        const err = await response.json();
        setSportError(err.error || '新增失敗');
      }
    } catch (error) {
      setSportError('新增失敗');
    }
  };

  const handleEditSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSport) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sports/${editingSport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingSport.name })
      });
      if (response.ok) {
        setSports(sports.map(s => s.id === editingSport.id ? editingSport : s));
        setEditingSport(null);
      }
    } catch (error) {
      console.error('Error editing sport:', error);
    }
  };

  const handleDeleteSport = async (id: number) => {
    if (!window.confirm('確定要刪除此運動類型嗎？')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/sports/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSports(sports.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting sport:', error);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');
    if (!newStudent.class_id || !newStudent.student_number || !newStudent.name_zh || !newStudent.name_en) {
      setStudentError('請填寫所有欄位');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (response.ok) {
        const newStudentData = await response.json();
        setStudents([...students, newStudentData]);
        setNewStudent({ class_id: '', student_number: '', name_zh: '', name_en: '' });
      } else {
        const err = await response.json();
        setStudentError(err.error || '新增失敗');
      }
    } catch (error) {
      setStudentError('新增失敗');
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStudent)
      });
      if (response.ok) {
        setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
        setEditingStudent(null);
      }
    } catch (error) {
      console.error('Error editing student:', error);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm('確定要刪除此學生嗎？')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setStudents(students.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setStudentError('請選擇CSV檔案');
      return;
    }
    setCsvLoading(true);
    setStudentError('');
    
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      
      const response = await fetch(`${API_BASE_URL}/api/students/bulk-import`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStudentError('');
        // 重新載入學生資料
        fetchData();
        setCsvFile(null);
        // 清空file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        alert(`${result.message}\n成功：${result.processed}筆\n失敗：${result.failed}筆`);
      } else {
        setStudentError(result.error || '上傳失敗');
      }
    } catch (error) {
      setStudentError('上傳失敗');
    } finally {
      setCsvLoading(false);
    }
  };

  const getClassName = (classId: number) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : '未知';
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>管理員後台</h1>
        <button className="logout-button" onClick={handleLogout}>
          登出
        </button>
      </div>
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          班別管理
        </button>
        <button 
          className={`tab-button ${activeTab === 'sports' ? 'active' : ''}`}
          onClick={() => setActiveTab('sports')}
        >
          運動類型
        </button>
        <button 
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          學生管理
        </button>
      </div>
      <div className="admin-content">
        {activeTab === 'classes' && (
          <div className="tab-content">
            <h2>班別管理</h2>
            <form onSubmit={handleAddClass} className="add-form">
              <input
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="輸入班別名稱"
                required
              />
              <button type="submit">新增班別</button>
            </form>
            {classError && <div className="error-message">{classError}</div>}
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>班別名稱</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cls => (
                    <tr key={cls.id}>
                      <td>{cls.id}</td>
                      <td>
                        {editingClass?.id === cls.id ? (
                          <input
                            type="text"
                            value={editingClass.name}
                            onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                          />
                        ) : (
                          cls.name
                        )}
                      </td>
                      <td>
                        {editingClass?.id === cls.id ? (
                          <>
                            <button onClick={handleEditClass}>保存</button>
                            <button onClick={() => setEditingClass(null)}>取消</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingClass(cls)}>編輯</button>
                            <button onClick={() => handleDeleteClass(cls.id)}>刪除</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'sports' && (
          <div className="tab-content">
            <h2>運動類型管理</h2>
            <form onSubmit={handleAddSport} className="add-form">
              <input
                type="text"
                value={newSport.name}
                onChange={(e) => setNewSport({ name: e.target.value })}
                placeholder="運動名稱"
                required
              />
              <button type="submit">新增運動類型</button>
            </form>
            {sportError && <div className="error-message">{sportError}</div>}
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>運動名稱</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sports.map(sport => (
                    <tr key={sport.id}>
                      <td>{sport.id}</td>
                      <td>
                        {editingSport?.id === sport.id ? (
                          <input
                            type="text"
                            value={editingSport.name}
                            onChange={(e) => setEditingSport({...editingSport, name: e.target.value})}
                          />
                        ) : (
                          sport.name
                        )}
                      </td>
                      <td>
                        {editingSport?.id === sport.id ? (
                          <>
                            <button onClick={handleEditSport}>保存</button>
                            <button onClick={() => setEditingSport(null)}>取消</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingSport(sport)}>編輯</button>
                            <button onClick={() => handleDeleteSport(sport.id)}>刪除</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'students' && (
          <div className="tab-content">
            <h2>學生管理</h2>
            <form onSubmit={handleAddStudent} className="add-form">
              <select
                value={newStudent.class_id}
                onChange={(e) => setNewStudent({...newStudent, class_id: e.target.value})}
                required
              >
                <option value="">選擇班別</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newStudent.student_number}
                onChange={(e) => setNewStudent({...newStudent, student_number: e.target.value})}
                placeholder="學號"
                required
              />
              <input
                type="text"
                value={newStudent.name_zh}
                onChange={(e) => setNewStudent({...newStudent, name_zh: e.target.value})}
                placeholder="中文姓名"
                required
              />
              <input
                type="text"
                value={newStudent.name_en}
                onChange={(e) => setNewStudent({...newStudent, name_en: e.target.value})}
                placeholder="英文姓名"
                required
              />
              <button type="submit">新增學生</button>
            </form>
            <div className="upload-section">
              <p>上傳CSV檔案來批量匯入學生資料</p>
              <p>CSV格式：班別,學號,中文姓名,英文姓名</p>
              <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              {csvLoading ? (
                <button disabled>上傳中...</button>
              ) : (
                <button onClick={handleCsvUpload}>上傳CSV</button>
              )}
            </div>
            {studentError && <div className="error-message">{studentError}</div>}
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>班別</th>
                    <th>學號</th>
                    <th>中文姓名</th>
                    <th>英文姓名</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 20).map(student => (
                    <tr key={student.id}>
                      <td>{student.id}</td>
                      <td>
                        {editingStudent?.id === student.id ? (
                          <select
                            value={editingStudent.class_id}
                            onChange={(e) => setEditingStudent({...editingStudent, class_id: parseInt(e.target.value)})}
                          >
                            {classes.map(cls => (
                              <option key={cls.id} value={cls.id}>
                                {cls.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          getClassName(student.class_id)
                        )}
                      </td>
                      <td>
                        {editingStudent?.id === student.id ? (
                          <input
                            type="text"
                            value={editingStudent.student_number}
                            onChange={(e) => setEditingStudent({...editingStudent, student_number: e.target.value})}
                          />
                        ) : (
                          student.student_number
                        )}
                      </td>
                      <td>
                        {editingStudent?.id === student.id ? (
                          <input
                            type="text"
                            value={editingStudent.name_zh}
                            onChange={(e) => setEditingStudent({...editingStudent, name_zh: e.target.value})}
                          />
                        ) : (
                          student.name_zh
                        )}
                      </td>
                      <td>
                        {editingStudent?.id === student.id ? (
                          <input
                            type="text"
                            value={editingStudent.name_en}
                            onChange={(e) => setEditingStudent({...editingStudent, name_en: e.target.value})}
                          />
                        ) : (
                          student.name_en
                        )}
                      </td>
                      <td>
                        {editingStudent?.id === student.id ? (
                          <>
                            <button onClick={handleEditStudent}>保存</button>
                            <button onClick={() => setEditingStudent(null)}>取消</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditingStudent(student)}>編輯</button>
                            <button onClick={() => handleDeleteStudent(student.id)}>刪除</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length > 20 && (
                <p>顯示前20筆記錄，共{students.length}筆</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 