// src/routes/index.tsx
import { RouteObject, useRoutes, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import NotFound from '../pages/NotFound';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Recipes from '../pages/Recipes';
import DocumentPage from '../pages/DocumentPage';

// 你可以把这个默认文档 id 换成自己的

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'recipes', element: <Recipes /> },

      // 新：文档路由（可直达 /docs/:id）
      { path: 'docs', element: <DocumentPage /> },
      { path: 'docs/:id', element: <DocumentPage /> },
      
      // 嵌套路由内的 404
      { path: '*', element: <NotFound /> },


    ],
  },

    // 认证区
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
];

export default function AppRouter() {
  return useRoutes(routes);
}
// 在 main/index.tsx 中使用：<BrowserRouter><AppRouter/></BrowserRouter>
