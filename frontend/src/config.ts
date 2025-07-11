// API配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // 生产环境使用相对路径，前后端同域
  : 'http://localhost:5001'; // 开发环境使用后端端口

export { API_BASE_URL }; 