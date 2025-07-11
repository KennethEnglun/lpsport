const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const usePostgres = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;
let db;

if (usePostgres) {
  const { Pool } = require('pg');
  db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
} else {
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('./database.sqlite');
}

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/build', 'index.html')));
}

// 初始化資料庫（省略詳細，基於需求）
async function initDb() {
  // 創建表和預設資料
}

initDb();

// Admin登入（簡單JWT）
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  // 假設預設admin/admin，實際應從DB讀取
  if (username === 'admin' && password === 'admin') {
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 其他API端點（classes, students, sports, results, leaderboard, showcase）
// ... 實現基於需求

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 