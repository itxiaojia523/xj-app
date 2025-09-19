// src/api/index.ts
import axios from 'axios';

// 1. 创建 axios 实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api', // 基础 URL
  timeout: 8000, // 请求超时
});

// 2. 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 统一加 token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// // 3. 响应拦截器
// api.interceptors.response.use(
//   (response) => {
//     return response.data; // 统一返回 data
//   },
//   (error) => {
//     if (error.response?.status === 401) {
//       console.error('未授权，请重新登录');
//       // 这里可以跳转到登录页
//     }
//     return Promise.reject(error);
//   }
// );

export default api;
