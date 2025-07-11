# LP ESports Stadium - Railway部署版本

这是一个运动成绩管理系统，专门为Railway部署而优化。

## 功能特性

- 班别管理
- 学生管理（支持CSV批量导入）
- 运动类型管理
- 成绩记录与查询
- 排行榜展示
- 照片上传功能
- 管理员后台

## 技术栈

- **后端**: Node.js + Express
- **数据库**: PostgreSQL (生产环境) / SQLite (开发环境)
- **前端**: React + TypeScript
- **部署**: Railway

## 部署到Railway

### 1. 准备代码

确保你的代码已经推送到Git仓库（GitHub, GitLab等）。

### 2. 连接到Railway

1. 访问 [Railway.app](https://railway.app)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择 "Deploy from GitHub repo"
5. 选择你的仓库

### 3. 配置数据库

1. 在Railway项目中，点击 "Add Service"
2. 选择 "PostgreSQL"
3. Railway会自动创建数据库并设置 `DATABASE_URL` 环境变量

### 4. 环境变量配置

在Railway的环境变量设置中添加：

```
NODE_ENV=production
```

其他环境变量（如 `PORT`, `DATABASE_URL`）会由Railway自动设置。

### 5. 部署配置

Railway会自动识别你的 `package.json` 并运行构建命令：

- 构建命令: `npm run build`
- 启动命令: `npm start`

### 6. 访问应用

部署完成后，Railway会提供一个公共URL，你可以通过这个URL访问你的应用。

## 本地开发

### 安装依赖

```bash
npm install
```

### 安装前端依赖

```bash
cd frontend && npm install
```

### 安装后端依赖

```bash
cd backend && npm install
```

### 运行开发服务器

```bash
# 同时运行前端和后端
npm run dev

# 或者分别运行
# 后端
cd backend && npm run dev

# 前端
cd frontend && npm start
```

## 管理员登录

默认管理员密码: `admin123`

## 文件结构

```
├── server.js              # 生产环境服务器文件
├── package.json           # 根项目依赖
├── railway.json           # Railway配置文件
├── backend/               # 后端代码
│   ├── src/
│   │   └── index.js
│   └── package.json
├── frontend/              # 前端代码
│   ├── src/
│   ├── public/
│   └── package.json
└── uploads/               # 文件上传目录
```

## 注意事项

1. **文件上传**: 在生产环境中，上传的文件存储在临时目录中，重启后会丢失。如需持久化存储，建议使用云存储服务。

2. **数据库**: 生产环境使用PostgreSQL，开发环境使用SQLite。

3. **环境变量**: Railway会自动设置 `PORT` 和 `DATABASE_URL`，无需手动配置。

4. **CORS**: 生产环境中前后端同域，CORS配置会自动调整。

## 支持

如有问题，请查看Railway的部署日志或联系开发者。 