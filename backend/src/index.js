const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

// 数据库配置
const usePostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
let db;

if (usePostgres) {
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.resolve(__dirname, '../database.sqlite');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('無法連接SQLite資料庫:', err.message);
    } else {
      console.log('已連接到SQLite資料庫');
    }
  });
}

const app = express();
const PORT = process.env.PORT || 5001;

// 設定檔案上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 中介軟體
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // 靜態檔案服務

// 初始化資料表
const initDb = async () => {
  if (usePostgres) {
    try {
      console.log('初始化PostgreSQL資料表...');
      await db.query(`CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES classes(id),
        student_number VARCHAR(50) NOT NULL,
        name_zh VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NOT NULL
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS sports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        sport_id INTEGER REFERENCES sports(id),
        time_min INTEGER NOT NULL,
        time_sec INTEGER NOT NULL,
        photo_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, sport_id)
      )`);
      await db.query(`CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        ms_teams_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL
      )`);
      
      console.log('PostgreSQL資料表初始化完成');
      await addDefaultData();
    } catch (error) {
      console.error('PostgreSQL初始化錯誤:', error);
    }
  } else {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id INTEGER,
        student_number TEXT NOT NULL,
        name_zh TEXT NOT NULL,
        name_en TEXT NOT NULL,
        FOREIGN KEY(class_id) REFERENCES classes(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS sports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        sport_id INTEGER,
        time_min INTEGER NOT NULL,
        time_sec INTEGER NOT NULL,
        photo_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, sport_id),
        FOREIGN KEY(student_id) REFERENCES students(id),
        FOREIGN KEY(sport_id) REFERENCES sports(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ms_teams_id TEXT NOT NULL,
        name TEXT NOT NULL
      )`);
    });
    
    setTimeout(() => {
      addDefaultData();
    }, 1000);
  }
};

// 添加默认数据
const addDefaultData = async () => {
  try {
    // 检查并添加班别数据
    const classCheck = usePostgres 
      ? await db.query('SELECT COUNT(*) as count FROM classes')
      : await new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM classes', [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
    
    const classCount = usePostgres ? classCheck.rows[0].count : classCheck.count;
    
    if (classCount == 0) {
      console.log('添加預設班別資料...');
      const classes = ['高一甲', '高一乙', '高二甲', '高二乙', '高三甲', '高三乙'];
      
      for (const className of classes) {
        if (usePostgres) {
          await db.query('INSERT INTO classes (name) VALUES ($1)', [className]);
        } else {
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO classes (name) VALUES (?)', [className], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        console.log(`班別 ${className} 已添加`);
      }
    }
    
    // 检查并添加运动类型数据
    const sportCheck = usePostgres 
      ? await db.query('SELECT COUNT(*) as count FROM sports')
      : await new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM sports', [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
    
    const sportCount = usePostgres ? sportCheck.rows[0].count : sportCheck.count;
    
    if (sportCount == 0) {
      console.log('添加預設運動類型資料...');
      const sports = ['100公尺短跑', '200公尺短跑', '400公尺短跑', '800公尺中跑', '1500公尺長跑', '立定跳遠', '跳高', '鉛球'];
      
      for (const sportName of sports) {
        if (usePostgres) {
          await db.query('INSERT INTO sports (name) VALUES ($1)', [sportName]);
        } else {
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO sports (name) VALUES (?)', [sportName], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        console.log(`運動類型 ${sportName} 已添加`);
      }
    }
    
    // 检查并添加学生数据
    const studentCheck = usePostgres 
      ? await db.query('SELECT COUNT(*) as count FROM students')
      : await new Promise((resolve, reject) => {
          db.get('SELECT COUNT(*) as count FROM students', [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
    
    const studentCount = usePostgres ? studentCheck.rows[0].count : studentCheck.count;
    
    if (studentCount == 0) {
      console.log('添加預設學生資料...');
      const students = [
        { class_name: '高一甲', student_number: '001', name_zh: '陳大明', name_en: 'Chen Da Ming' },
        { class_name: '高一甲', student_number: '002', name_zh: '林小美', name_en: 'Lin Xiao Mei' },
        { class_name: '高一甲', student_number: '003', name_zh: '王志強', name_en: 'Wang Zhi Qiang' },
        { class_name: '高一乙', student_number: '001', name_zh: '張雅玲', name_en: 'Zhang Ya Ling' },
        { class_name: '高一乙', student_number: '002', name_zh: '李建華', name_en: 'Li Jian Hua' },
        { class_name: '高一乙', student_number: '003', name_zh: '劉思琪', name_en: 'Liu Si Qi' },
        { class_name: '高二甲', student_number: '001', name_zh: '黃文傑', name_en: 'Huang Wen Jie' },
        { class_name: '高二甲', student_number: '002', name_zh: '吳佳穎', name_en: 'Wu Jia Ying' },
        { class_name: '高二乙', student_number: '001', name_zh: '許志明', name_en: 'Xu Zhi Ming' },
        { class_name: '高二乙', student_number: '002', name_zh: '蔡雅雯', name_en: 'Cai Ya Wen' }
      ];
      
      for (const student of students) {
        const classResult = usePostgres 
          ? await db.query('SELECT id FROM classes WHERE name = $1', [student.class_name])
          : await new Promise((resolve, reject) => {
              db.get('SELECT id FROM classes WHERE name = ?', [student.class_name], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            });
        
        const classId = usePostgres ? classResult.rows[0]?.id : classResult?.id;
        
        if (classId) {
          if (usePostgres) {
            await db.query('INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES ($1, $2, $3, $4)', 
              [classId, student.student_number, student.name_zh, student.name_en]);
          } else {
            await new Promise((resolve, reject) => {
              db.run('INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES (?, ?, ?, ?)', 
                [classId, student.student_number, student.name_zh, student.name_en], function(err) {
                if (err) reject(err);
                else resolve();
              });
            });
          }
          console.log(`學生 ${student.name_zh} 已添加到 ${student.class_name}`);
        }
      }
    }
  } catch (error) {
    console.error('添加默認數據錯誤:', error);
  }
};

initDb();

// 測試API
app.get('/', (req, res) => {
  res.send('LP ESports Stadium API 運作中');
});

// 取得所有班別
app.get('/api/classes', async (req, res) => {
  try {
    if (usePostgres) {
      const result = await db.query('SELECT * FROM classes ORDER BY id');
      res.json(result.rows);
    } else {
      db.all('SELECT * FROM classes', [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增班別
app.post('/api/classes', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '班別名稱不能為空' });
  
  try {
    if (usePostgres) {
      const result = await db.query('INSERT INTO classes (name) VALUES ($1) RETURNING *', [name]);
      res.json(result.rows[0]);
    } else {
      db.run('INSERT INTO classes (name) VALUES (?)', [name], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 修改班別
app.put('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '班別名稱不能為空' });
  
  try {
    if (usePostgres) {
      const result = await db.query('UPDATE classes SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '班別不存在' });
      }
      res.json(result.rows[0]);
    } else {
      db.run('UPDATE classes SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id, name });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除班別
app.delete('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (usePostgres) {
      const result = await db.query('DELETE FROM classes WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: '班別不存在' });
      }
      res.json({ success: true });
    } else {
      db.run('DELETE FROM classes WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 取得所有學生（可選class_id查詢）
app.get('/api/students', async (req, res) => {
  const { class_id } = req.query;
  
  try {
    if (usePostgres) {
      let query = 'SELECT * FROM students';
      let params = [];
      
      if (class_id) {
        query += ' WHERE class_id = $1';
        params.push(class_id);
      }
      
      query += ' ORDER BY id';
      const result = await db.query(query, params);
      res.json(result.rows);
    } else {
      let sql = 'SELECT * FROM students';
      let params = [];
      if (class_id) {
        sql += ' WHERE class_id = ?';
        params.push(class_id);
      }
      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 依班別+學號查詢學生
app.get('/api/students/search', async (req, res) => {
  const { class_id, student_number } = req.query;
  if (!class_id || !student_number) {
    return res.status(400).json({ error: '缺少class_id或student_number' });
  }
  
  try {
    if (usePostgres) {
      const result = await db.query('SELECT * FROM students WHERE class_id = $1 AND student_number = $2', [class_id, student_number]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '找不到學生' });
      }
      res.json(result.rows[0]);
    } else {
      db.get('SELECT * FROM students WHERE class_id = ? AND student_number = ?', [class_id, student_number], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).json({ error: '找不到學生' });
        res.json(row);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增學生
app.post('/api/students', async (req, res) => {
  const { class_id, student_number, name_zh, name_en } = req.body;
  if (!class_id || !student_number || !name_zh || !name_en) {
    return res.status(400).json({ error: '資料不完整' });
  }
  
  try {
    if (usePostgres) {
      const result = await db.query(
        'INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES ($1, $2, $3, $4) RETURNING *',
        [class_id, student_number, name_zh, name_en]
      );
      res.json(result.rows[0]);
    } else {
      db.run('INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES (?, ?, ?, ?)', 
        [class_id, student_number, name_zh, name_en], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, class_id, student_number, name_zh, name_en });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 修改學生
app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { class_id, student_number, name_zh, name_en } = req.body;
  if (!class_id || !student_number || !name_zh || !name_en) {
    return res.status(400).json({ error: '資料不完整' });
  }
  
  try {
    if (usePostgres) {
      const result = await db.query(
        'UPDATE students SET class_id = $1, student_number = $2, name_zh = $3, name_en = $4 WHERE id = $5 RETURNING *',
        [class_id, student_number, name_zh, name_en, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '學生不存在' });
      }
      res.json(result.rows[0]);
    } else {
      db.run('UPDATE students SET class_id = ?, student_number = ?, name_zh = ?, name_en = ? WHERE id = ?', 
        [class_id, student_number, name_zh, name_en, id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id, class_id, student_number, name_zh, name_en });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除學生
app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (usePostgres) {
      const result = await db.query('DELETE FROM students WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: '學生不存在' });
      }
      res.json({ success: true });
    } else {
      db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 批量匯入學生（CSV上傳）
app.post('/api/students/bulk-import', upload.single('csvFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '請選擇CSV檔案' });
  }

  const fs = require('fs');
  const csvData = fs.readFileSync(req.file.path, 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return res.status(400).json({ error: 'CSV檔案為空' });
  }

  const students = [];
  const errors = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const fields = line.split(',').map(field => field.trim().replace(/"/g, ''));
    
    if (fields.length !== 4) {
      errors.push(`第${i + 1}行：格式錯誤，應為4個欄位`);
      continue;
    }
    
    const [className, studentNumber, nameZh, nameEn] = fields;
    
    if (!className || !studentNumber || !nameZh || !nameEn) {
      errors.push(`第${i + 1}行：資料不完整`);
      continue;
    }
    
    students.push({ className, studentNumber, nameZh, nameEn });
  }

  if (errors.length > 0) {
    // 清理上傳的檔案
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'CSV檔案有錯誤', details: errors });
  }

  // 處理學生資料
  let processedCount = 0;
  let failedCount = 0;
  const processedStudents = [];
  
  const processStudents = async () => {
    for (const student of students) {
      try {
        // 查找班別ID
        const classResult = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM classes WHERE name = ?', [student.className], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
        
        if (!classResult) {
          // 自動創建班別
          const newClass = await new Promise((resolve, reject) => {
            db.run('INSERT INTO classes (name) VALUES (?)', [student.className], function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID, name: student.className });
            });
          });
          
          // 插入學生
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES (?, ?, ?, ?)', 
              [newClass.id, student.studentNumber, student.nameZh, student.nameEn], function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID });
            });
          });
          
          processedStudents.push({
            ...student,
            class_id: newClass.id,
            id: this.lastID
          });
        } else {
          // 插入學生
          await new Promise((resolve, reject) => {
            db.run('INSERT INTO students (class_id, student_number, name_zh, name_en) VALUES (?, ?, ?, ?)', 
              [classResult.id, student.studentNumber, student.nameZh, student.nameEn], function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID });
            });
          });
          
          processedStudents.push({
            ...student,
            class_id: classResult.id,
            id: this.lastID
          });
        }
        
        processedCount++;
      } catch (error) {
        console.error('處理學生資料錯誤:', error);
        failedCount++;
      }
    }
    
    // 清理上傳的檔案
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: `成功匯入${processedCount}筆學生資料`,
      processed: processedCount,
      failed: failedCount,
      students: processedStudents
    });
  };
  
  processStudents().catch(error => {
    console.error('批量匯入錯誤:', error);
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: '批量匯入失敗' });
  });
});

// 取得所有運動類型
app.get('/api/sports', async (req, res) => {
  try {
    if (usePostgres) {
      const result = await db.query('SELECT * FROM sports ORDER BY id');
      res.json(result.rows);
    } else {
      db.all('SELECT * FROM sports', [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(rows);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增運動類型
app.post('/api/sports', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '運動名稱不能為空' });
  }
  
  try {
    if (usePostgres) {
      const result = await db.query('INSERT INTO sports (name) VALUES ($1) RETURNING *', [name]);
      res.json(result.rows[0]);
    } else {
      db.run('INSERT INTO sports (name) VALUES (?)', [name], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 修改運動類型
app.put('/api/sports/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: '運動名稱不能為空' });
  }
  
  try {
    if (usePostgres) {
      const result = await db.query('UPDATE sports SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: '運動類型不存在' });
      }
      res.json(result.rows[0]);
    } else {
      db.run('UPDATE sports SET name = ? WHERE id = ?', [name, id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id, name });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 刪除運動類型
app.delete('/api/sports/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (usePostgres) {
      const result = await db.query('DELETE FROM sports WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: '運動類型不存在' });
      }
      res.json({ success: true });
    } else {
      db.run('DELETE FROM sports WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 取得排行榜
app.get('/api/leaderboard', (req, res) => {
  const { sport_id, class_id } = req.query;
  let sql = `
    SELECT r.*, s.name_zh, s.name_en, s.student_number, c.name as class_name, sp.name as sport_name
    FROM results r
    JOIN students s ON r.student_id = s.id
    JOIN classes c ON s.class_id = c.id
    JOIN sports sp ON r.sport_id = sp.id
  `;
  let params = [];
  let conditions = [];
  
  if (sport_id) {
    conditions.push('r.sport_id = ?');
    params.push(sport_id);
  }
  if (class_id) {
    conditions.push('s.class_id = ?');
    params.push(class_id);
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ' ORDER BY r.time_min ASC, r.time_sec ASC';
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 新增成績（含拍照）
app.post('/api/results', upload.single('photo'), (req, res) => {
  const { student_id, sport_id, time_min, time_sec } = req.body;
  const photo_path = req.file ? req.file.path : null;
  
  if (!student_id || !sport_id || time_min === undefined || time_sec === undefined) {
    return res.status(400).json({ error: '資料不完整' });
  }
  
  // 檢查是否已有成績，如有則更新（保留最快成績）
  db.get('SELECT * FROM results WHERE student_id = ? AND sport_id = ?', [student_id, sport_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const newTimeTotal = parseInt(time_min) * 60 + parseInt(time_sec);
    
    if (row) {
      const existingTimeTotal = row.time_min * 60 + row.time_sec;
      if (newTimeTotal < existingTimeTotal) {
        // 新成績更快，更新記錄
        db.run('UPDATE results SET time_min = ?, time_sec = ?, photo_path = ?, created_at = CURRENT_TIMESTAMP WHERE student_id = ? AND sport_id = ?', 
          [time_min, time_sec, photo_path, student_id, sport_id], function(err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: '成績已更新（更快成績）', updated: true });
        });
      } else {
        res.json({ message: '現有成績更快，未更新', updated: false });
      }
    } else {
      // 新增成績
      db.run('INSERT INTO results (student_id, sport_id, time_min, time_sec, photo_path) VALUES (?, ?, ?, ?, ?)', 
        [student_id, sport_id, time_min, time_sec, photo_path], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, student_id, sport_id, time_min, time_sec, photo_path });
      });
    }
  });
});

// 修改成績
app.put('/api/results/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { time_min, time_sec } = req.body;
  const photo_path = req.file ? req.file.path : null;
  
  if (time_min === undefined || time_sec === undefined) {
    return res.status(400).json({ error: '時間資料不完整' });
  }
  
  let sql = 'UPDATE results SET time_min = ?, time_sec = ?';
  let params = [time_min, time_sec];
  
  if (photo_path) {
    sql += ', photo_path = ?';
    params.push(photo_path);
  }
  
  sql += ' WHERE id = ?';
  params.push(id);
  
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, time_min, time_sec, photo_path });
  });
});

// 刪除成績
app.delete('/api/results/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM results WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// 展示模式資料
app.get('/api/showcase', (req, res) => {
  const sql = `
    SELECT r.*, s.name_zh, s.name_en, s.student_number, c.name as class_name, sp.name as sport_name
    FROM results r
    JOIN students s ON r.student_id = s.id
    JOIN classes c ON s.class_id = c.id
    JOIN sports sp ON r.sport_id = sp.id
    ORDER BY sp.id, r.time_min ASC, r.time_sec ASC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // 按運動類型分組
    const groupedBySport = {};
    rows.forEach(row => {
      if (!groupedBySport[row.sport_id]) {
        groupedBySport[row.sport_id] = {
          sport_id: row.sport_id,
          sport_name: row.sport_name,
          results: []
        };
      }
      groupedBySport[row.sport_id].results.push(row);
    });
    
    res.json(Object.values(groupedBySport));
  });
});

app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`);
});
